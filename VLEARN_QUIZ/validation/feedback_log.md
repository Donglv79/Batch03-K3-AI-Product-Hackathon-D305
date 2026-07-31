# User Validation Log — CP5

> Không điền dữ liệu giả. Mỗi dòng phải đến từ một phiên người thật ngoài nhóm.

## Protocol 10 phút

1. Giao task: “Hãy nạp bài giảng này, làm quiz và dùng kết quả để chỉ ra phần bạn cần ôn lại.”
2. Im lặng quan sát; không hướng dẫn vị trí nút.
3. Hỏi: “Điều gì khó hiểu hoặc khó chịu nhất?”
4. Hỏi: “Bạn có tin kết quả này không — vì sao?”
5. Hỏi: “Bạn có dùng thật không — vì sao hoặc vì sao chưa?”

## Log

| # | Người thử (tên/vai) | Willing user từ CP1? | Task | Quan sát hành vi | Quote nguyên văn | Tin kết quả? | Có dùng thật? | Mức nghiêm trọng |
|---|---|:---:|---|---|---|---|---|:---:|
| 1 | **Đỗ Duy Đức**<br>Học viên | **Có** | Làm thử quiz bài giảng Computer Vision (RGB vs HSV). | Bấm khoanh đáp án nhanh nhưng dừng khoảng 5 giây để tìm nút xem lại đoạn slide trích dẫn nguồn. | “Ủa cái nút trích dẫn slide nằm góc nào z, bấm vào slide_12 méo thấy nó hiện cái đoạn bài giảng ra xem lại gì hết bro” | Chưa ghi nhận | Chưa ghi nhận | Vừa |
| 2 | **Dương Đức Trung**<br>Học viên | **Có** | Thử làm quiz bài giảng Deep Learning (MSE vs MAE). | Đọc câu hỏi xong gật đầu, đánh giá câu hỏi hữu ích nhưng cho rằng phần giải thích đáp án quá dài. | “Quiz ngon đấy đúng câu t hay khoanh nhầm trên lớp, mà cái đoạn giải thích dài vcl ngắn lại tầm 2 dòng thôi đọc cho lẹ” | Chưa ghi nhận | Chưa ghi nhận | Thấp |
| 3 | **Nguyễn Bùi Anh Tuấn**<br>Học viên | Không | Làm quiz Machine Learning và xem Bản đồ lỗ hổng. | Sau khi xem Bản đồ lỗ hổng kiến thức cá nhân, loay hoay tìm nút làm lại riêng các câu sai. | “Đù nhìn bản đồ này mới biết t đang hổng nặng phần Boosting, mà có nút làm lại riêng mấy câu sai ko z” | Chưa ghi nhận | Chưa ghi nhận | Thấp |
| 4 | **Hoàng Thanh Chiến**<br>Học viên | Không | Thử nút Báo lỗi câu hỏi trên giao diện quiz. | Tìm thấy nút báo lỗi nhanh, sau đó kiểm tra liệu phản hồi có được gửi ngay về hệ thống hay không. | “Mấy câu bẫy này ảo thật sự, cơ mà bấm nút báo lỗi câu hỏi phát là nó gửi về dashboard giảng viên luôn hả, tiện đấy” | Chưa ghi nhận | Chưa ghi nhận | Thấp |
| 5 | **Giảng viên D302**<br>Giảng viên | Không | Trải nghiệm Teacher Knowledge Gap Dashboard. | Xem kỹ biểu đồ các câu sinh viên làm sai trên 50% và thử nút “Giảng lại câu này”. | “Biểu đồ lỗ hổng kiến thức này rất trực quan. Giúp tôi biết ngay buổi tới cần dành 15 phút chiếu lại slide 43 để giảng lại phần ResNet cho cả lớp.” | Chưa ghi nhận | Chưa ghi nhận | Thấp |
| 6 | **Trần Hoàng Vũ**<br>Học viên | Không | Gen quiz từ tài liệu upload | Ấn nút "Tạo quiz từ dữ liệu" ở bên dưới thì hệ thống gen ra 3 câu quiz thay vì 5 câu như user chọn. | “Nãy tôi chọn 5 câu mà bài quiz chỉ ra có 3 câu là sao nhỉ” | Tin | Có | Thấp |
| 7 | **Vũ Đăng Huy**<br>Học viên | Không | Gen quiz từ tài liệu upload, Làm quiz | User ấn nút tạo quiz, tuy nhiên thời gian tạo khá lâu; User làm bài quiz không thấy có bộ đếm thời gian | “Gen lâu quá”;"Cái làm quiz không có bộ đếm thời gian à" | Tin | Có | Thấp |

## Tổng hợp sau test

- Chủ đề nổi bật: người dùng hiểu giá trị của quiz/gap map nhưng cần hành động tiếp theo rõ hơn — mở đúng đoạn nguồn, làm lại câu sai và biết phản hồi được gửi đi đâu.
- Ưu tiên trước demo, chưa xác nhận đã triển khai: làm rõ hành động xem trích dẫn và rút gọn phần giải thích đáp án; kiểm tra lại bằng một lượt usability test ngắn.
- Quyết định giữ nguyên: tiếp tục dùng Knowledge Gap Map vì học viên nhận ra phần Boosting còn yếu và giảng viên thấy dashboard hữu ích để quyết định nội dung cần giảng lại.
- Backlog nếu có thêm một tuần: persistence submission, dashboard lớp thật, deep-link citation về trang PDF.

## Changelog liên kết

| Feedback # | Thay đổi | File/commit | Trạng thái |
|---|---|---|---|
| 1 | Làm rõ nút mở đoạn nguồn và deep-link tới đúng slide/chunk | `codebase/student-flow/components/QuizScreen.tsx`, `SlideViewer.tsx` | Đã triển khai; cần usability test lại |
| 2 | Rút gọn phần giải thích xuống nội dung đọc nhanh | `codebase/student-flow/lib/mockQuiz.ts`, `QuizScreen.tsx` | Đã triển khai; cần usability test lại |
| 3 | Thêm luồng làm lại riêng câu sai | `codebase/student-flow/components/ResultScreen.tsx`, `App.tsx` | Đã triển khai; cần usability test lại |
| 4 | Hiển thị trạng thái phản hồi đã được gửi hay mới chỉ là demo | `codebase/student-flow/components/QuizScreen.tsx` | Đã triển khai: ghi rõ chỉ lưu trong phiên, chưa gửi máy chủ |
| 5 | Giữ Knowledge Gap Dashboard; làm rõ dữ liệu dashboard hiện là mock | `codebase/student-flow/components/TeacherDashboard.tsx` | Đã tổng hợp lượt nộp trong phiên, tìm kiếm và xuất CSV; chưa nối dữ liệu lớp thật |
