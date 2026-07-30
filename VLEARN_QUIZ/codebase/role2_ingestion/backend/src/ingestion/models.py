"""JSON contract helpers for the Role 2 ingestion flow."""

from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path
from typing import Any
import re


SCHEMA_VERSION = "1.0"


def now_iso_utc() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def slugify(value: str) -> str:
    value = value.strip().lower()
    value = re.sub(r"[^a-z0-9]+", "_", value)
    value = re.sub(r"_+", "_", value).strip("_")
    return value or "document"


def infer_document_id(original_filename: str, source_type: str, fallback_index: int = 1) -> str:
    stem = Path(original_filename).stem.lower()
    transcript_match = re.search(r"transcript[-_]?(\d+)", stem)
    if source_type == "transcript" and transcript_match:
        return f"transcript_{int(transcript_match.group(1)):02d}"

    slide_match = re.search(r"(?:slide|d)(\d+)", stem)
    if source_type == "pdf" and slide_match:
        return f"slide_{int(slide_match.group(1)):02d}"

    return f"{slugify(stem)}_{fallback_index:02d}"


def infer_title(original_filename: str, source_type: str) -> str:
    stem = Path(original_filename).stem
    cleaned = stem.replace("-", " ").replace("_", " ").strip()
    if source_type == "transcript":
        cleaned = re.sub(r"\bclean\b", "", cleaned, flags=re.IGNORECASE).strip()
    if cleaned:
        return cleaned.title()
    return "Bai giang"


def build_document_payload(
    *,
    document_id: str,
    title: str,
    source_type: str,
    original_filename: str,
    chunks: list[dict[str, Any]],
    created_at: str | None = None,
) -> dict[str, Any]:
    created_at = created_at or now_iso_utc()
    total_characters = sum(len(chunk["text"]) for chunk in chunks)
    return {
        "schema_version": SCHEMA_VERSION,
        "document_id": document_id,
        "title": title,
        "source_type": source_type,
        "original_filename": original_filename,
        "status": "ready",
        "created_at": created_at,
        "statistics": {
            "total_chunks": len(chunks),
            "total_characters": total_characters,
        },
        "chunks": chunks,
    }

