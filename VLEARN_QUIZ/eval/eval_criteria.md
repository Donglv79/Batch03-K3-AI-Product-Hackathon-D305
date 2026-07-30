# Tiêu Chí Đánh Giá & Cam Kết Quality Bar (Eval Criteria)

## 1. CAM KẾT QUALITY BAR CỦA NHÓM (Chốt cứng trước 23:59 N1)

> [!IMPORTANT]
> **Tuyên bố Chuẩn Đạt 2 Phần của Nhóm:**
> 
> **"≥ 80% tổng số case đạt, và AI KHÔNG được bịa ra kiến thức chưa học (Zero-hallucination) hoặc trích dẫn sai mã slide bài giảng dù chỉ một lần."**

### Chi tiết 2 phần Chuẩn Đạt:
1. **Phần 1 — Con số phần trăm tổng thể**: Đạt **≥ 80%**. Golden set hiện có 30 case nên ngưỡng tương ứng là **≥24/30**. Phần trăm 80% không thay đổi khi mở rộng bộ test.
2. **Phần 2 — Điều KHÔNG cho phép sai lần nào (Zero-tolerance Rule)**:
   * **Cấm bịa nguồn (Zero hallucination)**: 100% câu hỏi & đáp án phải trỏ được về đúng thông tin trong Slide/Transcript.
   * **Trích dẫn tuyệt đối chuẩn xác**: Mã trích dẫn nguồn (`slide_id`) phải chính xác 100%. Không trỏ nhầm sang slide khác.

*Lý do:* Học viên rất tin tưởng vào mã trích dẫn bài giảng. Nếu AI dẫn sai slide hoặc bịa kiến thức, học viên sẽ ghi nhớ sai bản chất, gây hậu quả trực tiếp đến kết quả học tập và niềm tin vào sản phẩm.

---

## 2. Các Chiều Chất Lượng Đánh Giá (Quality Dimensions)

| Chiều đánh giá | Mô tả tiêu chí | Tiêu chuẩn Pass/Fail |
|---|---|---|
| **1. Grounding (Độ bám tài liệu)** | Mọi câu hỏi, đáp án đúng/sai và giải thích phải nằm hoàn toàn trong 3 bài giảng (*Deep Learning, Computer Vision, Machine Learning*). | **Pass**: 100% chi tiết trace được về nguồn.<br>**Fail**: Có ≥1 thông tin bịa ra ngoài nguồn. |
| **2. Citation Accuracy (Độ chính xác trích dẫn)** | Mã trích dẫn slide (`source_id`) phải trỏ chính xác về Slide/Transcript tương ứng. | **Pass**: Mã ID khớp 100% với đoạn nguồn chứa kiến thức.<br>**Fail**: Trỏ sai mã ID hoặc không trích dẫn. |
| **3. Difficulty & Domain Fit (Độ phù hợp độ khó)** | Câu hỏi rõ ràng, phân biệt chính xác thuật ngữ chuyên ngành (AdaBoost, R-CNN, Sigmoid, MSE/MAE). | **Pass**: Các phương án phân biệt rõ ràng, đáp án đúng là duy nhất.<br>**Fail**: Phương án mập mờ hoặc sai khái niệm. |
| **4. Edge Case Safety (Xử lý an toàn case bẫy)** | Nhận diện đúng 4 lớp chỗ khó (văn bản mơ hồ, ngoài thẩm quyền, thiếu thông tin) và từ chối sinh quiz hợp lý. | **Pass**: Từ chối/cảnh báo đúng khi input bị lỗi/thiếu.<br>**Fail**: Cố tình sinh quiz linh tinh trên input lỗi. |

---

## 3. Bảng Ghi Nhận Kết Quả Các Lượt Chạy (Eval Runs Log)

| Lượt chạy (Run) | Thời điểm | Điểm Đạt tổng thể (%) | Lớp chỗ khó (%) | Khoảng cách so với Quality Bar (80%) | Failure đau nhất phát hiện được | Hành động cải tiến |
|:---:|:---:|:---:|:---:|:---:|---|---|
| **Run 1 — Corrected** | 21:24 N2 (UTC+7) | **90.0%** (27/30) | **95.0%** (19/20) | **+10.0 điểm %** | Matcher không hiểu một số cách diễn đạt Anh–Việt và case cho phép reject | Thêm alias song ngữ; sửa rule `reject hoặc strict grounding` |
| **Run 2 — Intermediate** | 21:29 N2 (UTC+7) | **100.0%** (30/30) | **100.0%** (20/20) | **Không dùng để kết luận** | Topic coverage vô tình đọc cả `citation.quote`, tạo PASS giả | Loại citation và distractor khỏi phần text dùng để chấm coverage |
| **Run 3 — Strict** | 21:35 N2 (UTC+7) | **83.33%** (25/30) | **100.0%** (20/20) | **+3.33 điểm %** | Chuẩn hóa Unicode chưa đổi `đ → d`; thiếu alias `Outliers ↔ ngoại lai` | Sửa normalize/alias, thêm regression tests, chấm lại cùng output |
| **Run 4 — Final strict rescore** | 21:37 N2 (UTC+7) | **90.0%** (27/30) | **100.0%** (20/20) | **+10.0 điểm %** | 3 coverage failure thật: RGB/range, công thức Sigmoid, Cell state | Giữ nguyên 3 FAIL; không nới golden requirement hoặc quality bar |

### Kết luận lượt cuối

- **PASS quality bar:** 27/30 = 90% ≥ 80%.
- **Điều kiện cứng:** 0 bad citation; manual review xác nhận 27/27 câu được hiển thị grounded và có một đáp án rõ ràng.
- Hai thành viên trong nhóm đã chấm độc lập 5 output khó và xác nhận kết quả tại `manual_review.md`.
- Báo cáo mới nhất: `run_results.md`; lịch sử không ghi đè: `runs/`.
