"""Minimal Google Gemini / OpenAI-compatible router client."""

from __future__ import annotations

import json
import os
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any


DEFAULT_MODEL = "gemini-3.1-flash-lite"
DEFAULT_9ROUTER_BASE = "http://127.0.0.1:20128/v1"


class GeminiClientError(RuntimeError):
    """Raised when the Gemini API call fails."""


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



def configured_provider() -> str:
    explicit = os.environ.get("LLM_PROVIDER")
    if explicit:
        return explicit.strip().casefold()
    # Backward compatibility for the team's existing 9Router .env.  A direct
    # Google request does not use a base URL override in this client.
    if os.environ.get("GEMINI_API_BASE"):
        return "9router"
    return "google"


def has_configured_api_key() -> bool:
    if configured_provider() in {"9router", "openai", "openai_compatible"}:
        return bool(
            os.environ.get("ROUTER_API_KEY")
            or os.environ.get("OPENAI_API_KEY")
            or os.environ.get("GEMINI_API_KEY")
        )
    return bool(os.environ.get("GEMINI_API_KEY"))


def _read_json_response(request: urllib.request.Request, timeout: int, label: str) -> dict[str, Any]:
    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            return json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8", errors="replace")
        raise GeminiClientError(f"{label} HTTP {exc.code}: {body}") from exc
    except urllib.error.URLError as exc:
        raise GeminiClientError(f"{label} network error: {exc}") from exc


def _call_openai_compatible(prompt: str, model: str | None, timeout: int) -> dict[str, Any]:
    api_key = (
        os.environ.get("ROUTER_API_KEY")
        or os.environ.get("OPENAI_API_KEY")
        or os.environ.get("GEMINI_API_KEY")
    )
    if not api_key:
        raise GeminiClientError("ROUTER_API_KEY (or OPENAI_API_KEY) is not set")

    selected_model = model or os.environ.get("MODEL")
    if not selected_model:
        raise GeminiClientError("MODEL is required for an OpenAI-compatible router")

    base_url = (
        os.environ.get("LLM_API_BASE")
        or os.environ.get("GEMINI_API_BASE")
        or DEFAULT_9ROUTER_BASE
    ).rstrip("/")
    url = f"{base_url}/chat/completions"
    payload = {
        "model": selected_model,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.2,
    }
    request = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}",
        },
        method="POST",
    )
    raw = _read_json_response(request, timeout, "9Router")
    try:
        content = raw["choices"][0]["message"]["content"]
        if isinstance(content, list):
            content = "".join(
                str(part.get("text", "")) for part in content if isinstance(part, dict)
            )
        if not isinstance(content, str) or not content.strip():
            raise TypeError("empty content")
    except (KeyError, IndexError, TypeError) as exc:
        raise GeminiClientError(f"Unexpected 9Router response shape: {raw}") from exc
    return {"model": raw.get("model", selected_model), "text": content, "raw": raw}


def call_gemini(prompt: str, model: str | None = None, timeout: int = 60) -> dict[str, Any]:
    """Call the configured LLM provider and return text plus raw JSON.

    The historical name is kept to avoid breaking existing engine imports.
    """
    if configured_provider() in {"9router", "openai", "openai_compatible"}:
        return _call_openai_compatible(prompt, model, timeout)

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
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    raw = _read_json_response(request, timeout, "Gemini")

    try:
        text = raw["candidates"][0]["content"]["parts"][0]["text"]
    except (KeyError, IndexError, TypeError) as exc:
        raise GeminiClientError(f"Unexpected Gemini response shape: {raw}") from exc

    return {"model": selected_model, "text": text, "raw": raw}
