"""Main orchestration for the VLearn Quiz Engine."""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from .citation_verifier import filter_verified_questions, verify_citations
from .gemini_client import call_gemini, load_env_file
from .prompt_builder import build_prompt, select_chunks
from .schema import (
    SchemaValidationError,
    validate_config,
    validate_document_input,
    validate_generated_quiz,
)


class QuizGenerationError(RuntimeError):
    """Raised when the engine cannot produce a usable quiz."""


def parse_json_response(raw_text: str) -> dict[str, Any]:
    """Parse model output as JSON, including common Markdown-fenced responses."""
    text = raw_text.strip()
    if text.startswith("```"):
        lines = text.splitlines()
        if lines and lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].startswith("```"):
            lines = lines[:-1]
        text = "\n".join(lines).strip()

    try:
        parsed = json.loads(text)
    except json.JSONDecodeError as exc:
        raise QuizGenerationError(f"Gemini did not return valid JSON: {exc}") from exc

    if not isinstance(parsed, dict):
        raise QuizGenerationError("Gemini JSON response must be an object")
    return parsed


def normalize_quiz(
    quiz: dict[str, Any],
    document: dict[str, Any],
    config: dict[str, Any],
    model: str,
    warnings: list[str],
) -> dict[str, Any]:
    """Return the final output contract consumed by Student Flow and Dashboard."""
    now = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
    questions = quiz.get("questions", [])[: config["num_questions"]]

    for index, question in enumerate(questions, start=1):
        question["question_id"] = question.get("question_id") or f"q{index}"

    return {
        "schema_version": "1.0",
        "document_id": document["document_id"],
        "quiz_id": f"quiz_{document['document_id']}_{now.replace(':', '').replace('-', '')}",
        "status": "success" if len(questions) == config["num_questions"] else "partial",
        "created_at": now,
        "model": model,
        "config": {
            "num_questions": config["num_questions"],
            "question_type": config["question_type"],
            "difficulty": config["difficulty"],
        },
        "questions": questions,
        "warnings": warnings,
    }


def save_trace(
    trace_dir: str | Path,
    document: dict[str, Any],
    prompt: str,
    model_response: dict[str, Any],
    output: dict[str, Any],
) -> Path:
    """Save a trace that proves a real AI call was made."""
    path = Path(trace_dir)
    path.mkdir(parents=True, exist_ok=True)

    trace_path = path / f"{output['quiz_id']}.json"
    trace_payload = {
        "document_id": document["document_id"],
        "quiz_id": output["quiz_id"],
        "model": output["model"],
        "prompt": prompt,
        "raw_text": model_response["text"],
        "raw_response": model_response["raw"],
        "parsed_output": output,
    }
    trace_path.write_text(
        json.dumps(trace_payload, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    return trace_path


def generate_quiz(
    document: dict[str, Any],
    config: dict[str, Any] | None = None,
    env_path: str | Path | None = None,
    trace_dir: str | Path | None = None,
) -> dict[str, Any]:
    """Generate a grounded 15-question quiz from role-2 document JSON.

    Args:
        document: The exact JSON contract produced by the ingestion role.
        config: Optional overrides. Defaults to 15 single-choice questions.
        env_path: Path to .env containing GEMINI_API_KEY and optional MODEL.
        trace_dir: Optional directory for AI-call trace JSON files.

    Returns:
        Quiz JSON containing metadata, questions, citations, citation_status,
        and warnings.
    """
    validate_document_input(document)
    merged_config = validate_config(config)
    if env_path is None:
        env_path = Path(__file__).resolve().parents[2] / ".env"
    load_env_file(env_path)

    selected_chunks = select_chunks(document["chunks"])
    prompt = build_prompt(document, selected_chunks, merged_config)
    warnings: list[str] = []
    attempts = merged_config["max_retries"] + 1
    last_error: Exception | None = None

    for attempt in range(1, attempts + 1):
        try:
            model_response = call_gemini(prompt)
            parsed = parse_json_response(model_response["text"])
            validate_generated_quiz(parsed)

            verified = verify_citations(parsed, document)
            verified_questions = filter_verified_questions(verified)
            if len(verified_questions) < merged_config["num_questions"]:
                warnings.append(
                    "Only "
                    f"{len(verified_questions)}/{merged_config['num_questions']} "
                    "questions have verified exact citations"
                )

            verified["questions"] = verified_questions
            output = normalize_quiz(
                verified,
                document,
                merged_config,
                model_response["model"],
                warnings,
            )

            if trace_dir:
                trace_path = save_trace(trace_dir, document, prompt, model_response, output)
                output["trace_path"] = str(trace_path)

            return output
        except (QuizGenerationError, SchemaValidationError, RuntimeError) as exc:
            last_error = exc
            warnings.append(f"attempt_{attempt}_failed: {exc}")

    raise QuizGenerationError(f"Unable to generate quiz: {last_error}")


def generate_quiz_from_file(
    input_path: str | Path,
    output_path: str | Path | None = None,
    config: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """Convenience helper for local testing from a JSON file."""
    document = json.loads(Path(input_path).read_text(encoding="utf-8"))
    root = Path(input_path).resolve().parents[2]
    output = generate_quiz(
        document,
        config=config,
        env_path=root / ".env",
        trace_dir=root / "eval" / "traces",
    )

    if output_path:
        Path(output_path).write_text(
            json.dumps(output, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )

    return output
