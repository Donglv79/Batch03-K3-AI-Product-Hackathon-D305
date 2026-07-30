"""Quiz Engine package.

This package receives the exact document JSON produced by the ingestion role,
calls Gemini to generate quiz questions, validates the response, verifies
citations against source chunks, and returns a normalized quiz JSON.
"""

from .engine import generate_quiz

__all__ = ["generate_quiz"]
