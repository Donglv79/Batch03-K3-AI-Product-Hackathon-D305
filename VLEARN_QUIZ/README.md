# VLearn Grounded Quiz & Knowledge Gap Map

Prototype cho phép giảng viên nạp PDF bài giảng, sinh quiz bằng Gemini chỉ từ nội dung đã nạp, xác minh trích dẫn nguyên văn, rồi giúp học viên xem điểm và chủ đề cần ôn lại.

## Nhóm

| Vai trò | Họ tên | Mã học viên | Phần chịu trách nhiệm |
|---|---|---|---|
| Product/Evidence · Integration/Demo | Trần Văn Dũng | 2A202601859 | JTBD, mining, spec, quality bar, tích hợp cuối và demo artifact |
| Ingestion/Backend | Lê Văn Đông | 2A202601851 | PDF/text/transcript → chunks, stable source ID và ingestion API |
| Quiz Engine | Đào Đức Mạnh | 2A202601833 | Gemini call, JSON schema, prompt và exact citation verifier |
| Student Flow | Đàm Lê Minh Quân | 2A202601451 | Quiz UI, feedback, result và knowledge gap map |
| Eval/Validation · Dashboard prototype | Nguyễn Viết Huy | 2A202601081 | Golden set, eval runner, manual review, user validation và dashboard đánh giá |

Phần dashboard có đóng góp tích hợp chéo: Lê Văn Đông tạo phiên bản `TeacherDashboard`/`SlideViewer` tích hợp ban đầu; Trần Văn Dũng hoàn thiện dashboard dữ liệu phiên, tìm kiếm, CSV và các luồng feedback sau validation. Bảng trên ghi **người chịu trách nhiệm chính**, còn lịch sử commit được giữ nguyên để thể hiện đóng góp phối hợp.


## Lát cắt

> Khi một học viên vừa học xong bài giảng, hệ thống quyết định câu hỏi nào có đủ căn cứ nguồn để đưa vào quiz, rồi trả kết quả và topic cần ôn lại kèm trích dẫn nguyên văn.

## Kiến trúc

```text
PDF upload
   ↓
Role 2 Ingestion ── extract pages → normalize → chunks + stable source_id
   ↓
Role 3 Quiz Engine ── source guard → Gemini → schema validation
   ↓
Exact Citation Verifier ── invalid question bị loại
   ↓
Student Flow ── quiz → feedback → score → knowledge gap map
```

## Phần thật và phần giới hạn

### Thật

- PDF ingestion bằng `pypdf`, chunk tối đa 1.200 ký tự.
- Gemini REST call ở quyết định trung tâm.
- JSON schema validation và retry khi response lỗi.
- Exact citation verifier: `source_id` phải tồn tại, quote phải là substring nguyên văn.
- Source guard từ chối input quá ngắn, bị cắt cụt và một số nhóm ngoài phạm vi xác định được.
- Student flow, phản hồi từng câu, tính điểm và gap map.
- Evidence mining và corrected evaluator có thể chạy lại.

### Mock/backlog

- Teacher Dashboard chưa có database submission thật.
- Account student/teacher là account demo.
- Feedback UI chưa persist qua backend.
- Chưa deploy; chạy local hai process.

## Cài đặt

Yêu cầu Python 3.11+ và Node.js LTS.

```powershell
cd VLEARN_QUIZ
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r codebase\requirements.txt

cd codebase\student-flow
npm install
```

Tạo `VLEARN_QUIZ/codebase/.env` từ `codebase/.env.example`. Với 9Router local:

```text
LLM_PROVIDER=9router
LLM_API_BASE=http://127.0.0.1:20128/v1
ROUTER_API_KEY=your_valid_9router_key
MODEL=your_9router_model_id
```

Không commit `.env` hoặc API key.

9Router phải đang chạy ở cổng `20128`. Có thể kiểm tra cấu hình provider/model trước full eval bằng `python VLEARN_QUIZ/eval/test_models.py`.

## Chạy local

Terminal 1 — backend:

```powershell
cd VLEARN_QUIZ\codebase\role2_ingestion\backend
python run.py
```

Terminal 2 — frontend:

```powershell
cd VLEARN_QUIZ\codebase\student-flow
npm run dev
```

Mở `http://localhost:3000`. Backend mặc định ở `http://127.0.0.1:8000`.

## Test và eval

Unit tests không gọi mạng:

```powershell
python -m unittest discover -s VLEARN_QUIZ\codebase\tests -v
```

Production build:

```powershell
cd VLEARN_QUIZ\codebase\student-flow
npm run build
```

Corrected golden-set eval (cần key hợp lệ):

```powershell
python VLEARN_QUIZ\eval\run_eval.py
python VLEARN_QUIZ\eval\run_eval.py --case TC_HAPPY_01
```

Evaluator không coi “API trả output” là PASS. Nó assert rejection, số câu, bốn options, correct option, verified citation, source ID và topic bắt buộc. Zero-hallucination còn cần manual review nội dung theo `eval/eval_criteria.md`.

## Artifact

- [AI Spec](spec.md)
- [Evidence mining](codebase/support/evidence/mining_report.md)
- [Golden set](eval/golden_set.json)
- [Bằng chứng AI call thật](eval/AI_CALL_EVIDENCE.md)
- [Manual semantic review](eval/manual_review.md)
- [Validation log](validation/feedback_log.md)
- [Demo script](codebase/support/demo/demo-script.md)
- [Nội dung deck 6 slide](codebase/support/demo/demo-slides-content.md)
- [Reflection](reflection/)

## Trạng thái cần người thật trước khi nộp

- Điền tên, mã học viên và phân công.
- Đã xác nhận đủ 3 willing users; đã validation 5 người, trong đó có 2 willing users tham gia test.
- Đã có quan sát và quote thật; còn thiếu câu trả lời trực tiếp về mức tin tưởng và ý định sử dụng.
- Strict baseline qua 9Router đạt 27/30 (90%), hard/edge 100%, 0 bad citation; AI-assisted review đạt 27/27 câu grounded/single-answer. Hai thành viên đã xác nhận độc lập 5 ca khó.
- Xuất `demo-slides.pdf` từ nội dung slide final.

## Known limitations

- Guardrail ngoài phạm vi hiện là deterministic prototype, chưa phải classifier tổng quát.
- Tài liệu scan không có text/OCR có thể không ingestion được.
- Một run có thể trả `partial` nếu không đủ câu qua exact citation verifier.
- Difficulty phụ thuộc instruction model và chưa có calibration theo người học.
