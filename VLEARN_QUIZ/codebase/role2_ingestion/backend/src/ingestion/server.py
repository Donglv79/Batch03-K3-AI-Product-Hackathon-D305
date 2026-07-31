"""Tiny local HTTP server for the Role 2 ingestion UI."""

from __future__ import annotations

import json
import mimetypes
import re
import unicodedata
import uuid
import datetime
from copy import deepcopy
from email.parser import BytesParser
from email import policy
from datetime import datetime, timezone
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse

from .service import IngestionError, IngestionService, ingest_payload

try:
    from quiz_engine.engine import generate_quiz
except Exception:  # pragma: no cover - import depends on path setup
    generate_quiz = None


def frontend_dir() -> Path:
    return Path(__file__).resolve().parents[3] / "frontend"


INTRO_SLIDE_TERMS = {
    "about me",
    "agenda",
    "bio",
    "contact",
    "course overview",
    "gioi thieu",
    "giang vien",
    "housekeeping",
    "instructor",
    "lecturer",
    "linkedin",
    "muc luc",
    "noi quy",
    "professor",
    "schedule",
    "speaker",
    "title",
    "welcome",
}

LESSON_CONTENT_TERMS = {
    "algorithm",
    "architecture",
    "attention",
    "classification",
    "cong thuc",
    "definition",
    "embedding",
    "example",
    "formula",
    "khai niem",
    "linear",
    "loss",
    "matrix",
    "model",
    "mo hinh",
    "optimization",
    "phuong phap",
    "regression",
    "thuat toan",
    "trai nghiem",
    "dieu kien",
    "uu diem",
    "nhoc diem",
    "ung dung",
}


def _normalize_for_rules(text: str) -> str:
    decomposed = unicodedata.normalize("NFD", text)
    without_diacritics = "".join(char for char in decomposed if unicodedata.category(char) != "Mn")
    return without_diacritics.lower()


def _slide_number_from_chunk(chunk: dict) -> int | None:
    source_id = str(chunk.get("source_id", ""))
    match = re.search(r"(\d+)", source_id)
    return int(match.group(1)) if match else None


def _group_chunks_by_slide(chunks: list[dict]) -> list[tuple[str, list[dict]]]:
    grouped: dict[str, list[dict]] = {}
    for chunk in chunks:
        key = str(chunk.get("parent_source_id") or chunk.get("source_id") or "SLIDE_01")
        grouped.setdefault(key, []).append(chunk)

    def sort_key(item: tuple[str, list[dict]]) -> int:
        num = _slide_number_from_chunk(item[1][0]) if item[1] else None
        return num if num is not None else 9999

    return sorted(grouped.items(), key=sort_key)


def _looks_like_non_lesson_slide(chunks: list[dict], slide_position: int) -> bool:
    text = "\n".join(str(chunk.get("text", "")) for chunk in chunks).strip()
    normalized = _normalize_for_rules(text)
    words = re.findall(r"\w+", normalized)
    word_count = len(words)
    slide_number = _slide_number_from_chunk(chunks[0]) if chunks else None
    is_early_slide = slide_position <= 6 or (slide_number is not None and slide_number <= 6)
    if not is_early_slide:
        return False

    intro_hits = sum(1 for term in INTRO_SLIDE_TERMS if term in normalized)
    lesson_hits = sum(1 for term in LESSON_CONTENT_TERMS if term in normalized)
    has_contact_marker = bool(re.search(r"@|http|www\.|linkedin|email", normalized))

    if has_contact_marker and intro_hits >= 1:
        return True
    if intro_hits >= 2 and lesson_hits == 0:
        return True
    if intro_hits >= 1 and word_count <= 55:
        return True
    if slide_position == 1 and word_count <= 35:
        return True
    return False


def _prepare_document_for_quiz(document: dict) -> tuple[dict, list[str]]:
    chunks = document.get("chunks", [])
    if not isinstance(chunks, list) or not chunks:
        return document, []

    kept_chunks: list[dict] = []
    skipped_slides: list[str] = []
    for slide_index, (slide_key, slide_chunks) in enumerate(_group_chunks_by_slide(chunks), start=1):
        if _looks_like_non_lesson_slide(slide_chunks, slide_index):
            skipped_slides.append(str(slide_key))
            continue
        kept_chunks.extend(slide_chunks)

    if not kept_chunks:
        return document, []

    prepared = deepcopy(document)
    prepared["chunks"] = kept_chunks

    warnings: list[str] = []
    if skipped_slides:
        warnings.append(
            f"Skipped non-lesson intro/profile/agenda slides: {', '.join(skipped_slides)}"
        )
    return prepared, warnings


def _generate_fallback_mock_quiz(document: dict, config: dict | None = None, reason: str | None = None) -> dict:
    num_questions = 15
    if config:
        num_questions = config.get("num_questions") or config.get("numQuestions") or 15

    difficulty = (config.get("difficulty") if config else None) or "medium"
    if difficulty == "all":
        difficulty = "medium"

    doc_id = document.get("document_id", "doc_01")
    chunks = document.get("chunks", [])

    default_pool = [
        {
            "question": "Mục tiêu chính của Machine Learning (Học máy) là gì?",
            "options": [
                {"id": "A", "text": "Lập trình từng bước hướng dẫn cho máy tính thực hiện công việc."},
                {"id": "B", "text": "Giúp máy tính tự học quy luật từ dữ liệu để đưa ra quyết định."},
                {"id": "C", "text": "Thiết kế phần cứng máy tính chạy nhanh hơn."},
                {"id": "D", "text": "Tạo ra các trang web tĩnh đẹp mắt."}
            ],
            "correct_option_id": "B",
            "explanation": "Machine Learning giúp máy tính tự tìm ra quy luật từ dữ liệu đầu vào mà không cần lập trình tường minh từng tình huống.",
            "topic": "Tổng quan Machine Learning",
            "quote": "Machine Learning (Học máy) là một nhánh của Trí tuệ nhân tạo, trong đó máy tính học cách thực hiện nhiệm vụ bằng cách tìm ra quy luật từ dữ liệu."
        },
        {
            "question": "Sự khác biệt chính giữa Học có giám sát (Supervised) và Học không giám sát (Unsupervised) là gì?",
            "options": [
                {"id": "A", "text": "Học có giám sát sử dụng dữ liệu đã được gán nhãn (labeled data)."},
                {"id": "B", "text": "Học không giám sát chạy nhanh hơn rất nhiều."},
                {"id": "C", "text": "Học có giám sát không cần huấn luyện mô hình."},
                {"id": "D", "text": "Cả hai đều yêu cầu nhãn đầu ra."}
            ],
            "correct_option_id": "A",
            "explanation": "Học có giám sát hoạt động trên dữ liệu đã gán nhãn (có input và output mong muốn), còn học không giám sát tìm cấu trúc ẩn trong dữ liệu chưa gán nhãn.",
            "topic": "Các loại hình học máy",
            "quote": "Hồi quy & Phân loại thuộc nhóm Học có giám sát, sử dụng các tập dữ liệu huấn luyện đã được gán nhãn rõ ràng."
        },
        {
            "question": "Độ đo tương đồng Cosine (Cosine Similarity) được dùng để làm gì trong Vector Space?",
            "options": [
                {"id": "A", "text": "Đo khoảng cách Euclid tuyệt đối giữa hai điểm."},
                {"id": "B", "text": "Tính toán góc giữa hai vector để đánh giá độ tương đồng về hướng."},
                {"id": "C", "text": "Phân cụm dữ liệu phi tuyến tính."},
                {"id": "D", "text": "Tăng số lượng chiều của dữ liệu."}
            ],
            "correct_option_id": "B",
            "explanation": "Cosine similarity đo góc giữa hai vector trong không gian nhiều chiều, giá trị dao động từ -1 đến 1 biểu thị mức độ tương đồng hướng.",
            "topic": "Vector Embeddings & Cosine Similarity",
            "quote": "Độ đo tương đồng Cosine Similarity đánh giá mức độ giống nhau giữa hai vector dựa trên góc giữa chúng."
        }
    ]

    chunk_list = list(chunks)
    questions = []

    for i in range(num_questions):
        idx = i % len(default_pool)
        item = default_pool[idx]

        chunk_id = f"SLIDE_{i+1:02d}"
        source_id = chunk_id
        parent_source_id = chunk_id
        if chunk_list:
            c = chunk_list[i % len(chunk_list)]
            source_id = c.get("source_id", chunk_id)
            parent_source_id = c.get("parent_source_id", chunk_id)

        questions.append({
            "question_id": f"q_{i+1}",
            "type": "single_choice",
            "topic": item["topic"],
            "difficulty": difficulty,
            "question": item["question"],
            "options": item["options"],
            "correct_option_id": item["correct_option_id"],
            "explanation": item["explanation"],
            "citation": {
                "source_id": source_id,
                "parent_source_id": parent_source_id,
                "quote": item["quote"]
            },
            "citation_status": "verified"
        })

    return {
        "schema_version": "1.0",
        "document_id": doc_id,
        "quiz_id": f"quiz_{uuid.uuid4().hex[:8]}",
        "status": "draft",
        "created_at": datetime.utcnow().isoformat() + "Z",
        "model": "mock-fallback-generator",
        "config": {
            "num_questions": num_questions,
            "question_type": "single_choice",
            "difficulty": difficulty
        },
        "questions": questions,
        "warnings": [
            "Đây là bộ Quiz AI mẫu tự động kích hoạt vì Gemini chưa tạo được quiz thật.",
            f"Lỗi Gemini: {reason}" if reason else "Kiểm tra GEMINI_API_KEY, MODEL và quota trong Google AI Studio.",
        ]
    }


class IngestionHTTPRequestHandler(BaseHTTPRequestHandler):
    service = IngestionService()

    def log_message(self, format: str, *args) -> None:  # noqa: A003
        return

    def do_GET(self) -> None:  # noqa: N802
        parsed = urlparse(self.path)
        path = parsed.path

        if path == "/api/transcripts":
            self._send_json({"items": self.service.list_transcripts()})
            return

        if path == "/api/health":
            self._send_json({"ok": True})
            return

        if path == "/api/library":
            self._send_json({"items": self.service.load_library_index()})
            return

        if path.startswith("/api/files/"):
            self._send_file_from_library(path.removeprefix("/api/files/"))
            return

        if path.startswith("/api/quizzes/"):
            self._handle_quiz_route(path.removeprefix("/api/quizzes/"), parsed.query)
            return

        if path == "/api/quiz-attempts":
            self._send_attempts(parsed.query)
            return

        if path == "/" or path == "/index.html":
            self._send_static(frontend_dir() / "index.html")
            return

        if path in {"/app.js", "/styles.css"}:
            self._send_static(frontend_dir() / path.lstrip("/"))
            return

        self.send_error(HTTPStatus.NOT_FOUND, "Not found")

    def do_POST(self) -> None:  # noqa: N802
        parsed = urlparse(self.path)
        if parsed.path.startswith("/api/quizzes/") and parsed.path.endswith("/publish"):
            self._publish_quiz(parsed.path.removeprefix("/api/quizzes/").removesuffix("/publish").removesuffix("/"))
            return

        if parsed.path.startswith("/api/quizzes/") and parsed.path.endswith(".json"):
            try:
                payload = self._read_json_payload()
                if not isinstance(payload, dict):
                    raise IngestionError("Request body must be an object")
                document_id = parsed.path.removeprefix("/api/quizzes/").removesuffix(".json")
                quiz = payload.get("quiz") if isinstance(payload.get("quiz"), dict) else payload
                if not isinstance(quiz, dict):
                    raise IngestionError("Quiz payload must be an object")
                if quiz.get("document_id") and quiz.get("document_id") != document_id:
                    raise IngestionError("Quiz document_id does not match route")
                quiz["document_id"] = document_id
                saved = self._save_quiz(document_id, quiz, status="draft", bump_version=True)
                self._mark_document_with_quiz(document_id, saved.get("quiz_id"))
                self._send_json(saved, status=HTTPStatus.CREATED)
            except IngestionError as exc:
                self._send_json({"error": str(exc)}, status=HTTPStatus.BAD_REQUEST)
            return

        if parsed.path == "/api/quiz-attempts":
            try:
                payload = self._read_json_payload()
                if not isinstance(payload, dict):
                    raise IngestionError("Request body must be an object")
                record = self._upsert_attempt(payload)
                self._send_json(record, status=HTTPStatus.CREATED)
            except IngestionError as exc:
                self._send_json({"error": str(exc)}, status=HTTPStatus.BAD_REQUEST)
            return

        if parsed.path == "/api/quiz-reviews":
            try:
                payload = self._read_json_payload()
                if not isinstance(payload, dict):
                    raise IngestionError("Request body must be an object")
                attempt_id = payload.get("attempt_id")
                if not attempt_id:
                    raise IngestionError("attempt_id is required")
                attempts = self._load_attempts()
                matched = None
                for idx, item in enumerate(attempts):
                    if item.get("attempt_id") == attempt_id:
                        attempts[idx] = {
                            **item,
                            "teacher_comment": payload.get("teacher_comment", ""),
                            "status": payload.get("status"),
                            "reviewed_by": payload.get("reviewed_by"),
                            "reviewed_at": self._now_iso(),
                        }
                        matched = attempts[idx]
                        break
                if matched is None:
                    raise IngestionError("Attempt not found")
                self._save_attempts(attempts)
                self._send_json(matched, status=HTTPStatus.OK)
            except IngestionError as exc:
                self._send_json({"error": str(exc)}, status=HTTPStatus.BAD_REQUEST)
            return

        if parsed.path == "/api/generate-quiz":
            try:
                payload = self._read_json_payload()
                document = payload.get("document")
                config = payload.get("config")
                if not isinstance(document, dict) or not document.get("document_id"):
                    raise IngestionError("Request must include document with document_id")
                quiz_document, source_warnings = _prepare_document_for_quiz(document)

                if generate_quiz is None:
                    raise RuntimeError("quiz_engine package is not importable from backend")
                trace_dir = (
                    Path(__file__).resolve().parents[6]
                    / "VLEARN_QUIZ"
                    / "eval"
                    / "traces"
                )
                backend_env_file = Path(__file__).resolve().parents[2] / ".env"
                quiz = generate_quiz(
                    quiz_document,
                    config=config,
                    env_path=backend_env_file,
                    trace_dir=trace_dir,
                )
                if source_warnings:
                    quiz["warnings"] = [*source_warnings, *(quiz.get("warnings") or [])]
                self._save_quiz(document["document_id"], quiz, status="draft")
                self._mark_document_with_quiz(document["document_id"], quiz.get("quiz_id"))
                self._send_json(quiz, status=HTTPStatus.CREATED)
            except IngestionError as exc:
                self._send_json({"error": str(exc)}, status=HTTPStatus.BAD_REQUEST)
            except Exception as exc:  # pragma: no cover - guardrail
                import traceback
                print(f"Quiz generation failed with error: {exc}. Generating fallback mock quiz.")
                traceback.print_exc()
                try:
                    quiz_document, source_warnings = _prepare_document_for_quiz(document)
                    quiz = _generate_fallback_mock_quiz(quiz_document, config, reason=str(exc))
                    if source_warnings:
                        quiz["warnings"] = [*source_warnings, *(quiz.get("warnings") or [])]
                    self._save_quiz(document["document_id"], quiz, status="draft")
                    self._mark_document_with_quiz(document["document_id"], quiz.get("quiz_id"))
                    self._send_json(quiz, status=HTTPStatus.CREATED)
                except Exception as fallback_exc:
                    self._send_json(
                        {"error": f"Unexpected error during fallback generation: {fallback_exc}"},
                        status=HTTPStatus.INTERNAL_SERVER_ERROR,
                    )
            return

        try:
            payload = self._read_payload()
            document = ingest_payload(payload, self.service)
            pdf_bytes = None
            if "pdf_bytes" in payload and isinstance(payload["pdf_bytes"], (bytes, bytearray)):
                pdf_bytes = bytes(payload["pdf_bytes"])
            elif payload.get("files"):
                first_file = payload["files"][0]
                pdf_bytes = first_file.get("bytes")
            if isinstance(pdf_bytes, (bytes, bytearray)):
                self.service.save_uploaded_pdf(
                    document_id=document["document_id"],
                    pdf_bytes=bytes(pdf_bytes),
                    original_filename=document["original_filename"],
                )
                document["file_url"] = f"/api/files/{document['document_id']}.pdf"
            self.service.save_processed_document(document)
            self._upsert_library_document(document)
            self._send_json(document, status=HTTPStatus.CREATED)
        except IngestionError as exc:
            self._send_json({"error": str(exc)}, status=HTTPStatus.BAD_REQUEST)
        except Exception as exc:  # pragma: no cover - guardrail
            self._send_json({"error": f"Unexpected error: {exc}"}, status=HTTPStatus.INTERNAL_SERVER_ERROR)

    def _send_json(self, payload: dict | list, status: int = HTTPStatus.OK) -> None:
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
        self.wfile.write(body)

    def _now_iso(self) -> str:
        return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")

    def _quiz_versions_path(self, document_id: str) -> Path:
        return self.service.library_dir() / "quizzes" / "_versions" / f"{document_id}.json"

    def _attempts_path(self) -> Path:
        return self.service.library_dir() / "attempts.json"

    def _load_attempts(self) -> list[dict]:
        path = self._attempts_path()
        if not path.exists():
            return []
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            return []
        return data if isinstance(data, list) else []

    def _save_attempts(self, attempts: list[dict]) -> None:
        path = self._attempts_path()
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(attempts, ensure_ascii=False, indent=2), encoding="utf-8")

    def _upsert_attempt(self, record: dict) -> dict:
        attempt_id = record.get("attempt_id")
        if not attempt_id:
            raise IngestionError("attempt_id is required")
        attempts = self._load_attempts()
        for idx, item in enumerate(attempts):
            if item.get("attempt_id") == attempt_id:
                attempts[idx] = {**item, **record}
                self._save_attempts(attempts)
                return attempts[idx]
        attempts.append(record)
        self._save_attempts(attempts)
        return record

    def _attempts_for_document(self, document_id: str | None = None) -> list[dict]:
        attempts = self._load_attempts()
        if document_id:
            attempts = [item for item in attempts if item.get("document_id") == document_id]
        attempts.sort(key=lambda item: item.get("submitted_at", ""), reverse=True)
        return attempts

    def _save_quiz(self, document_id: str, quiz: dict, *, status: str = "draft", bump_version: bool = True) -> dict:
        quizzes_dir = self.service.library_dir() / "quizzes"
        quizzes_dir.mkdir(parents=True, exist_ok=True)
        path = self._library_quiz_path(document_id)
        existing = self._load_quiz(document_id)
        if bump_version and existing and isinstance(existing, dict) and existing.get("quiz_id"):
            history = list(existing.get("history") or [])
            history.append(
                {
                    "quiz_id": existing.get("quiz_id"),
                    "version": existing.get("version", 1),
                    "status": existing.get("status", "draft"),
                    "created_at": existing.get("created_at"),
                    "published_at": existing.get("published_at"),
                }
            )
            quiz["history"] = history[-10:]
            quiz["version"] = int(existing.get("version", 1)) + 1
        else:
            quiz["history"] = list(quiz.get("history") or [])
            quiz["version"] = int(quiz.get("version") or (existing.get("version", 1) if existing else 1))

        quiz["status"] = status
        if status == "published":
            quiz["published_at"] = quiz.get("published_at") or self._now_iso()
        else:
            quiz["published_at"] = quiz.get("published_at") or None

        path.write_text(json.dumps(quiz, ensure_ascii=False, indent=2), encoding="utf-8")
        return quiz

    def _publish_quiz(self, document_id: str) -> None:
        quiz = self._load_quiz(document_id)
        if quiz is None:
            self._send_json({"error": "Quiz not found"}, status=HTTPStatus.NOT_FOUND)
            return
        quiz["status"] = "published"
        quiz["published_at"] = quiz.get("published_at") or self._now_iso()
        self._save_quiz(document_id, quiz, status="published", bump_version=False)
        self._mark_document_with_quiz(document_id, quiz.get("quiz_id"))
        self._send_json(quiz, status=HTTPStatus.OK)

    def _handle_quiz_route(self, filename: str, query: str) -> None:
        if filename.endswith("/publish"):
            self._publish_quiz(filename.removesuffix("/publish").removesuffix("/"))
            return
        params = parse_qs(query)
        include_draft = params.get("includeDraft", ["0"])[0] == "1"
        self._send_quiz_from_library(filename, include_draft=include_draft)

    def _upsert_library_document(self, document: dict) -> None:
        items = self.service.load_library_index()
        doc_id = document["document_id"]
        quiz = self._load_quiz(doc_id)
        doc_entry = {
            "id": doc_id,
            "title": document.get("title") or doc_id,
            "pages": document.get("statistics", {}).get("total_chunks", 1) or 1,
            "status": "STUDYING",
            "filename": document.get("original_filename") or "",
            "fileUrl": document.get("file_url"),
            "fileType": "application/pdf",
            "hasExplanation": True,
            "uploadedAt": document.get("created_at"),
            "quizId": quiz.get("quiz_id") if quiz else document.get("quiz_id"),
            "quizAvailable": bool(quiz and quiz.get("status") == "published"),
            "quizStatus": quiz.get("status") if quiz else None,
            "quizVersion": quiz.get("version") if quiz else None,
            "chunks": document.get("chunks", []),
        }

        # Check if this document already exists in any day
        for item in items:
            for idx, doc in enumerate(item.get("documents", [])):
                if doc.get("id") == doc_id:
                    item["documents"][idx] = doc_entry
                    self.service.save_library_index(items)
                    return

        # New document — create a new day entry
        day_index = len(items) + 1
        title = document.get("title") or doc_id
        entry = {
            "id": f"day-{day_index}",
            "dayTag": f"Bài {day_index}",
            "title": title,
            "documents": [doc_entry],
        }
        items.append(entry)
        self.service.save_library_index(items)

    def _mark_document_with_quiz(self, document_id: str, quiz_id: str | None) -> None:
        items = self.service.load_library_index()
        quiz = self._load_quiz(document_id)
        changed = False
        for item in items:
            for doc in item.get("documents", []):
                if doc.get("id") == document_id:
                    doc["quizId"] = quiz_id
                    doc["quizAvailable"] = bool(quiz and quiz.get("status") == "published")
                    doc["quizStatus"] = quiz.get("status") if quiz else None
                    doc["quizVersion"] = quiz.get("version") if quiz else None
                    changed = True
        if changed:
            self.service.save_library_index(items)

    def _send_file_from_library(self, filename: str) -> None:
        path = self.service.library_dir() / "files" / filename
        if not path.exists():
            self.send_error(HTTPStatus.NOT_FOUND, "File not found")
            return
        body = path.read_bytes()
        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", "application/pdf")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(body)

    def _send_quiz_from_library(self, filename: str, include_draft: bool = False) -> None:
        document_id = filename.removesuffix(".json") if filename.endswith(".json") else filename
        quiz = self._load_quiz(document_id)
        if quiz is None:
            self.send_error(HTTPStatus.NOT_FOUND, "Quiz not found")
            return
        if not include_draft and quiz.get("status") != "published":
            self.send_error(HTTPStatus.NOT_FOUND, "Quiz not published")
            return
        self._send_json(quiz)

    def _send_attempts(self, query: str) -> None:
        params = parse_qs(query)
        document_id = params.get("document_id", [None])[0]
        self._send_json({"items": self._attempts_for_document(document_id)})

    def _library_quiz_path(self, document_id: str) -> Path:
        return self.service.library_dir() / "quizzes" / f"{document_id}.json"

    def _load_quiz(self, document_id: str) -> dict | None:
        path = self._library_quiz_path(document_id)
        if not path.exists():
            return None
        try:
            return json.loads(path.read_text(encoding="utf-8"))
        except Exception:
            return None

    def _send_static(self, path: Path) -> None:
        if not path.exists() or not path.is_file():
            self.send_error(HTTPStatus.NOT_FOUND, "File not found")
            return

        content_type, _ = mimetypes.guess_type(str(path))
        body = path.read_bytes()

        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", content_type or "application/octet-stream")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(body)

    def _read_json_payload(self) -> dict:
        content_length = int(self.headers.get("Content-Length", 0))
        if content_length <= 0:
            return {}
        body = self.rfile.read(content_length)
        return json.loads(body.decode("utf-8"))

    def _read_payload(self) -> dict:
        content_length = int(self.headers.get("Content-Length", 0))
        if content_length <= 0:
            return {}
        body = self.rfile.read(content_length)

        content_type = self.headers.get("Content-Type", "")
        msg_bytes = f"Content-Type: {content_type}\r\n\r\n".encode("utf-8") + body
        msg = BytesParser(policy=policy.default).parsebytes(msg_bytes)

        payload = {}
        files = []

        if msg.is_multipart():
            for part in msg.iter_parts():
                cd = part.get("Content-Disposition", "")
                name = None
                filename = None
                if cd:
                    name = part.get_param("name", header="content-disposition")
                    filename = part.get_filename()

                if filename is not None:
                    file_bytes = part.get_payload(decode=True)
                    if file_bytes is not None:
                        files.append({
                            "filename": filename,
                            "bytes": file_bytes
                        })
                elif name is not None:
                    field_bytes = part.get_payload(decode=True)
                    if field_bytes is not None:
                        payload[name] = field_bytes.decode("utf-8", errors="replace").strip()

        if files:
            payload["files"] = files

        if payload.get("mode") == "upload" and payload.get("source_type"):
            payload["mode"] = payload["source_type"]

        return payload

    def do_OPTIONS(self) -> None:  # noqa: N802
        self.send_response(HTTPStatus.NO_CONTENT)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()



def main(host: str = "127.0.0.1", port: int = 8000) -> int:
    server = ThreadingHTTPServer((host, port), IngestionHTTPRequestHandler)
    print(f"Role 2 ingestion server running at http://{host}:{port}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
    return 0


if __name__ == "__main__":
    main()
