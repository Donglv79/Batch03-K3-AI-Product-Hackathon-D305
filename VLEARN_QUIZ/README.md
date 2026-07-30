# VLearn Diagnostic Quiz

Prototype AI giúp giảng viên tạo **một câu trắc nghiệm chẩn đoán dạng vận dụng** từ nội dung vừa giảng. Mỗi đáp án sai đại diện cho một hiểu lầm; kết quả tổng hợp giúp giảng viên tự quyết định tiếp tục hay giảng lại.

## Thành viên và phân công

> Điền mã học viên và họ tên trước khi nộp.

| Người | Mã HV · Họ tên | Phụ trách | Artifact chính |
|---|---|---|---|
| 1 | TBD | Product Owner / Spec / Evidence / Demo | `spec.md`, README, slide, demo script |
| 2 | TBD | Content Ingestion & Grounding | `codebase/role2_ingestion/` |
| 3 | TBD | Gemini Diagnostic Quiz Engine | `codebase/quiz_engine/`, trace AI |
| 4 | TBD | Quiz Experience & Integration | `codebase/student-flow/` |
| 5 | TBD | Teacher Dashboard / Eval / Validation | dashboard, `eval/`, `validation/` |

## Lát cắt

> Với giảng viên vừa dạy xong một khái niệm, hệ thống dùng AI tạo một câu hỏi trắc nghiệm chẩn đoán yêu cầu vận dụng kiến thức trong tình huống mới, với các đáp án sai gắn với những hiểu lầm phổ biến, rồi tổng hợp lựa chọn của cả lớp để giúp giảng viên quyết định tiếp tục hay giảng lại.

## Phạm vi prototype

### Có trong MVP

- Chọn transcript/chunk có citation ID.
- Gemini tạo một câu A/B/C/D có grounding.
- Giảng viên xem, sửa, tạo lại hoặc duyệt.
- Học viên trả lời một câu.
- Dashboard tổng hợp phân bố đáp án và misconception nổi bật.
- Giảng viên quyết định cuối cùng.

### Không build

- Quiz nhiều câu, điểm hoặc xếp hạng.
- Theo dõi/bản đồ kiến thức cá nhân.
- Gửi hỗ trợ tự động.
- OCR và hỗ trợ mọi loại PDF.
- Tích hợp lớp học thật.

## Cấu trúc repo nộp bài

```text
VLEARN_QUIZ/
├── README.md                 # thành viên, phân công, cách chạy
├── spec.md                   # AI Spec §1–§9
├── demo-slides-outline.md    # nội dung 6 slide; xuất PDF trước CP6
├── requirements.txt          # dependency Python
├── codebase/
│   ├── README.md
│   ├── role2_ingestion/      # transcript/PDF → document JSON
│   ├── quiz_engine/          # Gemini → grounded quiz JSON
│   └── student-flow/         # Next.js UI
├── eval/
│   ├── README.md
│   └── traces/               # bằng chứng AI call thật
├── validation/
│   └── README.md             # interview/feedback log scaffold
└── reflection/
    ├── README.md
    └── TEMPLATE.md
```

File bắt buộc `demo-slides.pdf` sẽ được xuất từ outline trước CP6; không giữ file PDF rỗng như một artifact giả.

## Cách chạy

### 1. Cài dependency Python

```powershell
cd VLEARN_QUIZ
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### 2. Chạy ingestion backend

```powershell
cd codebase\role2_ingestion\backend
python run.py
```

### 3. Chạy Quiz Engine từ file

Tạo `.env` trong `VLEARN_QUIZ/`:

```text
GEMINI_API_KEY=...
MODEL=gemini-3.1-flash-lite
```

Sau đó:

```powershell
cd VLEARN_QUIZ\codebase
python -m quiz_engine.run quiz_engine\sample_input.json quiz_engine\sample_output.json
```

Không commit `.env` hoặc API key.

### 4. Chạy Student Flow

```powershell
cd VLEARN_QUIZ\codebase\student-flow
npm ci
npm run dev
```

Mở `http://localhost:3000`.

## Phần thật và phần mock

- **Thật:** ingestion/chunking, Gemini call, schema/citation verifier, chấm A/B/C/D, tính phân bố.
- **Mock hiện tại:** lượt trả lời của cả lớp; một phần UI vẫn đang dùng quiz mẫu.
- **Chưa hoàn tất:** canonical JSON giữa engine/frontend, Teacher Preview và Teacher Dashboard.

Xem trạng thái và quyết định sản phẩm trong `spec.md`; không trình bày phần mock như chức năng đã tích hợp thật.

## Data và bảo mật

- Chỉ dùng data pack được cấp hoặc dữ liệu giả.
- Không commit nguyên data pack/processed data vào repo nộp bài.
- Trong golden set ưu tiên ghi mã đoạn/case thay vì dán trích dẫn dài.
- Trace không được chứa API key hoặc thông tin cá nhân.
- Không cố suy ngược danh tính từ mã ẩn danh.

## Checklist trước khi nộp

- [ ] Điền tên, mã học viên và phân công.
- [ ] Hoàn thiện evidence và impact trong `spec.md`.
- [ ] Chốt quality bar trước hạn và giữ nguyên.
- [ ] Có golden set ≥20 case và kết quả chạy đủ mọi case.
- [ ] Có ≥5 feedback logs từ người ngoài nhóm.
- [ ] Mỗi thành viên có một reflection.
- [ ] Xuất `demo-slides.pdf` gồm 6 trang.
- [ ] Build frontend và chạy ít nhất một Gemini call thật.
- [ ] Quét repo không còn key, data pack, cache hoặc log dev.
