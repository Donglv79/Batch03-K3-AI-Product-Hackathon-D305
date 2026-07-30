# codebase/

| Thư mục | Phụ trách | Trạng thái |
|---|---|---|
| `student-flow/` | Người 4 — Student Flow | Chạy được: tải slide mới (khung UI, chưa nối logic) → chọn buổi học → AI sinh quiz → làm bài (feedback đúng/sai ngay từng câu) → kết quả + bản đồ lỗ hổng kiến thức. Next.js + TypeScript, theme sáng. Dữ liệu quiz đang **mock** (`lib/mockQuiz.ts`) — chưa nối API Gemini thật. |
| (upload/transcript UI) | Người 2 — Nạp dữ liệu | — |
| (Gemini quiz engine) | Người 3 — Gemini Quiz Engine | — |
| (teacher dashboard) | Người 5 — Teacher Dashboard | — |

## Chạy thử student-flow

Cần Node.js (bản LTS — tải tại [nodejs.org](https://nodejs.org) hoặc
`winget install OpenJS.NodeJS.LTS` trên Windows). Từ `codebase/student-flow/`:

```
npm install
npm run dev
```

rồi mở `http://localhost:3000`.

## Cấu trúc

```
student-flow/
├── app/
│   ├── layout.tsx      ← root layout, import globals.css
│   ├── page.tsx        ← entry, render <App />
│   └── globals.css     ← toàn bộ style (theme sáng)
├── components/
│   ├── App.tsx             ← state chính (client component) + topbar + layout 2 cột
│   ├── Sidebar.tsx          ← upload slide + chọn buổi học + tuỳ chọn AI sinh quiz
│   ├── UploadSlidePanel.tsx ← khung upload .pptx/.pdf (UI-only, chưa xử lý thật)
│   ├── QuizScreen.tsx       ← làm bài, feedback đúng/sai ngay từng câu
│   ├── ResultScreen.tsx     ← điểm, bản đồ lỗ hổng, form feedback, xem lại từng câu
│   └── UnavailableScreen.tsx
└── lib/
    └── mockQuiz.ts      ← dữ liệu mock + types + buildQuiz()/statusForScorePct()
```

## Những gì đang mock vs thật

- **Mock**: nội dung quiz (`lib/mockQuiz.ts`) — chỉ 1/6 buổi có quiz đầy đủ, dựng thủ
  công từ nguồn thật (không AI sinh, không bịa): "Foundation: cách LLM hoạt động" (t04)
  — trích dẫn + mã đoạn `[Txx-NNN]` lấy nguyên văn từ
  `data/vlearn-pack/transcript/transcript-04-clean.md`. 5 buổi còn lại hiện trong
  sidebar với đúng tên và số mã đoạn thật, nhưng bấm "AI Sinh Quiz Ngay" sẽ ra màn hình
  "Chưa có quiz cho buổi này" — chủ ý không bịa nội dung khi chưa có nguồn.
  - (Đã bỏ bộ quiz dựng từ slide Day 2 mà tôi tự soạn trước đó — giữ lại đúng 1 bộ có
    nguồn transcript rõ ràng để tránh lẫn nội dung do AI dựng với nội dung Person 2/3
    sẽ nạp/sinh thật.)
- **UI-only, chưa hoạt động**: `UploadSlidePanel` — khung kéo-thả/chọn file `.pptx`
  hoặc `.pdf`, chỉ hiển thị tên file đã chọn, không đọc nội dung, không gọi API. Đây là
  chỗ Người 2 (Nạp dữ liệu) sẽ nối logic trích xuất thật.
- **Thật**: toàn bộ logic chấm điểm, lọc theo độ khó/số câu, gắn cảnh báo cho câu hỏi
  không có trích dẫn (`citation: null`), bản đồ lỗ hổng theo chủ đề, và form ghi log phản
  hồi người dùng (console.log theo đúng cột scaffold `validation/` ở guide §4.2).

## Hợp đồng dữ liệu (student-flow ⇄ quiz engine)

`lib/mockQuiz.ts` định nghĩa type `Quiz`/`Question` mà UI học viên đang render theo (kể
cả field `difficulty` dùng cho bộ lọc độ khó). Khi Người 3 có endpoint Gemini thật, trả
JSON đúng shape này — đặc biệt `citation: null` khi AI không có căn cứ trong nguồn, UI đã
xử lý sẵn case đó bằng cảnh báo thay vì hiện đáp án — rồi thay logic trong
`handleGenerate()` (`components/App.tsx`) bằng lời gọi API thật (fetch) thay vì
`buildQuiz()` đọc từ `QUIZZES[...]`. Phần render (components/) không cần đổi.

## Ghi chú build

Đã chạy thử thật (không chỉ soát tay): `npm install`, `npm run dev`, và `npm run build`
đều qua — xem lịch sử trao đổi để biết chi tiết (đã vá 1 lỗ hổng bảo mật critical trong
Next 14.2.5 → nâng lên 14.2.35).
