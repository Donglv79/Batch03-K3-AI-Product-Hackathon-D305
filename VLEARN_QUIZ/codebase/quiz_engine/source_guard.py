"""Deterministic source checks before spending an AI call."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any


@dataclass(frozen=True)
class SourceIssue:
    code: str
    message: str


OUT_OF_SCOPE_GROUPS = (
    ("học phí", "phòng đào tạo"),
    ("lịch thi", "portal"),
    ("autoclicker", "nhấp chuột"),
)


def inspect_source(document: dict[str, Any]) -> SourceIssue | None:
    """Return a blocking source issue or ``None`` when generation is allowed.

    This is intentionally conservative. The prototype only blocks signals that
    are deterministic enough to explain to a learner; semantic grounding is
    still enforced by the exact citation verifier after generation.
    """
    combined = " ".join(chunk["text"].strip() for chunk in document["chunks"])
    normalized = combined.casefold()

    for keyword_group in OUT_OF_SCOPE_GROUPS:
        if all(keyword in normalized for keyword in keyword_group):
            return SourceIssue(
                "out_of_scope",
                "Nguồn có vẻ là nội dung hành chính hoặc hướng dẫn công cụ, không phải kiến thức bài giảng.",
            )

    if combined.rstrip().endswith(("...", "…")):
        return SourceIssue(
            "truncated_source",
            "Nguồn kết thúc giữa chừng nên không đủ chắc chắn để tạo câu hỏi.",
        )

    if len(combined) < 120:
        return SourceIssue(
            "insufficient_source",
            "Nguồn quá ngắn hoặc chỉ có tiêu đề; cần thêm nội dung bài giảng.",
        )

    return None
