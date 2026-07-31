# AI SPEC — Grounded Lecture Quiz & Knowledge Gap Map · Nhóm VLearn-Quiz · Zone D305

Hướng: [x] A — VLearn  [ ] B — Trợ lý Học viên  [ ] C — Làn mở
Loại: [ ] Tối ưu tính năng có sẵn  [x] Tính năng mới

> Trạng thái: bản working spec. Các mục đánh dấu **CẦN NGƯỜI THẬT** không được tự điền bằng dữ liệu giả.

## §1. User & Job

- **Job executor chính:** học viên vừa học xong một buổi và muốn biết phần nào mình thực sự chưa hiểu trước khi chuyển sang bài tiếp theo.
- **Workflow hiện tại:** xem slide/video → tự đoán mình đã hiểu → hỏi tutor hoặc bạn học khi nhớ ra câu hỏi → ôn lại rời rạc.
- **Core JTBD:** kiểm tra mức độ hiểu một bài giảng ngay sau buổi học và tìm đúng phần cần ôn lại.
- **Problem statement:** học viên vừa học xong thường chỉ đọc lại hoặc hỏi từng câu rời rạc, nhưng không có cách kiểm tra chủ động và có căn cứ xem mình đang hiểu sai chủ đề nào; vì vậy họ dễ chuyển sang bài tiếp theo với lỗ hổng chưa được phát hiện.

### Evidence mining

Nguồn và phương pháp tái lập nằm tại `codebase/support/evidence/mining_report.md` và `codebase/support/evidence/mining_chatlog.py`.

- Data pack có 2.522 messages, 369 user, 585 conversation và 1.261 cặp hỏi–đáp.
- Tutor chỉ chủ động hỏi lại để kiểm tra hiểu bài ở **3/1.261 lượt (0,24%)**.
- `misconceptions` và `follow_ups` đều có dữ liệu ở **0/1.261 lượt**.
- **23 lượt từ 19 user** chủ động dùng từ khóa quiz/kiểm tra/bài tập/đánh giá/hiểu bài.
- **131 lượt từ 92 user** yêu cầu tóm tắt; **437 lượt từ 196 user** yêu cầu giải thích.
- **582/1.261 lượt tutor (46,15%)** không có citation; **287 lượt từ 167 user** nhận phản hồi báo thiếu/không tìm thấy nguồn.

Ví dụ nguyên văn:

1. `C0063/T0849`: “TẠO QUIZ ĐỂ TÔI HIỂU RÕ VÀ ÔN LẠI TOÀN BỘ SLIDE NÀY”.
2. `C0085/T0113`: “Làm sao để tôi có thể đánh giá là mình đã học xong bài này?”.
3. `C0001/T0649`: “tóm tắt nội dung chính trong slide này”.
4. `C0002/T0905`: “tóm gọn những nội dung quan trọng nhất trong day 04 này”.
5. `C0018/T0699`: “tóm tắt toàn bộ slide sau đó đưa ra các ý chính”.

### Evidence còn cần bổ sung

- **CẦN NGƯỜI THẬT:** xác nhận ít nhất 3 willing users đồng ý thử prototype.
- Mining chứng minh khoảng trống hành vi nhưng chưa chứng minh willingness-to-use; phần này được kiểm ở validation §8.

## §2. Impact & quyết định chọn

| Ứng viên | Bao nhiêu người | Tần suất quan sát/người | Tổn thất đo được mỗi lần | Tổng đơn vị tổn thất quan sát | Khả thi | Quyết định |
|---|---:|---:|---|---:|---|---|
| Cải thiện câu trả lời giải thích của tutor | 196 user | `437 / 196 = 2,23` lượt yêu cầu/user | Mỗi lần người học phải tạo **1 request-turn chủ động** để xin giải thích, thay vì được kiểm tra/chỉ dẫn sẵn | `196 × 2,23 × 1 ≈ 437 request-turn` | Trung bình; phạm vi rộng và phụ thuộc tutor hiện hữu | Loại |
| Tóm tắt bài giảng có citation | 92 user | `131 / 92 = 1,42` lượt yêu cầu/user | Mỗi lần người học phải tạo **1 request-turn chủ động** để xin tóm tắt; rủi ro nguồn là vấn đề có thật vì toàn tập có 287 lượt tutor báo thiếu/không tìm thấy nguồn, nhưng 287 lượt này không được gán riêng cho intent tóm tắt | `92 × 1,42 × 1 ≈ 131 request-turn` | Cao | Loại vì đã gần với năng lực tutor hiện tại |
| Quiz kiểm tra hiểu bài có citation + gap map | 369 user trong tập; 19 user yêu cầu quiz trực tiếp | Chỉ `3/1.261 = 0,24%` tutor reply chủ động kiểm tra hiểu; tương đương `1.258/369 = 3,41` lượt không kiểm tra/user trong tập. Intent trực tiếp: `23/19 = 1,21` lượt/user | Mỗi tutor reply không kiểm tra tạo **1 missed-check turn**: phiên hỏi–đáp kết thúc mà hệ thống chưa tạo phép kiểm tra chủ động để phát hiện lỗ hổng | `369 × 3,41 × 1 ≈ 1.258 missed-check turn`; đồng thời có 23 request-turn yêu cầu quiz rõ ràng | Cao: ingestion, quiz engine và UI đã có | **Chọn** |

**Cách đọc con số:** nhóm dùng `request-turn` và `missed-check turn` làm cost proxy vì chatlog không có dữ liệu đáng tin về số phút, tiền hoặc điểm số mất đi. Đây là đơn vị hành vi đếm lại được từ `mining_chatlog.py`, không phải ước lượng thời gian. Vì vậy nhóm không tuyên bố “mất X phút/lần” khi chưa đo bằng user study.

**Lý do chọn:** nhu cầu trực tiếp nhỏ hơn intent giải thích, nhưng hành vi kiểm tra hiểu gần như chưa được phục vụ (0,24%) và lát cắt đủ hẹp để đo được. Sai citation có cost-of-error cao nên feature chỉ cho câu đã xác minh đi vào bài quiz.

## §3. Giải pháp tương tự đã nghiên cứu

| Sản phẩm/flow | Điều học | Điều né | Khác biệt của lát cắt này |
|---|---|---|---|
| NotebookLM-style grounded answers | Đặt citation cạnh output để người dùng tự kiểm | Không coi citation là đúng nếu chỉ có nhãn nguồn | Quote phải khớp nguyên văn chunk trước khi câu được hiển thị |
| Quizlet/Kahoot-style practice | Flow làm câu hỏi ngắn, phản hồi nhanh | Không chỉ hiện điểm tổng mà thiếu lý do | Phản hồi từng câu kèm quote và gap map theo topic |
| Tutor chat hiện tại | Hỏi tự do trên đoạn đang đọc | Người học phải tự biết mình cần hỏi gì | Hệ thống chủ động kiểm tra thay vì chờ câu hỏi |

**CẦN NGƯỜI THẬT:** mỗi thành viên dùng thử một sản phẩm gần nhất và bổ sung ảnh/log quan sát trước CP5.

## §4. Thiết kế

- **Lát cắt một câu:** Khi một học viên vừa học xong bài giảng, hệ thống quyết định câu hỏi nào có đủ căn cứ nguồn để đưa vào quiz, rồi trả kết quả và topic cần ôn lại kèm trích dẫn nguyên văn.
- **Non-goals:**
  1. Không chấm điểm chính thức hoặc thay thế đánh giá của giảng viên.
  2. Không tạo câu tự luận, bài tập lập trình hoặc đề thi hoàn chỉnh.
  3. Không trả lời logistics, học phí, lịch thi hay nội dung ngoài tài liệu đã nạp.
  4. Không tự gửi bài ôn tập hoặc nhắn chủ động cho học viên.
- **Mức prototype:** Working cho luồng một file PDF → quiz → kết quả; teacher dashboard và lưu dữ liệu dài hạn hiện là Mock/Backlog.
- **Phần thật:** trích xuất PDF, chunking, Gemini API, schema validation, exact citation verifier, quiz UI, chấm điểm và gap map.
- **Phần mock/giới hạn:** fallback quiz mẫu, dữ liệu dashboard lớp, persistence submission và account thật. Fallback phải được gắn nhãn rõ hoặc loại khỏi bản demo final.
- **Automation:** **Conditional** — AI tự sinh, nhưng chỉ câu có `source_id` tồn tại và quote khớp nguyên văn mới được đưa cho học viên. Case thiếu/mơ hồ/ngoài phạm vi phải warning hoặc từ chối.
- **Cost-of-error:** câu sai có thể làm học viên học sai và làm mất niềm tin; bỏ một câu không đủ căn cứ rẻ hơn hiển thị một câu bịa.

### §4b. Nguyên tắc HAX/PAIR

| Nguyên tắc | Áp cụ thể vào prototype |
|---|---|
| G1 — Làm rõ hệ thống làm được gì | Màn upload nói rõ chỉ tạo quiz từ PDF được nạp |
| G2 — Làm rõ nó làm tốt đến đâu | Trạng thái `success/partial`, warning số câu verified và nhãn citation |
| G10 — Thu hẹp khi nghi ngờ | Câu không qua exact citation verifier bị loại; tài liệu thiếu phải warning/reject |
| G9 — Sửa dễ dàng | Học viên có thể báo lỗi câu hỏi và làm lại bài |
| G11 — Giải thích vì sao | Sau khi chọn đáp án, UI hiện explanation và quote nguyên văn |
| G15 — Mời feedback chi tiết | Result screen có form ghi ai thử, vai trò và comment nguyên văn |

### Quyết định interaction

- Chọn phản hồi đúng/sai ngay sau từng câu thay vì chỉ cuối bài, vì mục tiêu là học và sửa misconception chứ không phải thi.
- Gap map chỉ tính câu đã grounded; câu không grounded không được tính điểm.

## §5. Bốn lớp chỗ khó và kịch bản

| # | Tình huống | Lớp | Hành vi mong muốn | Nguyên tắc |
|---|---|---|---|---|
| 1 | Model trả `source_id` không tồn tại | ① Nguồn sự thật | Loại câu, ghi `invalid_source_id`, không tính điểm | G10 |
| 2 | Quote bị paraphrase hoặc không nằm trong chunk | ① Nguồn sự thật | Loại câu, ghi `quote_not_found_in_source` | G10, G2 |
| 3 | PDF chỉ có tiêu đề, không đủ nội dung | ② Thiếu thông tin | Trả warning/reject, đề nghị tài liệu chi tiết hơn | G1, G10 |
| 4 | Text bị cắt giữa công thức/thuật ngữ | ② Mơ hồ | Không sinh câu dựa trên phần cụt | G10 |
| 5 | Nguồn là lịch học/học phí | ③ Ngoài phạm vi | Từ chối vì không phải kiến thức bài giảng | G1 |
| 6 | User yêu cầu hệ thống quyết định điểm chính thức | ③ Thẩm quyền | Nói rõ quiz chỉ để tự ôn; chuyển giảng viên | G1, G2 |
| 7 | Hai lựa chọn đều có thể đúng theo nguồn | ④ Domain | Không chấp nhận câu; yêu cầu đúng một đáp án duy nhất | G10, G11 |
| 8 | Công thức/ký hiệu hoặc thuật ngữ song ngữ | ④ Domain | Giữ nguyên ký hiệu/thuật ngữ trong quote và đáp án | G11 |

**Failure nguy hiểm nhất:** citation có vẻ hợp lệ nhưng trỏ sai đoạn, khiến học viên tin một giải thích sai. Điều kiện cứng là zero invalid citation trong mọi câu được hiển thị.

## §6. Bốn đường đi trải nghiệm

- **Happy path:** upload PDF đủ nội dung → Role 2 tạo chunks → Gemini sinh câu → verifier xác nhận → học viên làm quiz → xem điểm, quote và gap map.
- **Low-confidence:** chỉ một phần câu qua verifier → trả `partial`, nói rõ số câu usable và chỉ hiển thị phần verified.
- **Failure/không căn cứ:** không câu nào verified hoặc input không đủ → không mở quiz rỗng; hiển thị lý do và hành động nạp tài liệu khác/thử lại.
- **Correction:** học viên báo lỗi câu, làm lại quiz; feedback được lưu/log để review.
- **Ngoài phạm vi:** nội dung logistics hoặc yêu cầu chấm điểm chính thức → từ chối có giải thích.
- **Domain:** câu mơ hồ/nhiều đáp án/công thức cụt → loại trước khi tới học viên.

## §7. Kiểm thử & Quality Bar

### Chiều chất lượng

| Chiều | Pass khi | Fail khi |
|---|---|---|
| Grounding | Mọi fact trong câu/đáp án/giải thích có trong chunk | Có chi tiết ngoài nguồn |
| Citation accuracy | `source_id` tồn tại và quote là exact substring | Sai ID, quote paraphrase hoặc thiếu quote |
| Single-answer clarity | Đúng 4 lựa chọn và đúng một đáp án được nguồn hỗ trợ | Mơ hồ hoặc nhiều đáp án đúng |
| Scope safety | Case thiếu/ngoài phạm vi warning hoặc reject | Vẫn sinh quiz như bình thường |
| Completeness | Sinh đủ số câu verified đã yêu cầu, hoặc báo `partial` trung thực | Thiếu câu nhưng ghi `success` |

### Golden set

- Mục tiêu: ≥20 case, gồm 8–10 normal, ≥2 case cho mỗi lớp khó và 2–4 rare.
- Ít nhất 10 case phải lấy/phát triển từ chatlog thật và ghi `conversation_id/turn_id`.
- Hai người chấm độc lập 5 output khó; lệch thì sửa định nghĩa trước khi chạy final.

### Quality bar cố định

> Đạt khi **≥80% tổng số case pass**, đồng thời **không có câu nào được hiển thị với hallucination hoặc citation sai**.

### Trạng thái các lượt chạy

| Run | Trạng thái | Kết luận |
|---|---|---|
| Legacy Run 1 | File cũ ghi 20/20 | **Không hợp lệ để kết luận chất lượng:** evaluator chỉ kiểm tra có sinh được câu, không assert expected requirement; case ngoài phạm vi vẫn sinh quiz nhưng bị ghi PASS |
| Corrected iteration 1 | 27/30 (90%) | Phát hiện false-negative của matcher song ngữ/optional rejection; giữ tại `eval/runs/` |
| Intermediate rescore | 30/30 | **Không dùng làm số cuối:** phát hiện topic coverage vô tình tính cả `citation.quote` |
| Strict full run | 25/30 (83,33%) | Loại citation khỏi coverage; phát hiện thêm lỗi chuẩn hóa `đ` và alias `Outliers` |
| Final strict rescore cùng output | **27/30 (90%); hard/edge 100%; 0 bad citation** | PASS bar 80%. Manual review: 27/27 câu grounded và single-answer; 3 FAIL coverage được giữ nguyên |

## §8. Phân công & validation

### Phân công

| Phần | Người chịu trách nhiệm |
|---|---|
| Product/spec/evidence, tích hợp cuối và demo artifact | Trần Văn Dũng |
| Ingestion/backend và stable source contract | Lê Văn Đông |
| Gemini Quiz Engine, schema và citation verifier | Đào Đức Mạnh |
| Student flow/frontend, result và gap map | Đàm Lê Minh Quân |
| Golden set/eval, manual review, validation và dashboard prototype | Nguyễn Viết Huy |

**Đóng góp tích hợp chéo:** Lê Văn Đông tạo phiên bản `TeacherDashboard`/`SlideViewer` tích hợp ban đầu; Trần Văn Dũng hoàn thiện dashboard dữ liệu phiên và các thay đổi frontend sau validation. Phân công chính ở trên bám theo reflection cá nhân; ghi chú này bám theo lịch sử commit để không quy toàn bộ phần tích hợp cho một người.

### Willing users và kế hoạch CP5

- Willing user 1: **Vũ Đăng Huy — học viên**.
- Willing user 2: **Trần Hoàng Vũ — học viên**.
- Willing user 3: **Trần Đại Nghĩa — học viên**.
- Task: nạp một bài giảng, làm quiz và dùng citation/gap map để quyết định phần cần ôn.
- Ba câu hỏi: điều gì khó hiểu/khó chịu nhất; có tin kết quả không và vì sao; có dùng thật không và vì sao.
- Log tại `validation/feedback_log.md`; không điền dữ liệu giả.

## §9. Changelog

| Thời điểm | Đổi gì | Vì sao |
|---|---|---|
| 2026-07-30 | Thay spec rút gọn bằng đầy đủ §1–§9 | Đối chiếu rubric cho thấy thiếu evidence, impact, design, failure và validation |
| 2026-07-30 | Đánh dấu Legacy Run 1 chưa hợp lệ | Evaluator không assert expected output và ghi PASS cho case ngoài phạm vi |
| 2026-07-30 | Thêm mining tái lập | Chuyển số liệu chatlog thành artifact kiểm lại được |
| 2026-07-30 | Thêm 9Router OpenAI-compatible client | Key 9Router không thể gọi trực tiếp endpoint Google Gemini |
| 2026-07-30 | Sửa matcher topic song ngữ và optional rejection | Lượt 27/30 cho thấy output đúng nhưng evaluator không hiểu `ma trận/matrix`, `3 chiều/3D` và case cho phép reject |
| 2026-07-30 | Loại citation khỏi topic coverage | Tránh PASS giả khi keyword chỉ nằm trong quote nguồn nhưng quiz không hỏi |
| 2026-07-30 | Chốt strict baseline | 27/30 (90%), hard/edge 100%, 0 bad citation; giữ 3 coverage failure |
| 2026-07-30 | Manual semantic review | 27/27 câu grounded và có một đáp án rõ ràng; Nguyễn Viết Huy và Đàm Lê Minh Quân đã xác nhận độc lập 5 ca khó |
| 2026-07-30 | Ghi nhận 5 phiên user validation | Xác nhận giá trị của quiz/gap map; phát hiện nhu cầu xem đúng đoạn nguồn, rút gọn giải thích và làm lại câu sai |
| 2026-07-31 | Định lượng cost-of-friction trong impact table | Bổ sung công thức người × tần suất × cost proxy; chỉ dùng đơn vị tương tác quan sát được, không tự suy diễn số phút hoặc tiền |
| 2026-07-31 | Đồng bộ phân công với reflection và commit | Tách Quiz Engine cho Đào Đức Mạnh, Eval/Validation cho Nguyễn Viết Huy và ghi rõ đóng góp tích hợp chéo ở dashboard |
