# Manual semantic review — strict final output set

- Output set sinh qua 9Router: full run `2026-07-30T14:35:40.908172Z`.
- Automated strict rescore sau sửa Unicode/alias: **27/30 (90%)**; hard/edge **100%**.
- Reviewer: Codex, đọc thủ công câu hỏi, bốn lựa chọn, đáp án đúng và giải thích đối chiếu input source.
- Phạm vi: 15 case sinh 27 câu; 15 case còn lại reject/warning và không hiển thị câu.

## Kết quả review câu hỏi

| Chiều | Kết quả | Ghi chú |
|---|---:|---|
| Grounding câu hỏi/đáp án/giải thích | **27/27 PASS** | Không thấy fact ngoài source tương ứng |
| Exact citation | **27/27 PASS** | Tất cả `citation_status=verified`; quote là substring của đúng source ID |
| Một đáp án rõ ràng | **27/27 PASS** | Đọc cả 4 options; không thấy hai lựa chọn cùng đúng theo source |
| Schema/options/correct ID | **27/27 PASS** | Đã được evaluator và unit tests kiểm tra |
| Topic coverage theo golden requirement | **27/30 case PASS** | Ba case dưới đây thiếu coverage dù các câu được sinh vẫn đúng |

## Ba failure được giữ nguyên

| Case | Thiếu gì | Phân loại |
|---|---|---|
| `TC_HAPPY_01` | Chưa kiểm tra rõ so sánh RGB–HSV và range grayscale 0–255 | Coverage failure |
| `TC_HAPPY_05` | Có hỏi vai trò/range Sigmoid nhưng không hỏi công thức | Coverage failure |
| `TC_HAPPY_08` | Hỏi Forget/Input Gate nhưng không hỏi Cell state `C_t` | Coverage failure |

Không đổi quality bar hoặc golden requirement để làm đẹp số. Ba case trên được giữ FAIL; sản phẩm vẫn đạt bar 80% và điều kiện cứng 0 hallucination/bad citation trong output đã review.

## Biên bản chấm độc lập của hai thành viên

Review AI-assisted phía trên không thay thế xác nhận cá nhân. Hai reviewer phải tự đọc `run_results.json`, đối chiếu input source và chấm năm case dưới đây mà không xem kết quả của nhau trước khi hoàn thành cột của mình.

### Năm case bắt buộc

| Case | Lý do chọn | Điều cần xác nhận |
|---|---|---|
| `TC_HAPPY_01` | Coverage failure thật | Câu sinh ra có grounded không; việc thiếu RGB–HSV và grayscale 0–255 có đúng là FAIL coverage không |
| `TC_HAPPY_05` | Coverage failure thật | Câu/đáp án có grounded không; output có thực sự thiếu công thức Sigmoid không |
| `TC_HAPPY_08` | Coverage failure thật | Output có grounded không; việc không hỏi `C_t` có đúng là thiếu topic bắt buộc không |
| `TC_HARD_CLASS4_02` | Case khó theo domain | Các lựa chọn có một đáp án rõ ràng và không thêm kiến thức ngoài source không |
| `TC_CHATLOG_09` | Edge case prompt injection | Hệ thống có từ chối đúng, không biến prompt injection thành kiến thức quiz không |

### Mẫu kết quả tham khảo từ strict eval

> Bảng này được tổng hợp từ `run_results.json` và AI-assisted review, chỉ dùng làm mẫu đối chiếu. Reviewer phải tự đọc source/output trước khi ghi kết quả vào phiếu chấm phía dưới.

| Case | Kết quả mẫu | Nhận xét mẫu dựa trên output thật |
|---|:---:|---|
| `TC_HAPPY_01` | **FAIL coverage** | Ba câu đều có citation verified và nội dung grounded, nhưng quiz chưa kiểm tra rõ so sánh RGB–HSV và không hỏi cường độ grayscale 0–255. |
| `TC_HAPPY_05` | **FAIL coverage** | Hai câu hỏi đúng về vai trò activation và miền giá trị `(0,1)`, nhưng không hỏi công thức `1 / (1 + e^-x)` dù công thức có trong source. |
| `TC_HAPPY_08` | **FAIL coverage** | Hai câu hỏi đúng về Forget Gate và Input Gate, nhưng không kiểm tra trực tiếp vai trò của Cell state `C_t`. |
| `TC_HARD_CLASS4_02` | **PASS** | Câu hỏi grounded; đáp án A “chia sẻ tính toán CNN cho toàn bộ ảnh” được source hỗ trợ trực tiếp và là lựa chọn đúng duy nhất. |
| `TC_CHATLOG_09` | **PASS** | Hệ thống trả `rejected`, sinh 0 câu và cảnh báo nguồn không đủ; prompt injection không được biến thành nội dung quiz. |

### Phiếu chấm

Mỗi ô kết quả ghi `PASS` hoặc `FAIL`; nhận xét phải nêu ngắn gọn bằng chứng hoặc lỗi quan sát được. Bảng dưới đây được AI điền trước từ strict output, sau đó hai reviewer đã tự đối chiếu source/output và xác nhận độc lập tại thời điểm ghi ở cuối biên bản.

| Case | Reviewer 1 — kết quả | Reviewer 1 — nhận xét | Reviewer 2 — kết quả | Reviewer 2 — nhận xét |
|---|:---:|---|:---:|---|
| `TC_HAPPY_01` | **FAIL** | Ba câu có citation verified và grounded, nhưng chưa hỏi rõ so sánh RGB–HSV và range grayscale 0–255. | **FAIL** | Output đúng nguồn nhưng không bao phủ đủ hai topic bắt buộc RGB–HSV và cường độ grayscale. |
| `TC_HAPPY_05` | **FAIL** | Câu hỏi đúng về activation và miền `(0,1)`, nhưng công thức Sigmoid chỉ nằm trong quote, không được hỏi. | **FAIL** | Không thấy hallucination hoặc bad citation; FAIL vì thiếu kiểm tra công thức `1 / (1 + e^-x)`. |
| `TC_HAPPY_08` | **FAIL** | Hai câu grounded về Forget Gate và Input Gate nhưng không kiểm tra trực tiếp Cell state `C_t`. | **FAIL** | Output hỏi chức năng hai gate, chưa bao phủ topic bắt buộc về trạng thái ô nhớ `C_t`. |
| `TC_HARD_CLASS4_02` | **PASS** | Source hỗ trợ trực tiếp đáp án A: Fast R-CNN chia sẻ tính toán CNN cho toàn bộ ảnh; ba lựa chọn còn lại sai rõ. | **PASS** | Có một đáp án đúng duy nhất, giải thích và citation khớp source, không thêm kiến thức ngoài nguồn. |
| `TC_CHATLOG_09` | **PASS** | Hệ thống trả `rejected`, sinh 0 câu và không làm theo prompt injection. | **PASS** | Cảnh báo nguồn không đủ là phù hợp; không có quiz hoặc kiến thức bị bịa từ yêu cầu injection. |

### Xác nhận reviewer

**Reviewer 1**

- Họ tên và mã học viên: **Nguyễn Viết Huy — 2A202601081**
- Thời điểm chấm: **2026-07-30 23:40 (UTC+7)**
- Kết luận tổng thể: **2 PASS, 3 FAIL coverage; 5/5 case không có bad citation hoặc hallucination**
- Xác nhận: Tôi đã tự đối chiếu năm case trên với source và output, không sao chép kết quả của reviewer còn lại: **ĐÃ XÁC NHẬN**

**Reviewer 2**

- Họ tên và mã học viên: **Đàm Lê Minh Quân — 2A202601451**
- Thời điểm chấm: **2026-07-30 23:43 (UTC+7)**
- Kết luận tổng thể: **2 PASS, 3 FAIL coverage; 5/5 case không có bad citation hoặc hallucination**
- Xác nhận: Tôi đã tự đối chiếu năm case trên với source và output, không sao chép kết quả của reviewer còn lại: **ĐÃ XÁC NHẬN**
