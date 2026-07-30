"""CLI entry point for local Quiz Engine testing.

Usage:
    python -m quiz_engine.run quiz_engine/sample_input.json quiz_engine/sample_output.json
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

from .engine import generate_quiz_from_file


def main() -> int:
    """Run the engine from the command line."""
    if len(sys.argv) not in (2, 3):
        print(
            "Usage: python -m quiz_engine.run <input_json> [output_json]",
            file=sys.stderr,
        )
        return 2

    input_path = Path(sys.argv[1])
    output_path = Path(sys.argv[2]) if len(sys.argv) == 3 else None
    output = generate_quiz_from_file(input_path, output_path=output_path)
    print(json.dumps(output, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
