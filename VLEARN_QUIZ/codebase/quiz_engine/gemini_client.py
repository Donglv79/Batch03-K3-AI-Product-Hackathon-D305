"""Minimal Gemini REST client using only Python standard library."""

from __future__ import annotations

import json
import os
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any


DEFAULT_MODEL = "gemini-3.5-flash-lite"


class GeminiClientError(RuntimeError):
    """Raised when the Gemini API call fails."""

    def __init__(
        self,
        message: str,
        *,
        status_code: int | None = None,
        status: str | None = None,
    ) -> None:
        super().__init__(message)
        self.status_code = status_code
        self.status = status


def _format_gemini_error(status_code: int, body: str) -> tuple[str, str | None]:
    try:
        payload = json.loads(body)
    except json.JSONDecodeError:
        return body.strip() or "No response body", None

    error = payload.get("error") if isinstance(payload, dict) else None
    if not isinstance(error, dict):
        return body.strip() or "No response body", None

    status = error.get("status")
    message = error.get("message") or "Gemini request failed"
    if status == "NOT_FOUND":
        hint = "Check MODEL in .env; this model is not available for generateContent."
    elif status == "RESOURCE_EXHAUSTED":
        hint = "Gemini quota is exhausted or free-tier quota is disabled for this project."
    elif status == "PERMISSION_DENIED":
        hint = "Check that the API key belongs to the selected project and Generative Language API is enabled."
    elif status == "INVALID_ARGUMENT":
        hint = "Check the request payload/model configuration."
    else:
        hint = "Check Gemini API key, project, quota, and model availability."

    return f"{status or 'HTTP_ERROR'}: {message} {hint}", status


def load_env_file(env_path: str | Path) -> None:
    """Load simple KEY=VALUE pairs into os.environ.

    This avoids adding python-dotenv as a dependency for the prototype.
    """
    path = Path(env_path)
    if not path.exists():
        return

    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ[key.strip()] = value.strip().strip('"').strip("'")



def call_gemini(prompt: str, model: str | None = None, timeout: int = 60) -> dict[str, Any]:
    """Call Gemini generateContent and return response text plus raw JSON."""
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise GeminiClientError("GEMINI_API_KEY is not set")

    selected_model = model or os.environ.get("MODEL") or DEFAULT_MODEL
    encoded_key = urllib.parse.quote(api_key)
    url = (
        "https://generativelanguage.googleapis.com/v1beta/models/"
        f"{selected_model}:generateContent?key={encoded_key}"
    )

    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.2,
            "responseMimeType": "application/json",
        },
    }

    request = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "x-goog-api-key": api_key,
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            raw = json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8", errors="replace")
        message, status = _format_gemini_error(exc.code, body)
        raise GeminiClientError(
            f"Gemini HTTP {exc.code}: {message}",
            status_code=exc.code,
            status=status,
        ) from exc
    except urllib.error.URLError as exc:
        raise GeminiClientError(f"Gemini network error: {exc}") from exc

    try:
        text = raw["candidates"][0]["content"]["parts"][0]["text"]
    except (KeyError, IndexError, TypeError) as exc:
        raise GeminiClientError(f"Unexpected Gemini response shape: {raw}") from exc

    return {"model": selected_model, "text": text, "raw": raw}
