"""Quiz Engine package.

This package receives the exact document JSON produced by the ingestion role,
calls Gemini to generate quiz questions, validates the response, verifies
citations against source chunks, and returns a normalized quiz JSON.
"""

from .engine import generate_quiz
from .source_guard import SourceIssue, inspect_source

__all__ = ["SourceIssue", "generate_quiz", "inspect_source"]
