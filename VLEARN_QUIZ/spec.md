# AI SPEC — VLearn Diagnostic Quiz · Nhóm [TBD] · Zone [TBD]

Hướng: [x] A — VLearn  [ ] B — Trợ lý Học viên  [ ] C — Làn mở
Loại: [ ] Tối ưu tính năng có sẵn  [x] Tính năng mới

> **V0.1 — phục vụ CP2/CP3.** Mục `TBD` hoặc “giả thuyết” chưa phải evidence hay cam kết. Quality bar chỉ chốt sau khi có golden set và giữ nguyên sau hạn 23:59 ngày 1.

## Tóm tắt

VLearn Diagnostic Quiz tạo **một câu trắc nghiệm chẩn đoán dạng vận dụng** từ nội dung vừa giảng, gắn mỗi đáp án sai với một hiểu lầm cụ thể, để giảng viên biết lớp đang vướng ở đâu và tự quyết định tiếp tục hay giảng lại.

## §1. User & Job

### Job executor

- **Primary user:** Giảng viên đang giảng trực tiếp và cần điều chỉnh nhịp giảng ngay trong buổi học.
- **Secondary user:** Học viên trả lời một câu A/B/C/D; không đưa ra quyết định trung tâm.

### Workflow hiện tại — giả thuyết cần xác minh

1. Giảng viên vừa hoàn thành một khái niệm.
2. Giảng viên quan sát lớp hoặc hỏi miệng xem học viên đã hiểu chưa.
3. Chỉ một phần học viên phản hồi; sự im lặng có thể bị hiểu là đã hiểu.
4. Giảng viên quyết định tiếp tục hoặc giải thích lại dựa trên tín hiệu chưa đầy đủ.
5. Lỗ hổng có thể chỉ xuất hiện khi học viên làm bài hoặc hỏi lại sau đó.

### Core JTBD

> Nhận biết nhanh cả lớp đang hiểu đúng hay hiểu sai ở đâu để điều chỉnh nhịp giảng ngay trong buổi học.

### Problem statement

> **Giả thuyết:** Khi vừa hoàn thành một khái niệm, giảng viên thiếu tín hiệu nhanh và có thể diễn giải về việc cả lớp đang hiểu đúng hay đang hiểu sai ở đâu, nên có thể tiếp tục bài trước khi các lỗ hổng kiến thức được phát hiện.

### Evidence hiện có

Từ toàn bộ `chat_history_anonymized_for_hackathon.csv`:

- Có **1.261 lượt hỏi–đáp** giữa học viên và tutor.
- Tutor chỉ chủ động hỏi kiểm tra hiểu bài ở **3/1.261** lượt.
- `misconceptions` và `follow_ups` chưa được sử dụng trong **1.261/1.261** câu trả lời tutor.

Các số liệu này chỉ chứng minh khoảng trống hệ thống, **chưa chứng minh pain của giảng viên**.

### Evidence cần bổ sung

- [ ] Log phỏng vấn giảng viên/TA: lần gần nhất, current alternative, tần suất và hậu quả.
- [ ] Số người và tỷ lệ xác nhận pain: TBD.
- [ ] Ít nhất 5 quote/ví dụ nguyên văn có nguồn: TBD.
- [ ] Ít nhất 3 giảng viên/TA đồng ý thử prototype: TBD.
- [ ] Chọn chuẩn evidence A và/hoặc B, ghi phương pháp kiểm tra lại được.

## §2. Impact & quyết định chọn

| Ứng viên | User/job | Bao nhiêu người | Tần suất | Tốn gì | Khả thi | Quyết định |
|---|---|---:|---:|---|---|---|
| Trắc nghiệm chẩn đoán giúp quyết định tiếp tục/giảng lại | Giảng viên điều chỉnh nhịp giảng | TBD | TBD | TBD | Một câu demo được | Đang chọn |
| Giúp giảng viên tạo quiz nhanh hơn | Giảng viên chuẩn bị câu hỏi | TBD | TBD | TBD phút | Có | So sánh |
| Giúp học viên tự ôn sau buổi | Học viên tự kiểm tra | TBD | TBD | TBD | Có | So sánh |

### Lý do chọn tạm thời

- Có quyết định rõ ràng: **tiếp tục hay giảng lại**.
- Cho biết học viên hiểu sai ở đâu, không chỉ đúng/sai.
- Prototype được bằng một nguồn, một câu và một lượt trả lời mô phỏng.
- AI phù hợp với tạo tình huống vận dụng và distractor gắn misconception.

### Điều kiện giữ quyết định

1. Evidence xác nhận giảng viên thiếu tín hiệu đủ tốt trong giờ.
2. Pain đủ thường xuyên hoặc có hậu quả đáng kể.
3. Misconception làm thay đổi hành động của giảng viên.
4. Có ít nhất 3 target users đồng ý thử.

Ứng viên bị loại và lý do bằng số: **TBD sau phỏng vấn/mining**.

## §3. Giải pháp tương tự

| Sản phẩm | Flow | Đáng học | Đáng né | Nhóm khác gì |
|---|---|---|---|---|
| Kahoot/Mentimeter | TBD | TBD | TBD | Tập trung misconception và quyết định giảng viên |
| Quizizz hoặc tương tự | TBD | TBD | TBD | Một câu chẩn đoán grounded từ bài giảng |
| Sản phẩm AI học tập khác | TBD | TBD | TBD | TBD |

Mỗi quan sát phải đến từ dùng thử thật, không ghi nhận xét chung như “UI đẹp”.

## §4. Thiết kế

### Lát cắt một câu

> Với giảng viên vừa dạy xong một khái niệm, hệ thống dùng AI tạo một câu hỏi trắc nghiệm chẩn đoán yêu cầu vận dụng kiến thức trong tình huống mới, với các đáp án sai gắn với những hiểu lầm phổ biến, rồi tổng hợp lựa chọn của cả lớp để giúp giảng viên quyết định tiếp tục hay giảng lại.

### Product hypothesis

> Nếu giúp giảng viên kiểm tra một khái niệm ngay sau khi giảng bằng một câu trắc nghiệm chẩn đoán có thể giải thích các đáp án sai, họ sẽ quyết định tiếp tục/giảng lại dựa trên tín hiệu rõ hơn so với hỏi miệng hoặc chỉ nhìn phần trăm đúng.

### Assumption nguy hiểm nhất

> Misconception suy ra từ phương án học viên chọn đủ tin cậy và hữu ích để giảng viên thay đổi cách giảng.

Nếu sai, dashboard có thể tạo cảm giác chính xác giả và dẫn tới quyết định không phù hợp.

### Non-goals

1. Không xây quiz nhiều câu hoặc ngân hàng câu hỏi.
2. Không tính điểm, xếp hạng hoặc theo dõi từng học viên.
3. Không xây bản đồ kiến thức cá nhân hay lịch sử nhiều buổi.
4. Không gửi hỗ trợ tự động.
5. Không hỗ trợ OCR hoặc mọi loại PDF trong MVP.
6. Không gửi quiz trước khi giảng viên duyệt.
7. Không tự quyết định thay giảng viên.
8. Không tích hợp lớp học thật trong hackathon.

### Mức prototype

- [ ] Sketch  [x] Mock  [ ] Working.
- **Thật:** Một Gemini call; kiểm tra schema/citation; tính phân bố và misconception nổi bật.
- **Mock:** Lượt trả lời của lớp; chưa có danh tính/lớp học thật.
- **Backlog:** Upload PDF tổng quát, OCR, nhiều phiên học.

### Automation

- [x] **Augment**  [ ] Conditional  [ ] Automate.

AI tạo câu hỏi và mapping misconception; giảng viên duyệt quiz và quyết định cuối. Câu hỏi sai kiến thức, có hai đáp án hợp lý hoặc mapping sai có thể khiến giảng viên đánh giá sai cả lớp; sửa trước khi gửi rẻ hơn sửa hậu quả.

### Nguyên tắc open-book

Không giấu slide. Câu hỏi phải đặt kiến thức vào tình huống mới, yêu cầu áp dụng/phân biệt/dự đoán, không sao chép câu chứa đáp án và không đòi kiến thức ngoài phần đã giảng.

### Flow tổng thể

1. Giảng viên chọn transcript/chunk có citation ID.
2. Gemini xác định learning objective và misconception.
3. Gemini tạo một câu tình huống, một đáp án đúng và ba distractor.
4. Hệ thống kiểm tra JSON, citation và slide leakage.
5. Giảng viên xem nguồn, sửa, tạo lại hoặc duyệt.
6. Học viên chọn A/B/C/D; prototype mô phỏng kết quả lớp.
7. Dashboard hiển thị phân bố và misconception nổi bật.
8. Giảng viên chọn **Tiếp tục** hoặc **Giảng lại**.

### Nguyên tắc HAX/PAIR

| Nguyên tắc | Áp cụ thể vào đâu |
|---|---|
| G1 — Làm rõ hệ thống làm được gì | Chỉ tạo một câu chẩn đoán từ nguồn được chọn |
| G2 — Làm rõ nó làm tốt đến đâu | Teacher Preview hiện nguồn, giải thích, misconception và cảnh báo duyệt |
| G10 — Thu hẹp khi nghi ngờ | Không đủ nguồn, citation sai hoặc leakage thì chặn phát hành |
| G9 — Sửa dễ dàng | Giảng viên sửa câu hỏi và từng phương án trước khi duyệt |
| G11 — Giải thích vì sao | Mỗi distractor hiện misconception và citation |
| Feedback + Control | Giảng viên có quyền bỏ, sửa, tạo lại và quyết định cuối |

## §5. Kiểu lỗi — 4 lớp chỗ khó

| # | Tình huống | Lớp | Hành vi mong muốn | Nguyên tắc |
|---|---|---|---|---|
| 1 | Nguồn không đủ để tạo câu hỏi | ① Nguồn sự thật | Không sinh ngoài nguồn; yêu cầu chọn đoạn khác | G10 |
| 2 | Citation ID sai hoặc quote không nằm trong chunk | ① Nguồn sự thật | Chặn output, ghi lỗi và retry | G2, G10 |
| 3 | Chunk có nhiều khái niệm, không rõ mục tiêu | ② Mơ hồ | Yêu cầu chọn một learning objective | G10 |
| 4 | Hai phương án đều có thể đúng | ② Mơ hồ | Không cho duyệt; sửa hoặc tạo lại | G9, G10 |
| 5 | User yêu cầu quiz nhiều câu | ③ Ngoài phạm vi | Nói rõ MVP chỉ hỗ trợ một câu | G1 |
| 6 | User yêu cầu xếp hạng học viên | ③ Ngoài phạm vi | Chỉ hiển thị dữ liệu tổng hợp | G1, Control |
| 7 | Đáp án nằm nguyên văn trên slide | ④ Domain | Đánh dấu leakage và tạo lại câu vận dụng | G2, G10 |
| 8 | Distractor vô lý hoặc không đại diện hiểu lầm | ④ Domain | Không tự gửi; yêu cầu sửa/tạo lại | G9, G11 |
| 9 | Mapping misconception không có căn cứ | ④ Domain | Hiện như giả thuyết cần duyệt, không khẳng định tuyệt đối | G2, G11 |
| 10 | Quá ít học viên trả lời | ④ Domain | Hiển thị cỡ mẫu và cảnh báo chưa đại diện | G2 |

## §6. Các đường đi trải nghiệm

- **Happy path:** Nguồn rõ → quiz đạt kiểm tra → giảng viên duyệt → lớp trả lời → dashboard → quyết định.
- **Low-confidence:** Nguồn nhiều mục tiêu hoặc nghi leakage → cảnh báo và yêu cầu chọn/sửa/tạo lại.
- **Failure:** Citation sai, JSON lỗi hoặc ngoài nguồn → chặn phát hành, ghi lỗi và retry.
- **Correction:** Giảng viên sửa câu hỏi, đáp án hoặc misconception trước khi gửi.
- **Ngoài phạm vi:** Không làm bài thi nhiều câu, điểm/xếp hạng, theo dõi cá nhân hoặc gửi hỗ trợ.
- **Case domain:** Distractor vô tình cũng đúng hoặc câu hỏi chép slide → bắt buộc sửa/tạo lại.

## §7. Kiểm thử

### Chiều chất lượng

| Chiều | Pass khi | Fail khi |
|---|---|---|
| Grounded | Đáp án/giải thích suy ra từ chunk; citation hợp lệ | Có chi tiết ngoài nguồn hoặc citation sai |
| Diagnostic transfer | Phải áp dụng/phân biệt trong tình huống mới | Chỉ hỏi lại định nghĩa/từ khóa |
| Single correct answer | Chỉ một đáp án hợp lý nhất | Có 0 hoặc ≥2 đáp án hợp lý |
| Distractor quality | Ba distractor khác nhau, hợp lý, có misconception | Vô lý, trùng hoặc không chẩn đoán được |
| No slide leakage | Không thể trả lời chỉ bằng tìm câu giống hệt | Đáp án xuất hiện nguyên/gần nguyên văn |
| Appropriate scope | Không cần kiến thức ngoài nội dung vừa giảng | Cần kiến thức bên ngoài |
| Teacher control | Chưa duyệt thì chưa gửi | Hệ thống tự gửi/tự quyết định |

### Kiểm tra rubric

Hai thành viên chấm độc lập cùng 5 output. Nếu lệch, sửa định nghĩa trước khi chấm toàn bộ và ghi vào changelog.

### Golden set

- Tối thiểu 20 case.
- 8–10 case thường.
- Ít nhất 2 case cho mỗi lớp chỗ khó.
- 2–4 case hiếm.
- Ít nhất 10 case lấy/phát triển từ dữ liệu thật.
- File dự kiến: `eval/golden-set.json` hoặc `eval/golden-set.csv`.

### Quality bar

> **TBD — chưa chốt.** Chỉ chốt bằng số sau khi golden set tồn tại và rubric đã được hai người thử chấm. Sau commit 23:59 ngày 1, giữ nguyên.

Điều kiện cứng dự kiến, chưa chốt: không pass câu sai kiến thức, citation giả hoặc lộ đáp án nguyên văn.

### Kết quả chạy

| Lượt | Model/prompt | Số case | Pass | Tỷ lệ | Failure chính | So với bar |
|---|---|---:|---:|---:|---|---|
| Run 01 | TBD | TBD | TBD | TBD | TBD | TBD |
| Run 02 | TBD | TBD | TBD | TBD | TBD | TBD |

Nhóm lưu toàn bộ case, kể cả fail; không xóa hoặc chỉnh số liệu sau khi chạy.

## §8. Phân công & kế hoạch

| Người | Vai trò | Trách nhiệm | Deliverable |
|---|---|---|---|
| Người 1 | Product Owner / Spec / Evidence / Demo | Chốt vấn đề, flow, success criteria; evidence; spec và demo | `spec.md`, README, slide, demo script |
| Người 2 | Content Ingestion & Grounding | Chọn nguồn/chunk, chuẩn hóa input, citation ID | Module ingestion, document JSON |
| Người 3 | Gemini Diagnostic Quiz Engine | Prompt, schema, AI call, validation, trace, technical eval | Quiz API, canonical JSON, trace |
| Người 4 | Quiz Experience & Integration | Teacher Preview, student trả lời một câu, nối API | Frontend flow |
| Người 5 | Teacher Dashboard / Human Eval / Validation | Dashboard, phỏng vấn, chấm output, validation | Dashboard, `eval/`, `validation/` |

### Bàn giao

1. Người 2 xuất document JSON.
2. Người 3 trả canonical quiz JSON.
3. Người 4 render Teacher Preview và Student Answer.
4. Người 5 nhận quiz JSON + response counts để render dashboard.
5. Người 1 acceptance test và cập nhật spec/demo.

### Willing users

- User 1: TBD.
- User 2: TBD.
- User 3: TBD.

### Validation CP5

- Ít nhất 5 người ngoài nhóm, trong đó ≥2 willing users đã khai.
- Task: tạo/duyệt quiz và dùng dashboard để quyết định tiếp tục/giảng lại.
- Ghi quan sát và quote nguyên văn vào `validation/feedback-log.md`.

### Multi-prototype nếu đủ thời gian

- A: Phần trăm đúng + misconception nổi bật + khuyến nghị.
- B: Chỉ phân bố đáp án, để giảng viên tự diễn giải.

Trục so sánh là mức AI đưa khuyến nghị, không phải màu giao diện.

## §9. Changelog

| Phiên bản | Đổi gì | Vì sao |
|---|---|---|
| V0.1 | Chọn trắc nghiệm chẩn đoán | Cần biết hiểu sai ở đâu, không chỉ đúng/sai |
| V0.1 | Chọn open-book và câu vận dụng | Tránh đo khả năng tìm đáp án trên slide |
| V0.1 | Chọn augment | Sai quiz có cost-of-error cao; giảng viên phải duyệt |
| V0.1 | Thu hẹp một nguồn, một câu, một dashboard | Build và demo được trong hackathon |
| V0.1 | Loại theo dõi/xếp hạng cá nhân | Không phục vụ quyết định trung tâm và có rủi ro riêng tư |
| V0.1 | Ghi nhận code chưa khớp scope | Engine sinh nhiều câu; Student Flow chấm điểm cá nhân |

## Phụ lục — Trạng thái build tại V0.1

- Student Flow build production thành công nhưng đang dùng quiz mock nhiều câu và kết quả cá nhân.
- Quiz Engine kiểm tra schema/citation cục bộ thành công nhưng mặc định sinh 15 câu.
- Hai module đang dùng JSON contract khác nhau.
- Chưa xác minh Gemini call thật trong phiên kiểm tra gần nhất.
- Upload PDF mới là UI-only; Teacher Dashboard chưa tích hợp.

Đây là trạng thái kỹ thuật để điều phối, không phải failure cuối của prototype. Canonical quiz JSON sẽ được Người 2–4 thống nhất và ghi vào README của Quiz Engine trước khi tích hợp.
