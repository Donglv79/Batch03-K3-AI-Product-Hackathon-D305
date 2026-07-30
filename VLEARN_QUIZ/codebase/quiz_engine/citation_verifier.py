"""Citation verification for generated quiz questions.

The product requirement is that learners can see a citation copied verbatim
from the source document. This verifier therefore uses exact substring checks:
the model-provided citation.quote must exist inside the chunk text referenced
by citation.source_id.
"""

from __future__ import annotations

from typing import Any


def verify_citations(quiz: dict[str, Any], document: dict[str, Any]) -> dict[str, Any]:
    """Add citation_status to each question and return the quiz object.

    Status values:
    - verified: source_id exists and quote is copied exactly from chunk.text
    - invalid_source_id: citation.source_id does not exist in input chunks
    - quote_not_found_in_source: quote is not an exact substring of chunk.text
    """
    chunk_map = {chunk["source_id"]: chunk for chunk in document["chunks"]}

    for question in quiz.get("questions", []):
        citation = question.get("citation", {})
        source_id = citation.get("source_id")
        quote = citation.get("quote", "")
        chunk = chunk_map.get(source_id)

        if not chunk:
            question["citation_status"] = "invalid_source_id"
            continue

        if quote not in chunk["text"]:
            question["citation_status"] = "quote_not_found_in_source"
            continue

        # Trust the source document for parent_source_id so downstream screens
        # can show the stable transcript section even if the model mistyped it.
        question["citation"]["parent_source_id"] = chunk["parent_source_id"]
        question["citation_status"] = "verified"

    return quiz


def filter_verified_questions(quiz: dict[str, Any]) -> list[dict[str, Any]]:
    """Return only questions with exact verified citations."""
    return [
        question
        for question in quiz.get("questions", [])
        if question.get("citation_status") == "verified"
    ]
