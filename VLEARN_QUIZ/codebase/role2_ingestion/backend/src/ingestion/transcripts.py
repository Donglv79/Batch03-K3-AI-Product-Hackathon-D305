"""Catalog and loading utilities for bundled transcript files."""

from __future__ import annotations

from pathlib import Path
import re
from typing import Any


def repo_root() -> Path:
    return Path(__file__).resolve().parents[6]


def transcript_dir() -> Path:
    return repo_root() / "data" / "vlearn-pack" / "transcript"


def list_transcripts() -> list[dict[str, Any]]:
    items: list[dict[str, Any]] = []
    for path in sorted(transcript_dir().glob("transcript-*-clean.md")):
        items.append(
            {
                "document_id": infer_document_id(path.name),
                "title": infer_title(path),
                "original_filename": path.name,
                "path": str(path),
            }
        )
    return items


def infer_document_id(filename: str) -> str:
    stem = Path(filename).stem
    match = re.search(r"transcript[-_]?(\d+)", stem)
    if match:
        return f"transcript_{int(match.group(1)):02d}"
    return stem.replace("-", "_").replace(" ", "_")


def infer_title(path: Path) -> str:
    try:
        first_lines = path.read_text(encoding="utf-8").splitlines()[:12]
    except UnicodeDecodeError:
        first_lines = path.read_text(encoding="utf-8", errors="ignore").splitlines()[:12]

    for line in first_lines:
        if line.startswith("# "):
            return line[2:].strip()
    return path.stem.replace("-", " ").title()


def load_transcript_text(filename: str) -> str:
    path = transcript_dir() / filename
    if not path.exists():
        raise FileNotFoundError(filename)
    try:
        return path.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        return path.read_text(encoding="utf-8", errors="ignore")
