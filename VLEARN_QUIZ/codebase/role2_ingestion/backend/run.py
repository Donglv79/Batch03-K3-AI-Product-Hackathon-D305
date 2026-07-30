"""Launch the Role 2 ingestion server."""

from __future__ import annotations

import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parent
SRC = ROOT / "src"
CODEBASE_ROOT = ROOT.parents[1]
if str(SRC) not in sys.path:
    sys.path.insert(0, str(SRC))
if str(CODEBASE_ROOT) not in sys.path:
    sys.path.insert(0, str(CODEBASE_ROOT))

from ingestion.server import main  # noqa: E402


if __name__ == "__main__":
    raise SystemExit(main())
