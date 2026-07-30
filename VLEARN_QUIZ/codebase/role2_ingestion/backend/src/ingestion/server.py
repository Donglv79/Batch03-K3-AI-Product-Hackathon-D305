"""Tiny local HTTP server for the Role 2 ingestion UI."""

from __future__ import annotations

import json
import mimetypes
from email.parser import BytesParser
from email import policy
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse

from .service import IngestionError, IngestionService, ingest_payload

try:
    from quiz_engine.engine import generate_quiz
except Exception:  # pragma: no cover - import depends on path setup
    generate_quiz = None


def frontend_dir() -> Path:
    return Path(__file__).resolve().parents[3] / "frontend"


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

        if path == "/" or path == "/index.html":
            self._send_static(frontend_dir() / "index.html")
            return

        if path in {"/app.js", "/styles.css"}:
            self._send_static(frontend_dir() / path.lstrip("/"))
            return

        self.send_error(HTTPStatus.NOT_FOUND, "Not found")

    def do_POST(self) -> None:  # noqa: N802
        parsed = urlparse(self.path)
        if parsed.path != "/api/ingest":
            if parsed.path != "/api/generate-quiz":
                self.send_error(HTTPStatus.NOT_FOUND, "Not found")
                return

            try:
                payload = self._read_json_payload()
                document = payload["document"]
                config = payload.get("config")
                if generate_quiz is None:
                    raise IngestionError("quiz_engine package is not importable from backend")
                trace_dir = (
                    Path(__file__).resolve().parents[6]
                    / "VLEARN_QUIZ"
                    / "eval"
                    / "traces"
                )
                quiz = generate_quiz(
                    document,
                    config=config,
                    trace_dir=trace_dir,
                )
                self._send_json(quiz, status=HTTPStatus.CREATED)
            except IngestionError as exc:
                self._send_json({"error": str(exc)}, status=HTTPStatus.BAD_REQUEST)
            except Exception as exc:  # pragma: no cover - guardrail
                self._send_json(
                    {"error": f"Unexpected error: {exc}"},
                    status=HTTPStatus.INTERNAL_SERVER_ERROR,
                )
            return

        try:
            payload = self._read_payload()
            document = ingest_payload(payload, self.service)
            self.service.save_processed_document(document)
            self._send_json(document, status=HTTPStatus.CREATED)
        except IngestionError as exc:
            self._send_json({"error": str(exc)}, status=HTTPStatus.BAD_REQUEST)
        except Exception as exc:  # pragma: no cover - guardrail
            self._send_json({"error": f"Unexpected error: {exc}"}, status=HTTPStatus.INTERNAL_SERVER_ERROR)

    def _read_payload(self) -> dict:
        content_type = self.headers.get("Content-Type", "")
        if content_type.startswith("application/json"):
            return self._read_json_payload()

        if content_type.startswith("multipart/form-data"):
            form = self._read_multipart_form(content_type)

            mode = form["fields"].get("mode", "text")
            if mode == "transcript":
                return {
                    "mode": "transcript",
                    "transcript_file": form["fields"].get("transcript_file", ""),
                    "title": form["fields"].get("title") or None,
                    "document_id": form["fields"].get("document_id") or None,
                }

            file_items = form["files"].get("file", [])
            if not file_items:
                raise IngestionError("No file uploaded")
            first_file = file_items[0]
            file_bytes = first_file["bytes"]
            original_filename = first_file["filename"] or "upload.bin"
            source_type = form["fields"].get("source_type", "text")
            pdf_files = [
                {
                    "filename": file_item["filename"] or f"upload-{index}.pdf",
                    "bytes": file_item["bytes"],
                }
                for index, file_item in enumerate(file_items, start=1)
            ]
            return {
                "mode": "pdf" if source_type == "pdf" else "text",
                "pdf_bytes": file_bytes,
                "files": pdf_files if source_type == "pdf" else None,
                "text": file_bytes.decode("utf-8", errors="ignore"),
                "original_filename": original_filename,
                "title": form["fields"].get("title") or None,
                "document_id": form["fields"].get("document_id") or None,
                "source_type": source_type,
                "prefix": form["fields"].get("prefix", "text"),
                "source_prefix": form["fields"].get("source_prefix", "slide"),
            }

        raise IngestionError(f"Unsupported content type: {content_type}")

    def _read_json_payload(self) -> dict:
        length = int(self.headers.get("Content-Length", "0"))
        raw = self.rfile.read(length).decode("utf-8")
        payload = json.loads(raw)
        if not isinstance(payload, dict):
            raise IngestionError("JSON body must be an object")
        return payload

    def _read_multipart_form(self, content_type: str) -> dict:
        length = int(self.headers.get("Content-Length", "0"))
        raw_body = self.rfile.read(length)
        message = BytesParser(policy=policy.default).parsebytes(
            b"Content-Type: "
            + content_type.encode("utf-8")
            + b"\r\nMIME-Version: 1.0\r\n\r\n"
            + raw_body
        )

        fields: dict[str, str] = {}
        files: dict[str, dict] = {}
        for part in message.iter_parts():
            name = part.get_param("name", header="content-disposition")
            if not name:
                continue

            filename = part.get_filename()
            payload = part.get_payload(decode=True) or b""
            if filename:
                files.setdefault(name, []).append({"filename": filename, "bytes": payload})
            else:
                fields[name] = payload.decode("utf-8", errors="ignore")

        return {"fields": fields, "files": files}

    def _send_json(self, payload, status: int = HTTPStatus.OK) -> None:
        body = json.dumps(payload, ensure_ascii=False, indent=2).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
        self.wfile.write(body)

    def _send_static(self, path: Path) -> None:
        if not path.exists():
            self.send_error(HTTPStatus.NOT_FOUND, "Not found")
            return

        body = path.read_bytes()
        content_type, _ = mimetypes.guess_type(str(path))
        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", content_type or "application/octet-stream")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(body)

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
