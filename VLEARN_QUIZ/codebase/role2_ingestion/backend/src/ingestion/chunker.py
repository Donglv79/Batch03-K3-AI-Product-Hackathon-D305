"""Chunking helpers for transcript, PDF, and pasted text inputs."""

from __future__ import annotations

import re
from typing import Any


SECTION_MARKER = re.compile(r"^\*\*\[(T\d{2}-\d{3})\]\*\*\s*(.*)$")


def normalize_whitespace(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def split_long_text(text: str, max_chars: int) -> list[str]:
    text = normalize_whitespace(text)
    if len(text) <= max_chars:
        return [text]

    sentence_parts = re.split(r"(?<=[.!?])\s+", text)
    pieces: list[str] = []
    current = ""

    for part in sentence_parts:
        if not part:
            continue
        candidate = part if not current else f"{current} {part}"
        if current and len(candidate) > max_chars:
            pieces.append(current)
            current = part
        else:
            current = candidate

    if current:
        pieces.append(current)

    if not pieces:
        pieces = [text[i : i + max_chars] for i in range(0, len(text), max_chars)]

    normalized: list[str] = []
    for piece in pieces:
        if len(piece) <= max_chars:
            normalized.append(piece.strip())
            continue

        start = 0
        while start < len(piece):
            end = min(start + max_chars, len(piece))
            if end < len(piece):
                space = piece.rfind(" ", start, end)
                if space > start + max_chars // 2:
                    end = space
            normalized.append(piece[start:end].strip())
            start = end + 1 if end < len(piece) and piece[end:end + 1] == " " else end

    pieces = normalized

    return [piece.strip() for piece in pieces if piece.strip()]


def pack_segments_into_chunks(
    base_id: str,
    segments: list[str],
    *,
    max_chars: int,
) -> list[dict[str, Any]]:
    chunks: list[dict[str, Any]] = []
    current_segments: list[str] = []
    current_size = 0

    def flush() -> None:
        nonlocal current_segments, current_size
        if not current_segments:
            return
        text = normalize_whitespace(" ".join(current_segments))
        chunks.append(
            {
                "text": text,
            }
        )
        current_segments = []
        current_size = 0

    for segment in segments:
        if len(segment) > max_chars:
            flush()
            for piece in split_long_text(segment, max_chars):
                chunks.append({"text": piece})
            continue

        candidate_size = current_size + len(segment) + (1 if current_segments else 0)
        if current_segments and candidate_size > max_chars:
            flush()

        current_segments.append(segment)
        current_size += len(segment) + (1 if len(current_segments) > 1 else 0)

    flush()

    if len(chunks) == 1:
        chunks[0]["source_id"] = base_id
        chunks[0]["parent_source_id"] = base_id
        chunks[0]["chunk_index"] = 1
        return chunks

    for index, chunk in enumerate(chunks, start=1):
        chunk["source_id"] = f"{base_id}-C{index:02d}"
        chunk["parent_source_id"] = base_id
        chunk["chunk_index"] = index
    return chunks


def split_marked_transcript(text: str, max_chars: int = 1200) -> list[dict[str, Any]]:
    sections: list[tuple[str, list[str]]] = []
    current_source_id: str | None = None
    current_lines: list[str] = []

    for raw_line in text.splitlines():
        line = raw_line.rstrip()
        marker = SECTION_MARKER.match(line.strip())
        if marker:
            if current_source_id and current_lines:
                sections.append((current_source_id, current_lines))
            current_source_id = marker.group(1)
            current_lines = []
            remainder = marker.group(2).strip()
            if remainder:
                current_lines.append(remainder)
            continue

        if current_source_id is not None:
            current_lines.append(line)

    if current_source_id and current_lines:
        sections.append((current_source_id, current_lines))

    chunks: list[dict[str, Any]] = []
    for source_id, lines in sections:
        paragraphs = [normalize_whitespace(part) for part in re.split(r"\n\s*\n", "\n".join(lines))]
        segments = [part for part in paragraphs if part]
        if not segments:
            continue
        chunks.extend(pack_segments_into_chunks(source_id, segments, max_chars=max_chars))

    return chunks


def chunk_plain_text(
    text: str,
    *,
    base_id_prefix: str,
    max_chars: int = 1200,
) -> list[dict[str, Any]]:
    paragraphs = [normalize_whitespace(part) for part in re.split(r"\n\s*\n", text)]
    segments = [part for part in paragraphs if part]
    if not segments:
        return []

    base_id = f"{base_id_prefix}_01"
    return pack_segments_into_chunks(base_id, segments, max_chars=max_chars)


def chunk_page_texts(
    page_texts: list[str],
    *,
    source_prefix: str = "slide",
    max_chars: int = 1200,
) -> list[dict[str, Any]]:
    chunks: list[dict[str, Any]] = []
    for page_index, page_text in enumerate(page_texts, start=1):
        cleaned = normalize_whitespace(page_text)
        if not cleaned:
            continue
        base_id = f"{source_prefix}_{page_index:02d}"
        page_chunks = pack_segments_into_chunks(base_id, [cleaned], max_chars=max_chars)
        chunks.extend(page_chunks)
    return chunks
