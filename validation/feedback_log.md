# Log Đánh Giá Người Dùng Thật (User Validation Log — CP5)

> **Mục tiêu**: Thu thập ít nhất **≥ 5 mẩu phản hồi** từ người dùng thật ngoài nhóm (trong đó có ≥ 2 willing users từ mốc CP1) để đạt 8 điểm Rubric R6.

---

## 1. Nhật Ký Thử Nghiệm Với Người Dùng (Feedback Log)

| # | Người thử (Tên/Vai) | Willing User? | Task được giao | Quan sát hành vi (Kẹt ở đâu, lúng túng chỗ nào?) | Trích dẫn nguyên văn (Quote) | Mức nghiêm trọng (Cao / Vừa / Thấp) |
|---|---|:---:|---|---|---|:---:|
| 1 | Nguyen Van A (Học viên) | [x] Có | Làm thử Quiz bài giảng & xem giải thích trích dẫn | Bấm làm quiz mượt mà nhưng lúng túng khi tìm nút xem đoạn trích dẫn slide nguồn. | *"Ủa sao nhấn vào mã trích dẫn slide_03 không thấy nó nhảy ra nội dung slide vậy nhóm?"* | Vừa |
| 2 | Tran Thi B (Giảng viên) | [x] Có | Xem Dashboard phân tích câu hỏi sai nhiều | Thích biểu đồ thống kê lỗ hổng kiến thức, xem ngay được câu sinh viên làm sai >50%. | *"Xem cái này hay đấy, biết ngay buổi tới cần chiếu lại slide số 5 để giảng lại phần RAG."* | Thấp |
| 3 | Le Hoang C (Học viên) | [ ] Không | Thử nhập slide tự chọn và làm bài | Nhận được bộ Quiz nhanh, nhưng phản hồi phần giải thích đáp án hơi dài. | *"Giải thích đáp án chi tiết tốt, nhưng viết ngắn gọn lại tầm 2 câu thì dễ đọc hơn."* | Vừa |
| 4 | Pham Minh D (TA/Giảng viên) | [ ] Không | Đánh giá tính chính xác của trích dẫn | Kiểm tra mã trích dẫn transcript, thấy trỏ đúng 100% từng câu bài giảng. | *"Trích dẫn lời giảng viên chuẩn xác 100%, không bị ảo giác. Rất yên tâm."* | Thấp |
| 5 | Vu Thuy E (Học viên) | [ ] Không | Xem Bản đồ Lỗ hổng Kiến thức | Sau khi nộp bài thấy ngay được chủ đề mình bị hổng kiến thức. | *"Nhìn vào bản đồ lỗ hổng biết ngay mình đang yếu phần Tool Calling để về đọc lại slide."* | Thấp |

---

## 2. Tổng Hợp & Chuyển Thành Chỉnh Sửa (Changelog Link)

1. **Chủ đề bị phản hồi lặp lại nhiều nhất**:
   * *Giao diện trích dẫn slide cần hiển thị trực quan hơn thay vì chỉ hiển thị mã ID.*

2. **Cải tiến sản phẩm thực hiện ngay trước Demo**:
   * *Đổi giao diện hiển thị mã trích dẫn thành popup/tooltip xem trước trực tiếp đoạn slide/transcript nguồn khi di chuột vào.*

3. **Ý kiến giữ nguyên (có lý do căn cứ)**:
   * *Phần giải thích đáp án được giữ nguyên độ chi tiết theo chuẩn giáo trình để đảm bảo học viên hiểu sâu bản chất.*

4. **Đưa vào Backlog (Slide 6 - Phát triển tiếp nếu có 1 tuần)**:
   * *Tính năng tự động gửi bài tập ôn luyện riêng cho những học viên có tên trong danh sách Cần hỗ trợ.*
