"""PDF text extraction with optional third-party support."""

from __future__ import annotations

import io
from typing import Iterable


class PdfExtractionError(RuntimeError):
    """Raised when a PDF cannot be converted into page text."""


def extract_pdf_page_texts(pdf_bytes: bytes) -> list[str]:
    reader = _load_pdf_reader(pdf_bytes)
    page_texts: list[str] = []
    for page in reader.pages:
        text = page.extract_text() or ""
        page_texts.append(text)
    return page_texts


def _load_pdf_reader(pdf_bytes: bytes):
    try:
        from pypdf import PdfReader  # type: ignore
    except Exception:
        try:
            from PyPDF2 import PdfReader  # type: ignore
        except Exception as exc:  # pragma: no cover - import guard
            raise PdfExtractionError(
                "PDF ingestion requires pypdf or PyPDF2 to be installed."
            ) from exc

    try:
        return PdfReader(io.BytesIO(pdf_bytes))
    except Exception as exc:  # pragma: no cover - passthrough
        raise PdfExtractionError(f"Unable to read PDF: {exc}") from exc

