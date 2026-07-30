"""Prompt construction for Gemini quiz generation."""

from __future__ import annotations

import json
from typing import Any


MAX_PROMPT_CHARS = 45000


def select_chunks(chunks: list[dict[str, Any]], max_chars: int = MAX_PROMPT_CHARS) -> list[dict[str, Any]]:
    """Select chunks while staying within a conservative prompt budget.

    This keeps integration simple for the hackathon. If the document is too
    large, we take chunks in source order until max_chars is reached.
    """
    selected: list[dict[str, Any]] = []
    used_chars = 0

    for chunk in chunks:
        text = chunk["text"].strip()
        projected = used_chars + len(text)
        if selected and projected > max_chars:
            break
        selected.append(
            {
                "source_id": chunk["source_id"],
                "parent_source_id": chunk["parent_source_id"],
                "chunk_index": chunk["chunk_index"],
                "text": text,
            }
        )
        used_chars = projected

    return selected


def build_prompt(document: dict[str, Any], selected_chunks: list[dict[str, Any]], config: dict[str, Any]) -> str:
    """Build a strict prompt that asks Gemini for JSON-only quiz output."""
    source_payload = {
        "document_id": document["document_id"],
        "title": document["title"],
        "source_type": document["source_type"],
        "chunks": selected_chunks,
    }

    return f"""
You are the VLearn Quiz Engine. Generate a grounded quiz for Vietnamese learners.

Hard rules:
- Return valid JSON only. Do not wrap it in Markdown.
- Generate exactly {config["num_questions"]} single-choice questions.
- Requested difficulty is {config["difficulty"]}. When it is easy, medium, or hard,
  all questions must use that difficulty. When it is mixed or all, use a sensible mix.
- Each question must have exactly 4 options with ids A, B, C, D.
- Each question must have one correct_option_id.
- Use only the provided chunks as source material.
- citation.source_id must be copied from one provided chunk.source_id.
- citation.parent_source_id must be copied from that same chunk.parent_source_id.
- citation.quote must be copied exactly from that chunk.text.
- Do not paraphrase citation.quote.
- If the source does not support a question with an exact quote, do not create that question.
- Explanations must be short and must not introduce facts outside the source chunks.
- Prefer conceptual questions over memorizing isolated wording.
- Topics should be concise labels useful for a knowledge gap map.

Required JSON shape:
{{
  "questions": [
    {{
      "question_id": "q1",
      "type": "single_choice",
      "topic": "short topic label",
      "difficulty": "easy|medium|hard",
      "question": "question text",
      "options": [
        {{"id": "A", "text": "option text"}},
        {{"id": "B", "text": "option text"}},
        {{"id": "C", "text": "option text"}},
        {{"id": "D", "text": "option text"}}
      ],
      "correct_option_id": "A",
      "explanation": "short explanation grounded in the quote",
      "citation": {{
        "source_id": "source id from chunks",
        "parent_source_id": "parent source id from same chunk",
        "quote": "exact quote copied from chunk text"
      }}
    }}
  ]
}}

Source chunks:
{json.dumps(source_payload, ensure_ascii=False, indent=2)}
""".strip()
