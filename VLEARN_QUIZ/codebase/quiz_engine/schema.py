"""Schema validation helpers for the VLearn Quiz Engine.

The input schema intentionally follows the exact JSON contract provided by the
data-ingestion role. Validation here is strict enough to catch integration
errors early, but it does not require fields that are not in that contract.
"""

from __future__ import annotations

from typing import Any


DEFAULT_CONFIG: dict[str, Any] = {
    "num_questions": 15,
    "question_type": "single_choice",
    "difficulty": "mixed",
    "require_citation": True,
    "max_retries": 1,
}


class SchemaValidationError(ValueError):
    """Raised when input or generated quiz JSON does not match the contract."""


def require_keys(obj: dict[str, Any], keys: list[str], path: str) -> None:
    """Raise a clear validation error when required keys are missing."""
    missing = [key for key in keys if key not in obj]
    if missing:
        raise SchemaValidationError(f"Missing required key(s) at {path}: {missing}")


def validate_document_input(document: dict[str, Any]) -> None:
    """Validate the exact document JSON produced by role 2.

    Expected input shape:
    {
      "schema_version": "1.0",
      "document_id": "...",
      "title": "...",
      "source_type": "transcript",
      "original_filename": "...",
      "status": "ready",
      "created_at": "...",
      "statistics": {"total_chunks": 2, "total_characters": 1200},
      "chunks": [{"source_id": "...", "parent_source_id": "...", ...}]
    }
    """
    if not isinstance(document, dict):
        raise SchemaValidationError("Document input must be a JSON object")

    require_keys(
        document,
        [
            "schema_version",
            "document_id",
            "title",
            "source_type",
            "original_filename",
            "status",
            "created_at",
            "statistics",
            "chunks",
        ],
        "document",
    )

    if document["status"] != "ready":
        raise SchemaValidationError("Document status must be 'ready'")

    if not isinstance(document["statistics"], dict):
        raise SchemaValidationError("document.statistics must be an object")

    require_keys(
        document["statistics"],
        ["total_chunks", "total_characters"],
        "document.statistics",
    )

    chunks = document["chunks"]
    if not isinstance(chunks, list) or not chunks:
        raise SchemaValidationError("document.chunks must be a non-empty array")

    seen_source_ids: set[str] = set()
    for index, chunk in enumerate(chunks):
        path = f"document.chunks[{index}]"
        if not isinstance(chunk, dict):
            raise SchemaValidationError(f"{path} must be an object")

        require_keys(
            chunk,
            ["source_id", "parent_source_id", "chunk_index", "text"],
            path,
        )

        if not isinstance(chunk["source_id"], str) or not chunk["source_id"].strip():
            raise SchemaValidationError(f"{path}.source_id must be a non-empty string")

        if chunk["source_id"] in seen_source_ids:
            raise SchemaValidationError(
                f"Duplicate source_id found: {chunk['source_id']}"
            )
        seen_source_ids.add(chunk["source_id"])

        if not isinstance(chunk["text"], str) or not chunk["text"].strip():
            raise SchemaValidationError(f"{path}.text must be a non-empty string")


def validate_config(config: dict[str, Any] | None) -> dict[str, Any]:
    """Merge user config with defaults and validate supported options."""
    merged = dict(DEFAULT_CONFIG)
    if config:
        merged.update(config)

    num_questions = merged.get("num_questions")
    if not isinstance(num_questions, int) or num_questions <= 0:
        raise SchemaValidationError("config.num_questions must be a positive integer")

    if merged.get("question_type") != "single_choice":
        raise SchemaValidationError("Only single_choice questions are supported")

    return merged


def validate_generated_quiz(quiz: dict[str, Any]) -> None:
    """Validate the model output after JSON parsing."""
    require_keys(quiz, ["questions"], "quiz")
    if not isinstance(quiz["questions"], list):
        raise SchemaValidationError("quiz.questions must be an array")

    for index, question in enumerate(quiz["questions"]):
        path = f"quiz.questions[{index}]"
        if not isinstance(question, dict):
            raise SchemaValidationError(f"{path} must be an object")

        require_keys(
            question,
            [
                "question_id",
                "type",
                "topic",
                "difficulty",
                "question",
                "options",
                "correct_option_id",
                "explanation",
                "citation",
            ],
            path,
        )

        if question["type"] != "single_choice":
            raise SchemaValidationError(f"{path}.type must be 'single_choice'")

        options = question["options"]
        if not isinstance(options, list) or len(options) != 4:
            raise SchemaValidationError(f"{path}.options must contain exactly 4 options")

        option_ids = []
        for option_index, option in enumerate(options):
            option_path = f"{path}.options[{option_index}]"
            require_keys(option, ["id", "text"], option_path)
            option_ids.append(option["id"])

        if question["correct_option_id"] not in option_ids:
            raise SchemaValidationError(
                f"{path}.correct_option_id must match one option id"
            )

        citation = question["citation"]
        if not isinstance(citation, dict):
            raise SchemaValidationError(f"{path}.citation must be an object")
        require_keys(citation, ["source_id", "parent_source_id", "quote"], f"{path}.citation")
