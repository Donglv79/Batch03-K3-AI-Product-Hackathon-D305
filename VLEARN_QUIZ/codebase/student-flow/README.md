# Student Flow

Giao diện Next.js cho lát cắt chính của VLearn Quiz: tải PDF bài giảng, chọn tài liệu vừa nạp, yêu cầu backend sinh quiz có căn cứ, làm bài và xem knowledge-gap map.

## Luồng đang hoạt động

1. `UploadSlidePanel` gửi một hoặc nhiều PDF đến `POST /api/ingest`.
2. Backend trích xuất text, chia chunk và trả `Role2Document` với `source_id` ổn định.
3. `App.tsx` lưu đúng document theo ID; khi sinh quiz, UI gửi document đó đến `POST /api/generate-quiz`.
4. Quiz engine kiểm tra nguồn, gọi Gemini, validate schema và chỉ giữ câu có quote nguyên văn khớp source.
5. UI hiển thị cảnh báo nếu nguồn bị từ chối hoặc không còn câu hợp lệ; không tự thay bằng quiz mock.
6. Học viên làm bài, xem giải thích, điểm và các topic cần ôn.
7. Từ câu trả lời hoặc màn hình kết quả, học viên có thể mở đúng trang PDF được mã citation chỉ ra và luyện lại riêng các câu sai.
8. Kết quả nộp trong phiên được tổng hợp ở dashboard giáo viên; có thể tìm kiếm, xem chủ đề yếu và xuất CSV mở bằng Excel.

## Chạy

Backend phải chạy ở `http://127.0.0.1:8000` trước. Có thể đổi bằng `NEXT_PUBLIC_ROLE2_API_BASE`.

```powershell
npm install
npm run dev
```

Mở `http://localhost:3000`. Kiểm tra production build bằng `npm run build`.

## Hợp đồng dữ liệu

- `lib/quizBridge.ts`: type Role 2/Role 3, lệnh upload/generate và adapter sang type UI.
- `components/App.tsx`: state tích hợp và xử lý lỗi/rejection.
- `lib/mockQuiz.ts`: type dùng chung và dữ liệu demo cho các màn hình; không còn là fallback khi gọi AI thất bại.

## Phần chưa phải production

- Account, danh sách lớp và dashboard giáo viên dùng dữ liệu demo.
- Báo lỗi câu hỏi chỉ được ghi nhận trong phiên hiện tại và UI hiển thị rõ là chưa gửi lên máy chủ.
- Dashboard chỉ tổng hợp dữ liệu của phiên trình duyệt hiện tại; tải lại trang sẽ xóa các lượt nộp.
- Feedback chưa persist vào database.
- Chưa có auth, rate limit, object storage hoặc deployment.
- Chỉ PDF có text; chưa OCR tài liệu scan.
