# Log Đánh Giá Người Dùng Thật (User Validation Log — CP5)

> **Mục tiêu**: Thu thập đúng **5 mẩu phản hồi** từ 5 người dùng thật ngoài nhóm (trong đó có 2 willing users từ mốc CP1) để đạt 8 điểm tối đa cho Rubric R6.

---

## 1. Nhật Ký Thử Nghiệm Với Người Dùng (Feedback Log)

| # | Người thử (Tên/Vai) | Willing User CP1? | Task được giao | Quan sát hành vi (Kẹt ở đâu, lúng túng chỗ nào?) | Trích dẫn nguyên văn (Quote) | Mức nghiêm trọng |
|---|---|:---:|---|---|---|:---:|
| 1 | **Đỗ Duy Đức**<br>*(Học viên)* | **[x] Có** | Làm thử Quiz bài giảng Computer Vision (RGB vs HSV). | Bấm khoanh đáp án nhanh nhưng đứng hình 5s tìm nút xem lại đoạn slide trích dẫn nguồn. | *"Ủa cái nút trích dẫn slide nằm góc nào z, bấm vào slide_12 méo thấy nó hiện cái đoạn bài giảng ra xem lại gì hết bro"* | Vừa |
| 2 | **Dương Đức Trung**<br>*(Học viên)* | **[x] Có** | Thử làm Quiz bài giảng Deep Learning (MSE vs MAE). | Đọc câu hỏi xong gật gù khen hay nhưng than phần giải thích đáp án chữ dày đặc dài quá. | *"Quiz ngon đấy đúng câu t hay khoanh nhầm trên lớp, mà cái đoạn giải thích dài vcl ngắn lại tầm 2 dòng thôi đọc cho lẹ"* | Thấp |
| 3 | **Nguyễn Bùi Anh Tuấn**<br>*(Học viên)* | [ ] Không | Làm Quiz Machine Learning & xem Bản đồ lỗ hổng. | Làm xong bài xem ngay giao diện Bản đồ lỗ hổng kiến thức cá nhân, loay hoay tìm nút làm lại. | *"Đù nhìn bản đồ này mới biết t đang hổng nặng phần Boosting, mà có nút làm lại riêng mấy câu sai ko z"* | Thấp |
| 4 | **Hoàng Thanh Chiến**<br>*(Học viên)* | [ ] Không | Thử bấm nút Báo lỗi câu hỏi trên giao diện Quiz. | Tìm thấy nút báo lỗi nhanh, bấm gửi phản hồi xem có ăn ngay về hệ thống không. | *"Mấy câu bẫy này ảo thật sự, cơ mà bấm nút báo lỗi câu hỏi phát là nó gửi về dashboard giảng viên luôn hả, tiện đấy"* | Thấp |
| 5 | **Giảng viên D302**<br>*(Giảng viên)* | [ ] Không | Trải nghiệm Teacher Knowledge Gap Dashboard. | Soi kỹ biểu đồ các câu sinh viên làm sai >50% và bấm thử nút 'Giảng lại câu này'. | *"Biểu đồ lỗ hổng kiến thức này rất trực quan. Giúp tôi biết ngay buổi tới cần dành 15 phút chiếu lại slide 43 để giảng lại phần ResNet cho cả lớp."* | Thấp |

---

## 2. Tổng Hợp & Chuyển Thành Chỉnh Sửa (Changelog Link)

1. **Chủ đề bị phản hồi lặp lại nhiều nhất**:
   * Học viên khó nhận biết nút xem đoạn bài giảng nguồn khi bấm vào mã trích dẫn slide (`source_id`).

2. **Cải tiến sản phẩm thực hiện ngay trước Demo (Ghi nhận vào `spec.md` §9 Changelog)**:
   * **Cải tiến UI**: Thêm popup/tooltip hiển thị trực tiếp đoạn trích dẫn nguyên văn slide bài giảng khi người dùng click vào mã `source_id` trên giao diện Quiz.

3. **Ý kiến giữ nguyên (Có lý do căn cứ sản phẩm)**:
   * Giữ nguyên độ chi tiết của phần giải thích đáp án (2-3 câu) để đảm bảo tính chuẩn xác về mặt thuật toán Machine Learning / Deep Learning, tránh ngắn quá làm học viên hiểu sai bản chất.

4. **Đưa vào Backlog (Nội dung Slide 6 - Phát triển nếu có thêm 1 tuần)**:
   * Thêm nút *"Tạo bộ Quiz ôn tập riêng cho các câu đã làm sai"*.
   * Tự động gửi thông báo nhắc nhở cho nhóm sinh viên có điểm số < 60% trên Teacher Dashboard.
