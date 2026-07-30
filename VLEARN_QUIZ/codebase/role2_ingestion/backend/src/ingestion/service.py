"""High-level ingestion operations used by the UI and HTTP API."""

from __future__ import annotations

from pathlib import Path
from typing import Any
import json

from .chunker import chunk_page_texts, chunk_plain_text, split_marked_transcript
from .models import build_document_payload, infer_document_id, infer_title
from .pdf_utils import PdfExtractionError, extract_pdf_page_texts
from .transcripts import list_transcripts, load_transcript_text


class IngestionError(RuntimeError):
    """Raised when user input cannot be transformed into the JSON contract."""


class IngestionService:
    """Build role-2 document JSON from transcripts, PDFs, or pasted text."""

    def __init__(self, max_chunk_chars: int = 1200) -> None:
        self.max_chunk_chars = max_chunk_chars

    def list_transcripts(self) -> list[dict[str, Any]]:
        return list_transcripts()

    def ingest_transcript_file(
        self,
        filename: str,
        *,
        title: str | None = None,
        document_id: str | None = None,
    ) -> dict[str, Any]:
        try:
            text = load_transcript_text(filename)
        except FileNotFoundError as exc:
            raise IngestionError(f"Transcript file not found: {filename}") from exc
        chunks = split_marked_transcript(text, max_chars=self.max_chunk_chars)
        if not chunks:
            raise IngestionError(f"No transcript chunks could be parsed from {filename}")

        source_title = title or infer_title(filename, "transcript")
        source_document_id = document_id or infer_document_id(filename, "transcript")
        return build_document_payload(
            document_id=source_document_id,
            title=source_title,
            source_type="transcript",
            original_filename=filename,
            chunks=chunks,
        )

    def ingest_text(
        self,
        *,
        text: str,
        original_filename: str,
        title: str | None = None,
        document_id: str | None = None,
        source_type: str = "text",
        prefix: str = "text",
    ) -> dict[str, Any]:
        if source_type == "transcript":
            chunks = split_marked_transcript(text, max_chars=self.max_chunk_chars)
            if not chunks:
                chunks = chunk_plain_text(
                    text,
                    base_id_prefix=prefix or "transcript",
                    max_chars=self.max_chunk_chars,
                )
        else:
            chunks = chunk_plain_text(text, base_id_prefix=prefix, max_chars=self.max_chunk_chars)

        if not chunks:
            raise IngestionError("No chunks were created from the provided text")

        resolved_title = title or infer_title(original_filename, source_type)
        resolved_document_id = document_id or infer_document_id(original_filename, source_type)
        return build_document_payload(
            document_id=resolved_document_id,
            title=resolved_title,
            source_type=source_type,
            original_filename=original_filename,
            chunks=chunks,
        )

    def ingest_pdf(
        self,
        *,
        pdf_bytes: bytes,
        original_filename: str,
        title: str | None = None,
        document_id: str | None = None,
        source_prefix: str = "slide",
    ) -> dict[str, Any]:
        try:
            page_texts = extract_pdf_page_texts(pdf_bytes)
        except PdfExtractionError as exc:
            raise IngestionError(str(exc)) from exc

        chunks = chunk_page_texts(
            page_texts,
            source_prefix=source_prefix,
            max_chars=self.max_chunk_chars,
        )
        if not chunks:
            raise IngestionError("The uploaded PDF did not yield any extractable text")

        resolved_title = title or infer_title(original_filename, "pdf")
        resolved_document_id = document_id or infer_document_id(original_filename, "pdf")
        return build_document_payload(
            document_id=resolved_document_id,
            title=resolved_title,
            source_type="pdf",
            original_filename=original_filename,
            chunks=chunks,
        )

    def ingest_pdf_files(
        self,
        *,
        files: list[dict[str, Any]],
        title: str | None = None,
        document_id: str | None = None,
        source_prefix: str = "slide",
    ) -> dict[str, Any]:
        if not files:
            raise IngestionError("No PDF files uploaded")

        all_page_texts: list[str] = []
        filenames: list[str] = []
        for file_item in files:
            filename = file_item.get("filename") or "upload.pdf"
            filenames.append(filename)
            try:
                all_page_texts.extend(extract_pdf_page_texts(file_item["bytes"]))
            except PdfExtractionError as exc:
                raise IngestionError(f"Unable to extract text from {filename}: {exc}") from exc

        chunks = chunk_page_texts(
            all_page_texts,
            source_prefix=source_prefix,
            max_chars=self.max_chunk_chars,
        )
        if not chunks:
            raise IngestionError("The uploaded PDFs did not yield any extractable text")

        original_filename = filenames[0] if len(filenames) == 1 else ", ".join(filenames)
        resolved_title = title or (
            "Slides batch" if len(filenames) > 1 else infer_title(original_filename, "pdf")
        )
        resolved_document_id = document_id or (
            "slides_batch_01" if len(filenames) > 1 else infer_document_id(original_filename, "pdf")
        )
        return build_document_payload(
            document_id=resolved_document_id,
            title=resolved_title,
            source_type="pdf",
            original_filename=original_filename,
            chunks=chunks,
        )

    def save_processed_document(self, document: dict[str, Any]) -> Path:
        processed_dir = (
            Path(__file__).resolve().parents[6]
            / "data"
            / "processed"
        )
        processed_dir.mkdir(parents=True, exist_ok=True)
        path = processed_dir / f"{document['document_id']}.json"
        path.write_text(json.dumps(document, ensure_ascii=False, indent=2), encoding="utf-8")
        return path


def ingest_payload(payload: dict[str, Any], service: IngestionService | None = None) -> dict[str, Any]:
    service = service or IngestionService()
    mode = payload.get("mode")

    if mode == "transcript":
        return service.ingest_transcript_file(
            payload["transcript_file"],
            title=payload.get("title"),
            document_id=payload.get("document_id"),
        )

    if mode == "pdf":
        files = payload.get("files")
        if files:
            return service.ingest_pdf_files(
                files=files,
                title=payload.get("title"),
                document_id=payload.get("document_id"),
                source_prefix=payload.get("source_prefix", "slide"),
            )

        pdf_bytes = payload["pdf_bytes"]
        if not isinstance(pdf_bytes, (bytes, bytearray)):
            raise IngestionError("payload.pdf_bytes must be binary data")
        return service.ingest_pdf(
            pdf_bytes=bytes(pdf_bytes),
            original_filename=payload["original_filename"],
            title=payload.get("title"),
            document_id=payload.get("document_id"),
            source_prefix=payload.get("source_prefix", "slide"),
        )

    if mode == "text":
        return service.ingest_text(
            text=payload["text"],
            original_filename=payload["original_filename"],
            title=payload.get("title"),
            document_id=payload.get("document_id"),
            source_type=payload.get("source_type", "text"),
            prefix=payload.get("prefix", "text"),
        )

    raise IngestionError(f"Unsupported ingestion mode: {mode}")
