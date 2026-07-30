# Nội dung deck 6 slide

> Bản nội dung chờ xuất PDF/PPTX. Chỉ thay placeholder bằng dữ liệu thật đã kiểm chứng.

## Slide 1 — VLearn Grounded Quiz

**Học xong → tự kiểm tra → biết chính xác phần cần ôn**

Quiz ngắn sinh từ bài giảng, mỗi câu có trích dẫn nguyên văn.

## Slide 2 — Tại sao chọn vấn đề này?

- 2.522 tin nhắn đã ẩn danh, 369 người dùng, 585 hội thoại.
- Tutor hỏi câu kiểm tra: 3/1.261 phản hồi (0,24%).
- Không có citation: 582/1.261 phản hồi tutor (46,15%).
- Nhu cầu giải thích: 437 tin nhắn từ 196 người dùng.

Nguồn: `../evidence/mining_report.md`.

## Slide 3 — Lát cắt giải pháp

`PDF → extract/chunk → source guard → Gemini → schema + exact citation verifier → quiz → gap map`

- Quyết định AI: câu nào đủ căn cứ để đưa vào quiz.
- Automation có điều kiện: hệ thống từ chối/cảnh báo khi nguồn không đạt.
- Không có fallback mock im lặng.

## Slide 4 — Chất lượng được đo thế nào?

- Golden set: 30 ca; 10 ca truy vết từ chatlog.
- Kiểm tra rejection, số câu, 4 options, đáp án, topic và verified citation.
- Quality bar: ≥80% và 0 bad citation.
- Strict final baseline qua 9Router: **27/30 (90%)**, hard/edge **100%**, **0 bad citation**.
- Manual review: **27/27 câu grounded và single-answer**.
- Ba FAIL coverage được giữ: RGB/range, công thức Sigmoid, Cell state.
- Lượt 30/30 trung gian bị loại vì citation quote làm PASS giả topic coverage.

## Slide 5 — Học từ người dùng

- Đã test với **5 người**, trong đó **2 willing users**: 4 học viên và 1 giảng viên.
- Insight chính: cần làm rõ hành động xem đúng đoạn nguồn, rút ngắn giải thích và hỗ trợ làm lại riêng câu sai.
- “Đù nhìn bản đồ này mới biết t đang hổng nặng phần Boosting, mà có nút làm lại riêng mấy câu sai ko z” — Nguyễn Bùi Anh Tuấn.
- “Biểu đồ lỗ hổng kiến thức này rất trực quan. Giúp tôi biết ngay buổi tới cần dành 15 phút chiếu lại slide 43 để giảng lại phần ResNet cho cả lớp.” — Giảng viên D302.
- Quyết định giữ Knowledge Gap Map; đưa deep-link citation và retry câu sai vào danh sách cải tiến.

## Slide 6 — Đã có và bước cuối

**Đã có:** evidence, spec, end-to-end local slice, guardrails, corrected evaluator, tests và 5 phiên validation với 2 willing users.

**Cần hoàn tất:** bốn reflection còn lại; hỏi bổ sung mức tin tưởng/ý định dùng; xuất deck PDF.

Thông điệp kết: *Không chỉ hỏi — hỏi có căn cứ, rồi chỉ đúng chỗ cần học lại.*
