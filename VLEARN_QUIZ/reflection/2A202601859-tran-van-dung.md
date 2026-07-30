# Reflection — Trần Văn Dũng · 2A202601859

## Vai trò và phần tôi chịu trách nhiệm

Tôi phụ trách Product/Evidence, tập trung vào việc xác định đúng nhu cầu người học, chuyển bằng chứng từ dữ liệu thành quyết định sản phẩm và hoàn thiện AI Spec. Phần việc chính của tôi gồm JTBD, evidence mining, phạm vi lát cắt, quality bar và cách trình bày ranh giới giữa phần chạy thật với phần mock/backlog.

## Tôi đã làm gì

Tôi tham gia xây dựng `spec.md`, đặc biệt là §1 User & Job, §2 Impact, quyết định chọn lát cắt và §8 phân công/validation. Thay vì chỉ mô tả rằng học viên “cần quiz”, tôi dùng dữ liệu chatlog để kiểm tra quy mô vấn đề. Artifact tôi phụ trách gồm `codebase/support/evidence/mining_chatlog.py` và `codebase/support/evidence/mining_report.md`.

Kết quả mining cho thấy trong 1.261 lượt hỏi–đáp, tutor chỉ chủ động hỏi lại để kiểm tra mức hiểu ở 3 lượt, tương đương 0,24%. Dữ liệu cũng cho thấy 23 lượt từ 19 người dùng trực tiếp nhắc tới quiz, kiểm tra hoặc đánh giá hiểu bài. Từ đó, tôi đề xuất core JTBD: sau khi học xong một bài giảng, học viên cần tự kiểm tra mức hiểu và biết chính xác phần cần ôn lại.

Một quyết định tôi tham gia chốt là thu hẹp prototype thành luồng PDF → quiz có căn cứ → kết quả → knowledge gap map. Tôi không đưa dashboard lớp học, tài khoản thật và lưu submission dài hạn vào lát cắt chính vì các phần đó làm tăng phạm vi nhưng không kiểm chứng quyết định AI quan trọng nhất: câu hỏi nào có đủ căn cứ nguồn để được hiển thị. Tôi cũng thống nhất quality bar ở mức tối thiểu 80% tổng số case và không cho phép bất kỳ bad citation nào.

## AI đã hỗ trợ thế nào

AI hỗ trợ tôi hệ thống hóa nội dung chatlog, gợi ý cấu trúc báo cáo mining và rà soát AI Spec theo các mục của rubric. AI cũng giúp tạo các phép đếm có thể chạy lại và chỉ ra những phần spec còn thiếu như cost-of-error, các lớp chỗ khó và kế hoạch validation.

Tôi không coi nội dung AI tạo ra là bằng chứng nếu chưa đối chiếu với artifact gốc. Các con số được giữ trong báo cáo phải truy vết được về script và dữ liệu, còn nhận định về willingness-to-use được đánh dấu là chưa đủ bằng chứng cho tới khi có người dùng thật xác nhận.

Một output AI tôi không chấp nhận là kết luận trung gian rằng hệ thống đạt 30/30 case. Khi kiểm tra lại, nhóm phát hiện evaluator đã tính cả `citation.quote` vào topic coverage. Điều này khiến keyword có trong nguồn bị hiểu nhầm thành nội dung đã thực sự được hỏi trong quiz. Vì vậy, nhóm loại kết quả 30/30 này và không sử dụng nó làm số cuối.

## Failure thật và bài học

Failure đáng nhớ nhất là lượt chấm trung gian đạt 100% nhưng là PASS giả. Trigger là logic evaluator gộp citation vào phần văn bản dùng để kiểm tra topic coverage. Biểu hiện là một số case được đánh PASS dù câu hỏi không kiểm tra đủ chủ đề bắt buộc. Nếu dùng con số này trong bài nộp, nhóm sẽ báo cáo chất lượng cao hơn thực tế và làm giảm độ tin cậy của toàn bộ phần eval.

Nhóm sửa bằng cách loại citation và distractor khỏi nội dung dùng để chấm coverage, sau đó chạy lại cùng output. Kết quả strict giảm xuống 25/30, rồi đạt 27/30 sau khi sửa lỗi chuẩn hóa Unicode và alias song ngữ. Ba failure coverage còn lại được giữ nguyên thay vì nới tiêu chí để làm đẹp số.

Bài học của tôi là một metric chỉ có giá trị khi logic đo đúng hành vi cần đánh giá. Ở lần sau, tôi sẽ viết rõ định nghĩa PASS/FAIL và tạo các regression test phản ví dụ trước khi xem kết quả tổng. Tôi cũng sẽ tách sớm ba loại bằng chứng: bằng chứng về nhu cầu, bằng chứng về willingness-to-use và bằng chứng về chất lượng kỹ thuật, vì một loại không thể thay thế cho hai loại còn lại.

## Điều tôi giải thích được khi bị hỏi

Tôi có thể giải thích cách pipeline evidence mining đọc chatlog đã ẩn danh, đếm intent theo quy tắc deterministic và tạo báo cáo có thể tái lập. Tôi cũng có thể giải thích vì sao nhóm chọn Grounded Quiz thay vì tóm tắt hoặc chatbot tổng quát, vì sao exact citation là điều kiện cứng và vì sao kết quả cuối 27/30 đáng tin hơn lượt 30/30 trung gian.

Về phạm vi sản phẩm, tôi có thể trình bày ranh giới giữa phần thật và phần mock: ingestion PDF, gọi mô hình, schema validation, citation verifier và student flow là phần chạy thật; teacher dashboard, account thật và persistence dài hạn là mock/backlog. Tôi cũng có thể giải thích kế hoạch validation: ít nhất 5 người test ngoài nhóm, trong đó ít nhất 2 willing users, ghi lại hành vi và quote nguyên văn thay vì tự suy đoán phản hồi.
