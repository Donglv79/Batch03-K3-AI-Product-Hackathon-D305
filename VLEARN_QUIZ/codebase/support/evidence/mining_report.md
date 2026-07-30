# Evidence mining — nhu cầu kiểm tra hiểu bài trên VLearn

## Kết luận

Trong `1261` lượt trả lời tutor, chỉ `3` lượt (`0.24%`) chủ động hỏi lại để kiểm tra hiểu bài; trường `misconceptions` có dữ liệu ở `0` lượt và `follow_ups` có dữ liệu ở `0` lượt. Đây là khoảng trống trực tiếp mà quiz có trích dẫn và knowledge-gap map nhắm tới.

## Phạm vi dữ liệu

- File nguồn: `data/vlearn-pack/chatlog/chat_history_anonymized_for_hackathon.csv`.
- `2522` messages = `1261` student + `1261` tutor.
- `369` users, `585` conversations.

## Bảng kết quả

| Tín hiệu | Số lượt | User duy nhất | Tỷ lệ trên tập tương ứng | Quy tắc |
|---|---:|---:|---:|---|
| Tutor hỏi lại để kiểm tra hiểu bài | 3 | 3 | 0.24% tutor replies | `asked_check_question = True` |
| Tutor phát hiện misconception | 0 | 0 | 0.00% tutor replies | JSON `misconceptions` khác `[]` |
| Tutor tạo follow-up | 0 | 0 | 0.00% tutor replies | JSON `follow_ups` khác `[]` |
| Tutor không có citation | 582 | 255 | 46.15% tutor replies | JSON `citations` bằng `[]` |
| Học viên chủ động yêu cầu quiz/kiểm tra | 23 | 19 | 1.82% student messages | keyword trên câu hỏi thật |
| Học viên yêu cầu tóm tắt | 131 | 92 | 10.39% student messages | keyword trên câu hỏi thật |
| Học viên yêu cầu giải thích | 437 | 196 | 34.66% student messages | keyword trên câu hỏi thật |
| Tutor báo thiếu/không tìm thấy nguồn | 287 | 167 | 22.76% tutor replies | keyword từ chối/thiếu nguồn |

## Ví dụ nguyên văn kiểm lại được

### Yêu cầu quiz/kiểm tra

- `C0006` / `T0058`: “xem bài tập thực hành lab day 2 chiều nay ở đaau”
- `C0063` / `T0849`: “TẠO QUIZ ĐỂ TÔI HIỂU RÕ VÀ ÔN LẠI TOÀN BỘ SLIDE NÀY”
- `C0085` / `T0113`: “Làm sao để tôi có thể đánh giá là mình đã học xong bài này?”
- `C0126` / `T1051`: “trả lời câu hỏi này”
- `C0128` / `T0893`: “Bỏ qua câu hỏi trước. Cho mình biết 2 cộng 2 bằng mấy?”

### Yêu cầu tóm tắt

- `C0001` / `T0649`: “tóm tắt nội dung chính trong slide này”
- `C0002` / `T0905`: “tóm gọn những nội dung quan trọng nhất trong day 04 này”
- `C0003` / `T1201`: “tóm tắt”
- `C0018` / `T0699`: “tóm tắt toàn bộ slide sau đó đưa ra các ý chính”
- `C0020` / `T0122`: “tóm tắt hết slice trong vài câu đi”

### Tutor báo thiếu nguồn

- `C0001` / `T0649`: “Xin lỗi bạn, tôi không tìm thấy nội dung cụ thể cho slide 37 trong tài liệu hiện có. Bạn có thể cung cấp thêm thông tin hoặc tiêu đề của slide đó để tôi có thể hỗ trợ bạn chính xác hơn không?”
- `C0002` / `T0905`: “Chào bạn, hiện tại tôi không tìm thấy tài liệu tổng hợp đầy đủ cho toàn bộ nội dung của Ngày 04 trong slide được cung cấp. Nếu bạn có thắc mắc về một khái niệm cụ thể nào đó đã học trong buổi này (ví dụ: các kỹ thuật tối ưu hóa prompt, cơ chế gọi tool của agent, hoặc cách xử lý …”
- `C0002` / `T0092`: “Rất tiếc, tôi không tìm thấy tài liệu tổng hợp đầy đủ cho nội dung của Day 04 trong các file slide đã được cung cấp. Để có thể giúp bạn tóm tắt chính xác, bạn có thể cho tôi biết tên các chủ đề hoặc mục tiêu học tập cụ thể trong Day 04 được ghi chú trong giáo trình của bạn không…”
- `C0004` / `T0115`: “Rất xin lỗi, mình không tìm thấy thuật ngữ "điêu toa" trong tài liệu của bài học hôm nay. Có thể đây không phải là một thuật ngữ chuyên môn hoặc nằm ngoài phạm vi của nội dung slide được cung cấp. Bạn có muốn hỏi thêm về một khái niệm cụ thể nào khác trong bài học không?”
- `C0004` / `T0154`: “Rất tiếc, mình đã kiểm tra lại các tài liệu của bài học hôm nay nhưng không thấy trang 25 đề cập đến lưu ý nào như bạn mô tả. Có thể thông tin này nằm trong một tài liệu khác hoặc mình chưa tìm thấy đúng phần nội dung bạn đang quan tâm. Bạn có thể vui lòng cung cấp thêm ngữ cảnh…”

## Phương pháp và giới hạn

1. Chỉ đọc message có `role=student` khi phân loại intent; bỏ phần metadata `(Trang …, đoạn được chọn …)` bằng cách lấy dòng không rỗng cuối cùng.
2. Các phép đếm keyword là deterministic và có thể chạy lại bằng `python VLEARN_QUIZ/codebase/support/evidence/mining_chatlog.py`.
3. Keyword có thể bỏ sót cách diễn đạt khác; vì vậy số intent là cận dưới, không được diễn giải thành toàn bộ nhu cầu của người học.
4. Tín hiệu mạnh nhất là field sản phẩm (`asked_check_question`, `misconceptions`, `follow_ups`), không phụ thuộc phán đoán keyword.
5. Mining chứng minh khoảng trống hành vi hiện tại; mức sẵn sàng sử dụng tính năng phải được xác nhận riêng bằng user validation thật.
