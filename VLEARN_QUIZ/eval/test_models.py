"""One safe smoke test for the provider configured in VLEARN_QUIZ/codebase/.env."""

from __future__ import annotations

import os
import sys
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PROJECT_ROOT / "codebase"))

from quiz_engine.gemini_client import call_gemini, configured_provider, load_env_file


load_env_file(PROJECT_ROOT / "codebase" / ".env")
model = os.environ.get("MODEL")
print(f"Provider: {configured_provider()}; model: {model or '(missing)'}")
try:
    result = call_gemini('Return only valid JSON: {"status":"ok"}', model=model)
    print(f"SUCCESS: model={result['model']}; response={result['text'][:120]}")
except Exception as exc:
    print(f"FAILED: {exc}")
    raise SystemExit(1)
