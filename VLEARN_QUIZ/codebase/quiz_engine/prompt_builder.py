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
- Each question must have exactly 4 options with ids A, B, C, D.
- Each question must have one correct_option_id.
- Use only the provided chunks as source material.
- Do not create questions from title slides, agenda/outline slides, instructor biography, contact information, sponsor/logistics, or general welcome/introduction slides.
- All questions, topics, options, and explanations MUST be written in natural, clear Vietnamese with proper diacritics (Tiếng Việt có dấu chuẩn).
- Cover all major lesson concepts/topics represented in the remaining academic content. Avoid repeatedly asking about the same small detail.
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
      "topic": "short topic label in Vietnamese",
      "difficulty": "easy|medium|hard",
      "question": "question text in Vietnamese with proper diacritics",
      "options": [
        {{"id": "A", "text": "option text in Vietnamese"}},
        {{"id": "B", "text": "option text in Vietnamese"}},
        {{"id": "C", "text": "option text in Vietnamese"}},
        {{"id": "D", "text": "option text in Vietnamese"}}
      ],
      "correct_option_id": "A",
      "explanation": "short explanation in Vietnamese with proper diacritics",
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
