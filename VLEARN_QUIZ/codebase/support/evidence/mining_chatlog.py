"""Reproducible evidence mining for the VLearn Quiz product.

The script reads the anonymized hackathon chatlog and writes a compact Markdown
report. It intentionally uses deterministic keyword rules so another reviewer
can rerun and audit every count.
"""

from __future__ import annotations

import csv
import json
from collections.abc import Iterable
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[2]
INPUT_PATH = REPO_ROOT / "data" / "vlearn-pack" / "chatlog" / "chat_history_anonymized_for_hackathon.csv"
OUTPUT_PATH = Path(__file__).resolve().parent / "mining_report.md"

SUMMARY_KEYWORDS = ("tóm tắt", "tóm gọn", "tổng hợp")
EXPLANATION_KEYWORDS = (
    "giải thích",
    "không hiểu",
    "chưa hiểu",
    "tại sao",
    "vì sao",
    "nghĩa là gì",
)
QUIZ_KEYWORDS = ("quiz", "quizz", "kiểm tra", "câu hỏi", "bài tập", "đánh giá", "hiểu bài")
REFUSAL_KEYWORDS = (
    "không tìm thấy",
    "không có đủ",
    "không có nội dung",
    "không có thông tin",
    "không thể xác định",
    "không thể trả lời",
    "rất tiếc",
    "xin lỗi bạn",
)


def load_rows() -> list[dict[str, str]]:
    with INPUT_PATH.open(encoding="utf-8-sig", newline="") as handle:
        return list(csv.DictReader(handle))


def actual_student_query(row: dict[str, str]) -> str:
    """Remove the selected-slide metadata and return the final student query."""
    lines = [line.strip() for line in row["content"].splitlines() if line.strip()]
    return lines[-1] if lines else ""


def contains_any(text: str, keywords: Iterable[str]) -> bool:
    normalized = text.casefold()
    return any(keyword.casefold() in normalized for keyword in keywords)


def pct(part: int, whole: int) -> str:
    return f"{(part / whole * 100):.2f}%" if whole else "0.00%"


def unique_users(rows: list[dict[str, str]]) -> int:
    return len({row["user_id"] for row in rows})


def compact(text: str, limit: int = 280) -> str:
    normalized = " ".join(text.split())
    return normalized if len(normalized) <= limit else normalized[: limit - 1] + "…"


def quote_rows(rows: list[dict[str, str]], *, student_query: bool, limit: int = 5) -> list[str]:
    output: list[str] = []
    for row in rows[:limit]:
        text = actual_student_query(row) if student_query else row["content"]
        output.append(
            f'- `{row["conversation_id"]}` / `{row["turn_id"]}`: “{compact(text)}”'
        )
    return output


def build_report(rows: list[dict[str, str]]) -> str:
    students = [row for row in rows if row["role"] == "student"]
    tutors = [row for row in rows if row["role"] == "tutor"]

    summary = [row for row in students if contains_any(actual_student_query(row), SUMMARY_KEYWORDS)]
    explanation = [row for row in students if contains_any(actual_student_query(row), EXPLANATION_KEYWORDS)]
    quiz = [row for row in students if contains_any(actual_student_query(row), QUIZ_KEYWORDS)]
    refusal = [row for row in tutors if contains_any(row["content"], REFUSAL_KEYWORDS)]
    no_citation = [row for row in tutors if not json.loads(row["citations"] or "[]")]
    check_question = [
        row for row in tutors if row["asked_check_question"].strip().casefold() == "true"
    ]
    misconception = [row for row in tutors if json.loads(row["misconceptions"] or "[]")]
    follow_ups = [row for row in tutors if json.loads(row["follow_ups"] or "[]")]

    lines = [
        "# Evidence mining — nhu cầu kiểm tra hiểu bài trên VLearn",
        "",
        "## Kết luận",
        "",
        (
            f"Trong `{len(tutors)}` lượt trả lời tutor, chỉ `{len(check_question)}` lượt "
            f"(`{pct(len(check_question), len(tutors))}`) chủ động hỏi lại để kiểm tra hiểu bài; "
            f"trường `misconceptions` có dữ liệu ở `{len(misconception)}` lượt và `follow_ups` "
            f"có dữ liệu ở `{len(follow_ups)}` lượt. Đây là khoảng trống trực tiếp mà quiz có "
            "trích dẫn và knowledge-gap map nhắm tới."
        ),
        "",
        "## Phạm vi dữ liệu",
        "",
        f"- File nguồn: `{INPUT_PATH.relative_to(REPO_ROOT).as_posix()}`.",
        f"- `{len(rows)}` messages = `{len(students)}` student + `{len(tutors)}` tutor.",
        f"- `{len({row['user_id'] for row in rows})}` users, `{len({row['conversation_id'] for row in rows})}` conversations.",
        "",
        "## Bảng kết quả",
        "",
        "| Tín hiệu | Số lượt | User duy nhất | Tỷ lệ trên tập tương ứng | Quy tắc |",
        "|---|---:|---:|---:|---|",
        f"| Tutor hỏi lại để kiểm tra hiểu bài | {len(check_question)} | {unique_users(check_question)} | {pct(len(check_question), len(tutors))} tutor replies | `asked_check_question = True` |",
        f"| Tutor phát hiện misconception | {len(misconception)} | {unique_users(misconception)} | {pct(len(misconception), len(tutors))} tutor replies | JSON `misconceptions` khác `[]` |",
        f"| Tutor tạo follow-up | {len(follow_ups)} | {unique_users(follow_ups)} | {pct(len(follow_ups), len(tutors))} tutor replies | JSON `follow_ups` khác `[]` |",
        f"| Tutor không có citation | {len(no_citation)} | {unique_users(no_citation)} | {pct(len(no_citation), len(tutors))} tutor replies | JSON `citations` bằng `[]` |",
        f"| Học viên chủ động yêu cầu quiz/kiểm tra | {len(quiz)} | {unique_users(quiz)} | {pct(len(quiz), len(students))} student messages | keyword trên câu hỏi thật |",
        f"| Học viên yêu cầu tóm tắt | {len(summary)} | {unique_users(summary)} | {pct(len(summary), len(students))} student messages | keyword trên câu hỏi thật |",
        f"| Học viên yêu cầu giải thích | {len(explanation)} | {unique_users(explanation)} | {pct(len(explanation), len(students))} student messages | keyword trên câu hỏi thật |",
        f"| Tutor báo thiếu/không tìm thấy nguồn | {len(refusal)} | {unique_users(refusal)} | {pct(len(refusal), len(tutors))} tutor replies | keyword từ chối/thiếu nguồn |",
        "",
        "## Ví dụ nguyên văn kiểm lại được",
        "",
        "### Yêu cầu quiz/kiểm tra",
        "",
        *quote_rows(quiz, student_query=True),
        "",
        "### Yêu cầu tóm tắt",
        "",
        *quote_rows(summary, student_query=True),
        "",
        "### Tutor báo thiếu nguồn",
        "",
        *quote_rows(refusal, student_query=False),
        "",
        "## Phương pháp và giới hạn",
        "",
        "1. Chỉ đọc message có `role=student` khi phân loại intent; bỏ phần metadata `(Trang …, đoạn được chọn …)` bằng cách lấy dòng không rỗng cuối cùng.",
        "2. Các phép đếm keyword là deterministic và có thể chạy lại bằng `python VLEARN_QUIZ/codebase/support/evidence/mining_chatlog.py`.",
        "3. Keyword có thể bỏ sót cách diễn đạt khác; vì vậy số intent là cận dưới, không được diễn giải thành toàn bộ nhu cầu của người học.",
        "4. Tín hiệu mạnh nhất là field sản phẩm (`asked_check_question`, `misconceptions`, `follow_ups`), không phụ thuộc phán đoán keyword.",
        "5. Mining chứng minh khoảng trống hành vi hiện tại; mức sẵn sàng sử dụng tính năng phải được xác nhận riêng bằng user validation thật.",
        "",
    ]
    return "\n".join(lines)


def main() -> int:
    report = build_report(load_rows())
    OUTPUT_PATH.write_text(report, encoding="utf-8")
    print(f"Wrote {OUTPUT_PATH}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
