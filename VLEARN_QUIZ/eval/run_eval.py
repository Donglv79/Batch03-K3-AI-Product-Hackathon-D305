"""Run the VLearn golden set and assert product requirements.

Unlike the legacy evaluator, a successful API response is not automatically a
PASS. Every case is checked for expected rejection, question count, schema,
verified exact citations, source id and required topic coverage.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
import unicodedata


EVAL_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = EVAL_DIR.parent
CODEBASE_DIR = PROJECT_ROOT / "codebase"
GOLDEN_SET_PATH = EVAL_DIR / "golden_set.json"
RESULTS_OUTPUT_PATH = EVAL_DIR / "run_results.json"
SUMMARY_MD_PATH = EVAL_DIR / "run_results.md"
TRACE_DIR = EVAL_DIR / "traces"

sys.path.insert(0, str(CODEBASE_DIR))

from quiz_engine.engine import generate_quiz  # noqa: E402
from quiz_engine.gemini_client import has_configured_api_key, load_env_file  # noqa: E402


def normalize(text: str) -> str:
    value = unicodedata.normalize("NFKD", text.casefold())
    value = "".join(char for char in value if not unicodedata.combining(char))
    value = value.replace("đ", "d")
    return " ".join(value.split())


def markdown_cell(value: str, limit: int = 240) -> str:
    """Keep multiline runtime errors from breaking the Markdown result table."""
    compact = " ".join(value.split()).replace("|", "\\|")
    return compact if len(compact) <= limit else compact[: limit - 1] + "…"


TOPIC_TOKEN_ALIASES: dict[str, tuple[str, ...]] = {
    "matrix": ("matrix", "ma tran"),
    "color": ("color", "mau"),
    "image": ("image", "anh"),
    "3d": ("3d", "3 chieu"),
    "grayscale": ("grayscale", "anh xam"),
    "formula": ("formula", "cong thuc", "="),
    "3": ("3", "ba"),
    "ml": ("ml", "machine learning"),
    "regression": ("regression", "hoi quy"),
    "classification": ("classification", "phan loai"),
    "outliers": ("outliers", "ngoai lai"),
    "learning": ("learning", "hoc"),
    "rate": ("rate", "toc do"),
    "cell": ("cell", "te bao"),
    "state": ("state", "trang thai"),
    "difference": ("difference", "hieu"),
    "saddle": ("saddle", "yen ngua"),
    "point": ("point", "diem"),
    "scale": ("scale", "ti le"),
    "invariant": ("invariant", "bat bien"),
    "skip": ("skip", "tat"),
    "connection": ("connection", "ket noi"),
}
TOPIC_STOP_TOKENS = {"vs", "of"}


def topic_is_covered(topic: str, serialized_output: str) -> bool:
    """Match rubric topic labels without penalizing English/Vietnamese wording."""
    tokens = [
        token
        for token in re.findall(r"[a-z0-9]+", normalize(topic))
        if token not in TOPIC_STOP_TOKENS
    ]
    return bool(tokens) and all(
        any(alias in serialized_output for alias in TOPIC_TOKEN_ALIASES.get(token, (token,)))
        for token in tokens
    )


def topic_coverage_text(questions: list[dict[str, Any]]) -> str:
    """Serialize only learning content, excluding citations and distractors.

    A source quote containing a keyword does not prove the generated quiz
    actually tests that topic.
    """
    fields: list[str] = []
    for question in questions:
        fields.extend(
            str(question.get(name, ""))
            for name in ("topic", "question", "explanation")
        )
        correct_id = question.get("correct_option_id")
        fields.extend(
            str(option.get("text", ""))
            for option in question.get("options", [])
            if option.get("id") == correct_id
        )
    return normalize(" ".join(fields))


def load_golden_set() -> list[dict[str, Any]]:
    data = json.loads(GOLDEN_SET_PATH.read_text(encoding="utf-8"))
    if not isinstance(data, list) or not data:
        raise ValueError("golden_set.json must be a non-empty array")
    return data


def build_document(case: dict[str, Any]) -> dict[str, Any]:
    context = case["input_lecture_context"]
    source_id = context["source_id"]
    text = context["text"]
    return {
        "schema_version": "1.0",
        "document_id": source_id.replace("#", "_").replace(".", "_"),
        "title": case["lecture_file"],
        "source_type": "text",
        "original_filename": case["lecture_file"],
        "status": "ready",
        "created_at": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "statistics": {"total_chunks": 1, "total_characters": len(text)},
        "chunks": [
            {
                "source_id": source_id,
                "parent_source_id": source_id,
                "chunk_index": 1,
                "text": text,
            }
        ],
    }


def expects_rejection(requirements: dict[str, Any]) -> bool:
    expected_status = str(requirements.get("expected_status", "")).upper()
    return "REJECT" in expected_status or "WARNING" in expected_status


def evaluate_output(case: dict[str, Any], output: dict[str, Any]) -> tuple[bool, list[str]]:
    requirements = case.get("expected_output_requirements", {})
    questions = output.get("questions", [])
    failures: list[str] = []

    if expects_rejection(requirements):
        if output.get("status") != "rejected":
            failures.append(f"expected rejected, got {output.get('status')!r}")
        if questions:
            failures.append(f"expected zero questions, got {len(questions)}")
        if not output.get("warnings"):
            failures.append("rejection must include an actionable warning")
        return not failures, failures

    if requirements.get("allow_rejection_or_strict_grounding") and output.get("status") == "rejected":
        if questions:
            failures.append(f"rejection must return zero questions, got {len(questions)}")
        if not output.get("warnings"):
            failures.append("rejection must include an actionable warning")
        return not failures, failures

    expected_count = int(requirements.get("question_count", 1))
    if output.get("status") != "success":
        failures.append(f"expected success, got {output.get('status')!r}")
    if len(questions) != expected_count:
        failures.append(f"expected {expected_count} questions, got {len(questions)}")

    expected_source = requirements.get("citation_must_match")
    serialized = normalize(json.dumps(questions, ensure_ascii=False))
    coverage = topic_coverage_text(questions)
    for index, question in enumerate(questions, start=1):
        prefix = f"q{index}"
        if question.get("citation_status") != "verified":
            failures.append(f"{prefix}: citation is not verified")
        citation = question.get("citation") or {}
        if expected_source and citation.get("source_id") != expected_source:
            failures.append(
                f"{prefix}: expected citation {expected_source!r}, got {citation.get('source_id')!r}"
            )
        if len(question.get("options", [])) != 4:
            failures.append(f"{prefix}: expected exactly four options")
        option_ids = {option.get("id") for option in question.get("options", [])}
        if question.get("correct_option_id") not in option_ids:
            failures.append(f"{prefix}: correct option does not exist")

    missing_topics = [
        topic
        for topic in requirements.get("must_contain_topics", [])
        if not topic_is_covered(topic, coverage)
    ]
    if missing_topics:
        failures.append(f"missing required topics: {missing_topics}")

    for forbidden in requirements.get("forbidden_terms", []):
        if normalize(forbidden) in serialized:
            failures.append(f"contains forbidden term: {forbidden}")

    return not failures, failures


def write_reports(results: list[dict[str, Any]]) -> dict[str, Any]:
    passed = sum(result["status"] == "PASS" for result in results)
    hard = [result for result in results if result["difficulty_class"] in {"Hard", "Edge Case"}]
    hard_passed = sum(result["status"] == "PASS" for result in hard)
    payload = {
        "timestamp": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "total_cases": len(results),
        "passed_cases": passed,
        "failed_cases": len(results) - passed,
        "overall_pass_rate_percent": round(passed / len(results) * 100, 2),
        "hard_cases_pass_rate_percent": round(hard_passed / len(hard) * 100, 2) if hard else 0.0,
        "quality_bar_passed": passed / len(results) >= 0.8,
        "results": results,
    }
    RESULTS_OUTPUT_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")

    lines = [
        "# Corrected Evaluation Run",
        "",
        f"- Thời gian: `{payload['timestamp']}`",
        f"- Tổng: `{passed}/{len(results)}` (`{payload['overall_pass_rate_percent']}%`)",
        f"- Hard/edge: `{hard_passed}/{len(hard)}` (`{payload['hard_cases_pass_rate_percent']}%`)",
        f"- Quality bar 80%: `{'PASS' if payload['quality_bar_passed'] else 'FAIL'}`",
        "- Lưu ý: script tự động enforce schema/exact citation; semantic review được ghi riêng tại `manual_review.md`.",
        "",
        "| Case | Loại | Kết quả | Lý do |",
        "|---|---|:---:|---|",
    ]
    for result in results:
        reason = "; ".join(result["failures"]) if result["failures"] else "All automated assertions passed"
        lines.append(
            f"| `{result['case_id']}` | {markdown_cell(result['category'])} | "
            f"{result['status']} | {markdown_cell(reason)} |"
        )
    SUMMARY_MD_PATH.write_text("\n".join(lines) + "\n", encoding="utf-8")
    return payload


def archive_latest_reports() -> None:
    """Preserve every measured run before replacing the latest report files."""
    if not RESULTS_OUTPUT_PATH.exists():
        return
    try:
        payload = json.loads(RESULTS_OUTPUT_PATH.read_text(encoding="utf-8"))
        timestamp = str(payload["timestamp"])
    except (json.JSONDecodeError, KeyError, TypeError):
        return
    run_id = re.sub(r"[^0-9A-Za-z]+", "-", timestamp).strip("-")
    archive_dir = EVAL_DIR / "runs"
    archive_dir.mkdir(parents=True, exist_ok=True)
    json_target = archive_dir / f"run_{run_id}.json"
    md_target = archive_dir / f"run_{run_id}.md"
    if not json_target.exists():
        json_target.write_text(RESULTS_OUTPUT_PATH.read_text(encoding="utf-8"), encoding="utf-8")
    if SUMMARY_MD_PATH.exists() and not md_target.exists():
        md_target.write_text(SUMMARY_MD_PATH.read_text(encoding="utf-8"), encoding="utf-8")


def run(case_filter: str | None = None) -> int:
    load_env_file(CODEBASE_DIR / ".env")
    if not has_configured_api_key():
        print("The configured provider API key is missing; refusing to create a fake baseline run.", file=sys.stderr)
        return 2

    archive_latest_reports()

    cases = load_golden_set()
    if case_filter:
        cases = [case for case in cases if case["case_id"] == case_filter]
        if not cases:
            print(f"Unknown case: {case_filter}", file=sys.stderr)
            return 2

    results: list[dict[str, Any]] = []
    for index, case in enumerate(cases, start=1):
        requirements = case.get("expected_output_requirements", {})
        expected_count = 1 if expects_rejection(requirements) else int(requirements.get("question_count", 1))
        print(f"[{index}/{len(cases)}] {case['case_id']}", flush=True)
        try:
            output = generate_quiz(
                build_document(case),
                config={
                    "num_questions": expected_count,
                    "question_type": "single_choice",
                    "difficulty": "medium",
                    "max_retries": 1,
                },
                env_path=CODEBASE_DIR / ".env",
                trace_dir=TRACE_DIR,
            )
            passed, failures = evaluate_output(case, output)
        except Exception as exc:
            output = {}
            passed = False
            failures = [f"runtime error: {exc}"]

        results.append(
            {
                "case_id": case["case_id"],
                "category": case["category"],
                "difficulty_class": case["difficulty_class"],
                "status": "PASS" if passed else "FAIL",
                "failures": failures,
                "output": output,
            }
        )

    payload = write_reports(results)
    print(f"Result: {payload['passed_cases']}/{payload['total_cases']} ({payload['overall_pass_rate_percent']}%)")
    return 0 if payload["quality_bar_passed"] else 1


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--case", help="Run one case id")
    args = parser.parse_args()
    return run(args.case)


if __name__ == "__main__":
    raise SystemExit(main())
