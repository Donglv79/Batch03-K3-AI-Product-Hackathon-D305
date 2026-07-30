# Reflection — Đàm Lê Minh Quân · 2A202601451

## Vai trò và phần tôi chịu trách nhiệm

Tôi phụ trách Student Flow (Người 4) trong nhóm làm VLearn Quiz Engine & Teacher Knowledge Gap Map. Phần việc chính của tôi là toàn bộ luồng phía học viên: chọn buổi học, sinh quiz, làm bài với feedback đúng/sai từng câu, xem kết quả và bản đồ lỗ hổng kiến thức. Tôi chịu trách nhiệm giữ đúng nguyên tắc zero-hallucination ở tầng UI — mọi câu hỏi hiển thị cho học viên đều phải gắn được `source_id` trích đúng slide/transcript.

## Tôi đã làm gì

Tôi xây dựng toàn bộ `codebase/student-flow/`, đúng theo hợp đồng dữ liệu (`Quiz`/`Question` type trong `lib/mockQuiz.ts`) để Người 3 (Gemini quiz engine) có thể cắm API thật vào mà không cần đổi phần render — chỉ cần thay lời gọi trong `handleGenerate()`.

Trong quá trình làm, tôi chủ động phát hiện và bỏ một bộ quiz Day 2 mà chính mình từng tự soạn tay trước đó, chỉ giữ lại đúng 1 bộ có nguồn transcript rõ ràng, để không lẫn nội dung tự dựng cá nhân với nội dung Người 2/3 sẽ nạp/sinh thật. Tôi cũng xử lý case `citation: null`: khi AI không có căn cứ nguồn, UI hiện cảnh báo thay vì hiện đáp án, tránh để giao diện ngầm hợp thức hoá nội dung không có trích dẫn.

Tôi không chỉ soát tay code mà chạy thử thật `npm install`, `npm run dev` và `npm run build` trước khi coi phần việc là xong.

## AI đã hỗ trợ thế nào

Tôi dùng Claude Code để dựng khung Next.js/TypeScript cho các component, giúp mình đi nhanh hơn nhiều so với viết tay từ đầu. Chính AI cũng là bên phát hiện ra một lỗ hổng bảo mật mức critical trong Next.js 14.2.5 khi chạy `npm run build` — thứ mà nếu chỉ tự soát tay code, không thực sự chạy build/test, mình gần như chắc chắn bỏ sót vì nó không lộ ra khi chạy `npm run dev` bình thường.

Tôi không coi code AI sinh ra là dùng được ngay chỉ vì chạy được trên `npm run dev`. Nguyên tắc tôi giữ là: AI sinh code rất nhanh, nhưng phải tự kiểm chứng lại bằng cách đọc hiểu và chạy thử thật trước khi merge, không copy-paste mà không hiểu.

## Failure thật và bài học

Failure đáng nhớ nhất là ở CP5, khi cho học viên thật dùng thử. Feedback từ Đỗ Duy Đức: "Bấm vào mã slide_12 không thấy nó hiện đoạn bài giảng ra xem lại..." Trigger là: nhóm làm rất tốt phần grounding, mọi câu hỏi đều gắn `source_id` trích đúng nguồn, nhưng lại không cho học viên cách nào để tự xem lại đoạn nguồn đó. Biểu hiện là mã trích dẫn hiện trên câu hỏi nhưng không xem lại được đúng đoạn nguồn tương ứng, khiến với người dùng, "AI không bịa" chỉ là lời hứa suông chứ không phải thứ họ cảm nhận được.

Nhóm phản ứng nhanh, thống nhất bổ sung ngay popup/tooltip hiển thị nguyên văn trích dẫn khi tương tác với `source_id` trên giao diện Quiz, và cập nhật kịp cho mốc nộp CP5.

Bài học của tôi là zero-hallucination là điều kiện cần chứ không phải điều kiện đủ: trích dẫn đúng mà không verify được thì với người dùng cũng như không có trích dẫn. Ở lần sau, với mỗi tính năng liên quan đến citation, tôi sẽ tự đóng vai người dùng cuối, tự hỏi "nếu mình là học viên, mình có verify được claim này bằng một cú click không?" ngay từ lúc thiết kế UI, thay vì chỉ kiểm tra luồng logic chấm điểm và chờ đến khi có người dùng thật mới phát hiện ra.

## Điều tôi giải thích được khi bị hỏi

Tôi có thể giải thích vì sao `Quiz`/`Question` type trong `lib/mockQuiz.ts` được chốt sớm và giữ cố định: để student-flow của tôi, quiz engine của Người 3 và luồng nạp dữ liệu của Người 2 phối hợp trơn tru mà không phải chờ nhau — tôi dựng UI trên mock đúng shape, khi có endpoint thật chỉ cần thay lời gọi trong `handleGenerate()` mà không phải sửa phần render.

Tôi cũng có thể giải thích vì sao UI xử lý `citation: null` bằng cảnh báo thay vì ẩn đi hoặc hiện đáp án bình thường, vì sao bộ quiz Day 2 tự soạn tay bị loại khỏi bản demo, và vì sao nhóm coi việc chạy thử `npm run build` thật là bắt buộc chứ không chỉ chạy `npm run dev` — chính bước đó phát hiện ra lỗ hổng bảo mật critical trong Next.js 14.2.5.
