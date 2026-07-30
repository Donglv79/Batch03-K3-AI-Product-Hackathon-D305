"""Minimal Gemini REST client using only Python standard library."""

from __future__ import annotations

import json
import os
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any


DEFAULT_MODEL = "gemini-3.1-flash-lite"


class GeminiClientError(RuntimeError):
    """Raised when the Gemini API call fails."""


def load_env_file(env_path: str | Path) -> None:
    """Load simple KEY=VALUE pairs into os.environ if they are not set.

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
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


def call_gemini(prompt: str, model: str | None = None, timeout: int = 60) -> dict[str, Any]:
    """Call Gemini generateContent and return response text plus raw JSON."""
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise GeminiClientError("GEMINI_API_KEY is not set")

    selected_model = model or os.environ.get("MODEL") or DEFAULT_MODEL

    api_base = os.environ.get("GEMINI_API_BASE") or os.environ.get("API_BASE")
    if api_base:
        # OpenAI-compatible endpoint route (e.g. 9Router)
        url = f"{api_base.rstrip('/')}/chat/completions"
        payload = {
            "model": selected_model,
            "messages": [
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.2,
            "response_format": {"type": "json_object"}
        }

        request = urllib.request.Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {api_key}"
            },
            method="POST",
        )

        try:
            with urllib.request.urlopen(request, timeout=timeout) as response:
                response_text = response.read().decode("utf-8")
                try:
                    raw = json.loads(response_text)
                except json.JSONDecodeError as exc:
                    raise GeminiClientError(f"Failed to parse JSON from API Base. Raw response: {response_text}") from exc
        except urllib.error.HTTPError as exc:
            body = exc.read().decode("utf-8", errors="replace")
            raise GeminiClientError(f"API Base HTTP {exc.code}: {body}") from exc
        except urllib.error.URLError as exc:
            raise GeminiClientError(f"API Base network error: {exc}") from exc

        try:
            text = raw["choices"][0]["message"]["content"]
        except (KeyError, IndexError, TypeError) as exc:
            raise GeminiClientError(f"Unexpected API Base response shape: {raw}") from exc

        return {"model": selected_model, "text": text, "raw": raw}

    # Direct Gemini API route
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
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            raw = json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8", errors="replace")
        raise GeminiClientError(f"Gemini HTTP {exc.code}: {body}") from exc
    except urllib.error.URLError as exc:
        raise GeminiClientError(f"Gemini network error: {exc}") from exc

    try:
        text = raw["candidates"][0]["content"]["parts"][0]["text"]
    except (KeyError, IndexError, TypeError) as exc:
        raise GeminiClientError(f"Unexpected Gemini response shape: {raw}") from exc

    return {"model": selected_model, "text": text, "raw": raw}
