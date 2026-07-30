# Quiz Engine

Role 3 owns this module. It receives the exact document JSON from Role 2,
generates 15 grounded single-choice questions with Gemini, verifies citations,
and returns a quiz JSON for Role 4 and Role 5.

## Input Contract

The engine follows the exact Role 2 structure:

```json
{
  "schema_version": "1.0",
  "document_id": "transcript_01",
  "title": "Bai giang 01",
  "source_type": "transcript",
  "original_filename": "transcript-01-clean.md",
  "status": "ready",
  "created_at": "2026-07-30T10:00:00.000Z",
  "statistics": {
    "total_chunks": 2,
    "total_characters": 1200
  },
  "chunks": [
    {
      "source_id": "T01-001",
      "parent_source_id": "T01-001",
      "chunk_index": 1,
      "text": "Noi dung chunk 1"
    }
  ]
}
```

## Output Contract

The generated quiz contains metadata plus all questions from one run:

```json
{
  "schema_version": "1.0",
  "document_id": "transcript_01",
  "quiz_id": "quiz_transcript_01_...",
  "status": "success",
  "created_at": "...",
  "model": "gemini-3.1-flash-lite",
  "config": {
    "num_questions": 15,
    "question_type": "single_choice",
    "difficulty": "mixed"
  },
  "questions": [
    {
      "question_id": "q1",
      "type": "single_choice",
      "topic": "short topic",
      "difficulty": "medium",
      "question": "...",
      "options": [
        {"id": "A", "text": "..."},
        {"id": "B", "text": "..."},
        {"id": "C", "text": "..."},
        {"id": "D", "text": "..."}
      ],
      "correct_option_id": "B",
      "explanation": "...",
      "citation": {
        "source_id": "T01-001",
        "parent_source_id": "T01-001",
        "quote": "Exact quote copied from chunk text"
      },
      "citation_status": "verified"
    }
  ],
  "warnings": []
}
```

## Citation Rule

`citation.quote` must be copied exactly from `chunks[].text`. The local
verifier rejects a question when:

- `citation.source_id` does not exist in input chunks.
- `citation.quote` is not an exact substring of that source chunk text.

## Local Usage

From `VLEARN_QUIZ/codebase`:

```bash
python -m quiz_engine.run quiz_engine/sample_input.json quiz_engine/sample_output.json
```

The command writes:

- Generated quiz JSON to the selected output file.
- AI trace JSON to `VLEARN_QUIZ/eval/traces/`.

Environment:

```text
GEMINI_API_KEY=...
MODEL=gemini-3.1-flash-lite
```
