# Reflection — Nguyễn Viết Huy · 2A202601081

## Vai trò và phần tôi chịu trách nhiệm

Tôi phụ trách Đánh giá & Kiểm thử (Eval) & User Validation trong nhóm làm VLearn Quiz Engine & Teacher Knowledge Gap Map. Phần việc chính của tôi là xây dựng bộ test đo chất lượng đầu ra AI, thiết kế giao diện Teacher Knowledge Gap Dashboard và chạy eval bằng API thật để đối chiếu với Quality Bar của nhóm.

## Tôi đã làm gì

Tôi xây dựng bộ Golden Set 20 test cases bám sát 100% kiến thức 3 môn học (Deep Learning, Computer Vision, Machine Learning), trong đó có 10 câu lấy nguyên văn từ quan sát thực tế (chatlog VLearn, Discord và quote phỏng vấn) chứ không tự bịa tình huống test. Tôi thiết kế giao diện Teacher Knowledge Gap Dashboard trực quan, giúp giảng viên phát hiện ngay các câu sinh viên sai. Tôi cũng tích hợp thành công script chạy eval tự động, nạp API Key thật của Gemini 3.5 và đo lường tỷ lệ % Đạt đối chiếu với Quality Bar, thay vì chỉ đánh giá cảm tính.

## AI đã hỗ trợ thế nào

Qua 1,5 ngày làm việc liên tục trong đợt Hackathon này, tôi nhận ra tư duy làm sản phẩm AI hoàn toàn khác biệt so với làm phần mềm truyền thống: không thể chỉ viết prompt rồi hy vọng AI sẽ luôn trả ra kết quả đúng. Việc tự tay thiết kế 20 test case với các tình huống bẫy thực tế — văn bản bị mơ hồ, câu hỏi ngoài phạm vi, khái niệm chuyên ngành dễ nhầm lẫn — rồi cho chạy thật qua Gemini 3.5 API, giúp tôi hiểu rằng bằng chứng đo lường thực tế mới là thước đo duy nhất cho chất lượng của một sản phẩm AI, chứ không phải cảm giác "prompt đã viết đủ tốt".

Tôi không coi một lượt chạy eval là đáng tin nếu chưa đối chiếu với Quality Bar đã chốt trước, và không chấp nhận đánh giá dựa trên vài ví dụ xem qua thay vì chạy hết bộ Golden Set.

## Failure thật và bài học

Failure đáng nhớ nhất là trong các lượt chạy test đầu tiên. Trigger là tôi chưa lường trước hết giới hạn Rate Limit (5 lượt gọi/phút) của bản Free Tier Gemini API. Biểu hiện là script bị dính lỗi 429 liên tục khi gọi API dồn dập, khiến tôi mất thời gian ngồi gỡ thay vì tập trung vào việc đọc kết quả eval.

Tôi sửa bằng cách cài đặt cơ chế giãn cách thời gian (pacing delay 13 giây) và retry exponential backoff cho script eval, giúp quá trình chạy 20 test case diễn ra mượt mà mà không bị chặn API giữa chừng.

Bài học của tôi là khi thiết kế bất kỳ script nào gọi API thật, giới hạn rate limit của tier đang dùng phải được tính vào thiết kế ngay từ đầu, không phải xử lý phát sinh sau khi đã dính lỗi. Ở lần sau, tôi sẽ cài pacing/retry ngay từ dòng code đầu tiên thay vì viết xong vòng lặp gọi API rồi mới thêm cơ chế chống rate limit.

## Điều tôi giải thích được khi bị hỏi

Tôi có thể giải thích vì sao 10 trong 20 test case của Golden Set phải lấy nguyên văn từ chatlog/Discord/phỏng vấn thay vì tự bịa: để đảm bảo bộ test phản ánh đúng tình huống người dùng thật sẽ gặp, không chỉ những case dễ mà AI luôn trả lời đúng.

Nhờ chốt cứng hợp đồng dữ liệu JSON (schema contract) ngay từ mốc CP2, tôi có thể giải thích cách mình lấy output từ Quiz Engine của Người 3 để gắn vào Teacher Dashboard và chạy Runner Eval mà hầu như không bị xung đột code với phần của người khác. Tôi cũng có thể giải thích vì sao tỷ lệ % Đạt phải đối chiếu với Quality Bar đã thống nhất trước, thay vì tự đặt ngưỡng "đạt" sau khi đã thấy kết quả.
