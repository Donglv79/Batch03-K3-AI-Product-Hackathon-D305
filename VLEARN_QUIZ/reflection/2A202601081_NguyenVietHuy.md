# Bài Thu Hoạch Cá Nhân (Reflection)

- **Họ và tên**: Nguyễn Viết Huy
- **Mã học viên**: 2A202601081
- **Vai trò trong nhóm**: Đánh giá & Kiểm thử (Eval) & User Validation
- **Sản phẩm nhóm**: VLearn Quiz Engine & Teacher Knowledge Gap Map

---

## 1. Bài học lớn nhất rút ra từ sự kiện

Qua 1.5 ngày làm việc liên tục trong đợt Hackathon này, bài học đắt giá nhất mà mình rút ra được là **tư duy làm sản phẩm AI hoàn toàn khác biệt so với làm phần mềm truyền thống**. 

Khi xây dựng một tính năng dựa trên LLM, mình không thể chỉ viết prompt rồi hy vọng AI sẽ luôn trả ra kết quả đúng. Nếu không có một bộ test kiên cố (Golden Set) với các tình huống bẫy thực tế (như văn bản bị mơ hồ, câu hỏi ngoài phạm vi hay các khái niệm chuyên ngành dễ nhầm lẫn), sản phẩm rất dễ "vỡ" ngay khi trao vào tay người dùng thật. Việc tự tay thiết kế 20 test cases, nạp API Key thật của Gemini 3.5 và đo lường tỷ lệ % Đạt đối chiếu với Quality Bar giúp mình hiểu rằng **bằng chứng đo lường thực tế mới là thước đo duy nhất cho chất lượng của một sản phẩm AI**.

---

## 2. Điều đã làm tốt nhất & Điều lẽ ra nên làm khác đi

* **Điều mình làm tốt nhất**:
  * Xây dựng bộ Golden Set 20 test cases bám sát 100% kiến thức 3 môn học (*Deep Learning, Computer Vision, Machine Learning*), trong đó có 10 câu lấy nguyên văn từ quan sát thực tế (chatlog VLearn, Discord và quote phỏng vấn).
  * Thiết kế giao diện Teacher Knowledge Gap Dashboard trực quan, giúp giảng viên phát hiện ngay các câu sinh viên sai.
  * Tích hợp thành công script chạy eval tự động với API Gemini 3.5 thật.

* **Điều lẽ ra nên làm khác đi**:
  * Trong các lượt chạy test đầu tiên, mình chưa lường trước hết giới hạn Rate Limit (5 lượt gọi/phút) của bản Free Tier Gemini API, dẫn đến việc bị dính lỗi 429 và mất thời gian ngồi gỡ. Nếu làm lại, mình sẽ cài đặt cơ chế giãn cách thời gian (pacing delay 13s) và retry exponential backoff ngay từ dòng code đầu tiên để quá trình eval diễn ra mượt mà hơn.

---

## 3. Nhận xét về sự phối hợp trong nhóm

Mình cảm thấy rất may mắn khi được làm việc cùng các thành viên trong nhóm. Mọi người làm việc cực kỳ có trách nhiệm và tôn trọng cam kết chung. Nhờ chốt cứng hợp đồng dữ liệu JSON (schema contract) ngay từ mốc CP2, việc mình lấy output từ Quiz Engine của Người 3 để gắn vào Teacher Dashboard và chạy Runner Eval diễn ra rất trơn tru, hầu như không bị xung đột code. Cả nhóm đã hỗ trợ nhau đổi chéo test sản phẩm và chuẩn bị kịch bản thuyết trình rất nhịp nhàng cho buổi Demo.
