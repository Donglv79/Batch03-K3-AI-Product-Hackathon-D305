"""Offline contract tests for the Role 2 ingestion boundary."""

from __future__ import annotations

import sys
import unittest
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[2]
BACKEND_SRC = PROJECT_ROOT / "codebase" / "role2_ingestion" / "backend" / "src"
sys.path.insert(0, str(BACKEND_SRC))

from ingestion.service import IngestionError, IngestionService, ingest_payload


class IngestionContractTests(unittest.TestCase):
    def test_text_becomes_stable_bounded_chunks(self) -> None:
        service = IngestionService(max_chunk_chars=80)
        text = (
            "Học có giám sát dùng dữ liệu đã gán nhãn để học quan hệ đầu vào và đầu ra. "
            "Hồi quy dự đoán giá trị liên tục. Phân loại dự đoán nhãn rời rạc. "
            "Chọn metric phù hợp với mục tiêu của bài toán."
        )
        result = ingest_payload(
            {
                "mode": "text",
                "text": text,
                "original_filename": "lesson.txt",
                "title": "Bài học máy",
                "document_id": "lesson_01",
                "prefix": "lesson",
            },
            service,
        )

        self.assertEqual(result["status"], "ready")
        self.assertEqual(result["document_id"], "lesson_01")
        self.assertGreater(result["statistics"]["total_chunks"], 1)
        self.assertEqual(
            result["statistics"]["total_chunks"], len(result["chunks"])
        )
        self.assertTrue(all(len(chunk["text"]) <= 80 for chunk in result["chunks"]))
        self.assertEqual(
            [chunk["source_id"] for chunk in result["chunks"]],
            [f"lesson_01-C{i:02d}" for i in range(1, len(result["chunks"]) + 1)],
        )
        self.assertTrue(
            all(chunk["parent_source_id"] == "lesson_01" for chunk in result["chunks"])
        )

    def test_blank_text_is_rejected(self) -> None:
        with self.assertRaises(IngestionError):
            ingest_payload(
                {
                    "mode": "text",
                    "text": "   \n\n",
                    "original_filename": "blank.txt",
                }
            )

    def test_unknown_mode_is_rejected(self) -> None:
        with self.assertRaises(IngestionError):
            ingest_payload({"mode": "spreadsheet"})


if __name__ == "__main__":
    unittest.main()
