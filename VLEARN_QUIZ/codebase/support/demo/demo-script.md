# Kịch bản demo VLearn Grounded Quiz — 4 phút

## Chuẩn bị trước demo

- Chạy backend ở cổng `8000` và frontend ở cổng `3000`.
- Kiểm tra `GET /api/health` trả `{\"ok\": true}`.
- Dùng một PDF có text rõ, tối thiểu 120 ký tự; không dùng tài liệu scan.
- Chạy 9Router local với key/model hợp lệ và chạy trước đúng PDF một lần.
- Mở sẵn `eval/run_results.md` và `codebase/support/evidence/mining_report.md`.

## 0:00–0:30 — Vấn đề

“Sau buổi học, học viên cần biết mình thực sự hiểu phần nào. Trong 2.522 tin nhắn đã ẩn danh, tutor chỉ hỏi câu kiểm tra ở 3/1.261 phản hồi, trong khi nhu cầu giải thích và tóm tắt xuất hiện lặp lại. VLearn biến chính tài liệu bài giảng thành một bài kiểm tra ngắn có dẫn nguồn.”

## 0:30–1:00 — Tải nguồn

1. Mở Student Flow.
2. Tải PDF mẫu.
3. Chỉ vào tên tài liệu vừa xuất hiện và nói: “Backend đã trích text, chia chunk và gắn source ID ổn định.”

Nếu upload lỗi, dừng và đọc lỗi; không chuyển sang dữ liệu mock.

## 1:00–1:45 — Sinh quiz có căn cứ

1. Chọn 3 câu và độ khó.
2. Bấm **AI Sinh Quiz Ngay**.
3. Chỉ vào citation của một câu: source ID và quote phải là nội dung nguyên văn của tài liệu.
4. Nói: “Câu không có citation khớp bị loại; input quá ngắn, cắt cụt hoặc thuộc nhóm logistics xác định được sẽ bị từ chối trước khi gọi model.”

Nếu API lỗi/rejected, hiển thị chính cảnh báo đó và chuyển sang kết quả eval đã chạy trước; không tuyên bố đó là một run thành công.

## 1:45–2:45 — Làm bài và gap map

1. Trả lời một câu đúng và một câu sai.
2. Cho thấy feedback tức thời và giải thích.
3. Hoàn tất quiz.
4. Chỉ vào điểm tổng và topic cần ôn lại.

## 2:45–3:25 — Bằng chứng chất lượng

Mở corrected evaluator:

- Golden set có 30 ca, gồm 10 ca truy vết từ chatlog thật.
- PASS chỉ khi đúng hành vi mong đợi: rejection thật hoặc đủ số câu, 4 lựa chọn, đáp án hợp lệ và citation verified.
- Ngưỡng phát hành: pass rate ≥80% và không có bad citation; review ngữ nghĩa vẫn do người kiểm tra.

Strict corrected baseline qua 9Router đạt **27/30 (90%)**, hard/edge **100%**, và **0 bad citation**. Manual review: 27/27 câu grounded, single-answer. Ba FAIL còn lại là coverage: RGB/range, công thức Sigmoid và Cell state. Một lượt trung gian 30/30 bị loại vì evaluator vô tình tính keyword trong citation quote.

## 3:25–4:00 — Giới hạn và bước tiếp

“Prototype, full eval và AI-assisted semantic review đã hoàn thành. Trước khi nộp, hai thành viên cần xác nhận 5 output khó, nhóm test với ít nhất 5 người thật trong đó có ít nhất 2 willing users, điền danh tính và cập nhật deck bằng quote thật.”

## Phương án dự phòng

- Backend không chạy: dùng `README.md` để trình bày kiến trúc, không giả lập API.
- Gemini lỗi: trình bày guardrail rejection và file kết quả lỗi thật.
- PDF lỗi: dùng tài liệu mẫu đã kiểm tra, nhưng nói rõ đây là file demo.
