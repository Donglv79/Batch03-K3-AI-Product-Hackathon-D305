"""Fast unit tests that do not call Gemini or require network access."""

from __future__ import annotations

import sys
import json
import os
import unittest
from pathlib import Path
from unittest.mock import patch


PROJECT_ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(PROJECT_ROOT / "codebase"))
sys.path.insert(0, str(PROJECT_ROOT / "eval"))

from quiz_engine.citation_verifier import filter_verified_questions, verify_citations
from quiz_engine.engine import generate_quiz, parse_json_response
from quiz_engine.gemini_client import call_gemini, has_configured_api_key
from quiz_engine.source_guard import inspect_source
from run_eval import (
    evaluate_output,
    markdown_cell,
    normalize,
    topic_coverage_text,
    topic_is_covered,
)


def document(text: str, source_id: str = "SLIDE_01") -> dict:
    return {
        "schema_version": "1.0",
        "document_id": "doc_01",
        "title": "Bài giảng",
        "source_type": "text",
        "original_filename": "lesson.txt",
        "status": "ready",
        "created_at": "2026-07-30T00:00:00Z",
        "statistics": {"total_chunks": 1, "total_characters": len(text)},
        "chunks": [
            {
                "source_id": source_id,
                "parent_source_id": source_id,
                "chunk_index": 1,
                "text": text,
            }
        ],
    }


class SourceGuardTests(unittest.TestCase):
    def test_accepts_substantive_lecture(self) -> None:
        text = (
            "Học có giám sát sử dụng dữ liệu đã gán nhãn. Hồi quy dự đoán giá trị liên tục, "
            "còn phân loại dự đoán nhãn rời rạc. Mỗi bài toán cần metric đánh giá phù hợp."
        )
        self.assertIsNone(inspect_source(document(text)))

    def test_rejects_short_source_without_calling_model(self) -> None:
        output = generate_quiz(document("tóm tắt slide này"), config={"num_questions": 3})
        self.assertEqual(output["status"], "rejected")
        self.assertEqual(output["model"], "not_called")
        self.assertEqual(output["questions"], [])

    def test_rejects_truncated_source(self) -> None:
        issue = inspect_source(document("Luồng quang học dùng thuật toán Lucas-Kana..."))
        self.assertIsNotNone(issue)
        self.assertEqual(issue.code, "truncated_source")

    def test_rejects_logistics(self) -> None:
        text = (
            "Thông báo từ Phòng Đào tạo: sinh viên cần hoàn thành học phí trước hạn. "
            "Đây là yêu cầu hành chính trên portal và không phải nội dung bài giảng."
        )
        issue = inspect_source(document(text))
        self.assertIsNotNone(issue)
        self.assertEqual(issue.code, "out_of_scope")


class CitationTests(unittest.TestCase):
    def test_exact_quote_is_verified(self) -> None:
        source = document("Hồi quy dự đoán giá trị liên tục trong bài toán học có giám sát.")
        quiz = {
            "questions": [
                {
                    "citation": {
                        "source_id": "SLIDE_01",
                        "parent_source_id": "wrong",
                        "quote": "Hồi quy dự đoán giá trị liên tục",
                    }
                }
            ]
        }
        verify_citations(quiz, source)
        self.assertEqual(quiz["questions"][0]["citation_status"], "verified")
        self.assertEqual(quiz["questions"][0]["citation"]["parent_source_id"], "SLIDE_01")

    def test_bad_quote_is_filtered(self) -> None:
        source = document("Hồi quy dự đoán giá trị liên tục.")
        quiz = {
            "questions": [
                {
                    "citation": {
                        "source_id": "SLIDE_01",
                        "parent_source_id": "SLIDE_01",
                        "quote": "Hồi quy luôn chính xác",
                    }
                }
            ]
        }
        verify_citations(quiz, source)
        self.assertEqual(filter_verified_questions(quiz), [])


class ParsingAndEvalTests(unittest.TestCase):
    def test_parses_markdown_fenced_json(self) -> None:
        self.assertEqual(parse_json_response("```json\n{\"questions\": []}\n```"), {"questions": []})

    def test_rejected_case_only_passes_on_real_rejection(self) -> None:
        case = {"expected_output_requirements": {"expected_status": "REJECTED_OR_WARNING"}}
        passed, failures = evaluate_output(
            case,
            {"status": "rejected", "questions": [], "warnings": ["insufficient_source"]},
        )
        self.assertTrue(passed, failures)

        passed, _ = evaluate_output(
            case,
            {"status": "success", "questions": [{"question": "invented"}], "warnings": []},
        )
        self.assertFalse(passed)

    def test_multiline_eval_error_stays_in_one_markdown_cell(self) -> None:
        value = markdown_cell("HTTP 400:\nerror | invalid key")
        self.assertNotIn("\n", value)
        self.assertIn("\\|", value)

    def test_topic_matcher_accepts_bilingual_grounded_wording(self) -> None:
        output = normalize(
            "RGB và HSV. Ảnh xám là ma trận với cường độ từ 0 đến 255. "
            "Ảnh màu là tensor 3 chiều."
        )
        self.assertTrue(topic_is_covered("RGB vs HSV", output))
        self.assertTrue(topic_is_covered("Grayscale matrix 0-255", output))
        self.assertTrue(topic_is_covered("Color image 3D tensor", output))
        self.assertFalse(topic_is_covered("Sigmoid formula", output))

        formula_output = normalize("Hàm Sigmoid = 1 / (1 + e^-x).")
        self.assertTrue(topic_is_covered("Sigmoid formula", formula_output))

        ml_output = normalize("Ba nhóm Machine Learning; Hồi quy và Phân loại.")
        self.assertTrue(topic_is_covered("3 nhóm ML", ml_output))
        self.assertTrue(topic_is_covered("Hồi quy (Regression)", ml_output))
        self.assertTrue(topic_is_covered("Phân loại (Classification)", ml_output))

        optimizer_output = normalize("Momentum giúp vượt qua điểm yên ngựa.")
        self.assertTrue(topic_is_covered("Saddle point", optimizer_output))

        loss_output = normalize("MAE ít nhạy với điểm ngoại lai.")
        self.assertTrue(topic_is_covered("Ngoại lai (Outliers)", loss_output))

    def test_optional_rejection_accepts_guarded_zero_question_output(self) -> None:
        case = {
            "expected_output_requirements": {
                "allow_rejection_or_strict_grounding": True,
            }
        }
        passed, failures = evaluate_output(
            case,
            {"status": "rejected", "questions": [], "warnings": ["insufficient source"]},
        )
        self.assertTrue(passed, failures)

    def test_citation_alone_does_not_count_as_topic_coverage(self) -> None:
        questions = [
            {
                "topic": "tính phi tuyến",
                "question": "Vai trò của hàm kích hoạt là gì?",
                "explanation": "Tạo tính phi tuyến.",
                "correct_option_id": "a",
                "options": [{"id": "a", "text": "Tạo tính phi tuyến"}],
                "citation": {"quote": "Sigmoid = 1 / (1 + e^-x)"},
            }
        ]
        coverage = topic_coverage_text(questions)
        self.assertFalse(topic_is_covered("Sigmoid formula", coverage))


class RouterClientTests(unittest.TestCase):
    def test_9router_uses_openai_compatible_request(self) -> None:
        class FakeResponse:
            def __enter__(self):
                return self

            def __exit__(self, *_args):
                return False

            def read(self) -> bytes:
                return json.dumps(
                    {
                        "model": "test/model",
                        "choices": [{"message": {"content": '{"questions": []}'}}],
                    }
                ).encode("utf-8")

        environment = {
            "LLM_PROVIDER": "9router",
            "LLM_API_BASE": "http://127.0.0.1:20128/v1/",
            "ROUTER_API_KEY": "secret-test-key",
            "MODEL": "test/model",
        }
        with patch.dict(os.environ, environment, clear=True), patch(
            "quiz_engine.gemini_client.urllib.request.urlopen",
            return_value=FakeResponse(),
        ) as urlopen:
            self.assertTrue(has_configured_api_key())
            result = call_gemini("return JSON")

        request = urlopen.call_args.args[0]
        body = json.loads(request.data.decode("utf-8"))
        self.assertEqual(request.full_url, "http://127.0.0.1:20128/v1/chat/completions")
        self.assertEqual(request.get_header("Authorization"), "Bearer secret-test-key")
        self.assertEqual(body["model"], "test/model")
        self.assertEqual(body["messages"][0]["content"], "return JSON")
        self.assertEqual(result["text"], '{"questions": []}')


if __name__ == "__main__":
    unittest.main()
