# Reflection — Đào Đức Mạnh · 2A202601833

## Vai trò và phần tôi chịu trách nhiệm

Tôi phụ trách vai trò **Người 3 — Gemini Quiz Engine**. Phần tôi chịu trách nhiệm là nhận JSON đầu vào từ Người 2, gọi Gemini để sinh quiz, chuẩn hóa output JSON, kiểm tra cấu trúc câu hỏi, và xác minh trích dẫn nguồn trước khi chuyển kết quả cho Student Flow và Teacher Dashboard.

Phạm vi chính của tôi không phải là giao diện upload hay giao diện làm quiz, mà là phần lõi AI quyết định: từ nội dung tài liệu đã được chunk, hệ thống sinh ra 15 câu hỏi trắc nghiệm có đáp án, giải thích và citation.

## Tôi đã làm gì

Tôi triển khai module `codebase/quiz_engine/` với các file chính:

- `engine.py`: điều phối toàn bộ flow `generate_quiz()`.
- `gemini_client.py`: gọi Gemini qua REST API, đọc `GEMINI_API_KEY` và `MODEL` từ `.env`.
- `prompt_builder.py`: tạo prompt yêu cầu Gemini trả JSON đúng schema và chỉ dùng nguồn được cung cấp.
- `schema.py`: validate input từ Người 2 và output quiz từ Gemini.
- `citation_verifier.py`: kiểm tra `citation.quote` có nằm nguyên văn trong `chunks[].text`.
- `sample_input.json`: ví dụ input đúng contract của Người 2.
- `sample_output.json`: ví dụ output đủ 15 câu để Người 4 và Người 5 tích hợp.
- `README.md`: tài liệu cách dùng module và contract input/output.

Quyết định kỹ thuật tôi trực tiếp đưa ra là không tin hoàn toàn vào citation do Gemini sinh. Tôi thêm bước verify local bằng exact string match: mỗi câu hỏi chỉ được coi là hợp lệ khi `citation.source_id` tồn tại và `citation.quote` xuất hiện nguyên văn trong chunk nguồn.

## AI đã hỗ trợ thế nào

AI hỗ trợ tôi trong việc phác thảo cấu trúc module, viết prompt ban đầu, sinh code Python cho các hàm validate/verify, và tạo sample output đủ 15 câu.

Phần tôi kiểm tra lại là contract JSON với Người 2, logic verify citation, output JSON cho Người 4/5, và cách lưu trace để chứng minh có gọi AI thật. Tôi cũng kiểm tra cú pháp Python bằng `py_compile` và kiểm tra sample output có đủ 15 câu.

Một output AI tôi không chấp nhận là đề xuất ban đầu chỉ cần gọi Gemini rồi trả trực tiếp câu hỏi cho frontend. Tôi không dùng cách đó vì nó không bảo đảm trích dẫn nguyên văn từ tài liệu. Nếu không có bước verify citation, câu trả lời có thể nghe hợp lý nhưng không trace được về nguồn.

## Failure thật và bài học

Failure chính của nhóm ở phần tôi phụ trách là: **AI có thể sinh câu hỏi và giải thích đúng ý nhưng citation không phải trích dẫn nguyên văn**.

Trigger: Gemini nhận nhiều chunk nội dung và được yêu cầu sinh câu hỏi có giải thích kèm trích dẫn.

Biểu hiện: `citation.quote` có thể là câu được model diễn giải lại, rút gọn, hoặc ghép ý từ nhiều câu, nên không tìm thấy nguyên văn trong `chunks[].text`.

Hậu quả: học viên nhìn thấy trích dẫn nhưng không thể kiểm chứng lại trong tài liệu gốc. Điều này làm giảm độ tin cậy của feature, và trong ngữ cảnh học tập có thể khiến học viên học sai hoặc giảng viên hiểu nhầm chất lượng câu hỏi.

Cách sửa: tôi thêm `verify_citations()` để kiểm tra exact match giữa `citation.quote` và chunk nguồn. Câu hỏi nào không qua kiểm tra sẽ có trạng thái lỗi hoặc bị loại khỏi danh sách câu hỏi verified.

Lần sau tôi sẽ làm khác ở hai điểm: chốt citation contract sớm hơn với Người 2, và thêm retry riêng cho các câu fail citation thay vì chỉ loại bỏ câu hỏi sau khi generate.

## Điều tôi giải thích được khi bị hỏi

Tôi giải thích được luồng code của `quiz_engine` như sau:

1. `generate_quiz()` nhận document JSON từ Người 2.
2. `validate_document_input()` kiểm tra input có đúng schema: `document_id`, `statistics`, `chunks`, `source_id`, `parent_source_id`, `text`.
3. `select_chunks()` chọn nội dung đưa vào prompt.
4. `build_prompt()` tạo prompt bắt Gemini sinh đúng 15 câu single-choice và citation phải copy nguyên văn từ chunk.
5. `call_gemini()` gọi Gemini thật.
6. `parse_json_response()` parse output model thành JSON.
7. `validate_generated_quiz()` kiểm tra mỗi câu có đủ options, đáp án đúng, explanation và citation.
8. `verify_citations()` kiểm tra quote có nằm trong chunk nguồn.
9. `normalize_quiz()` trả output cuối cùng cho Student Flow và Dashboard.

Tôi cũng giải thích được vì sao phần citation verifier quan trọng: nó là lớp bảo vệ để Quiz Engine không chỉ sinh câu hỏi nghe hợp lý, mà còn có căn cứ kiểm chứng được từ slide/transcript.
