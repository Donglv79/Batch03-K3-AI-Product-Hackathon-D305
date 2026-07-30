# Tiêu Chí Đánh Giá & Cam Kết Quality Bar (Eval Criteria)

## 1. CAM KẾT QUALITY BAR CỦA NHÓM (Chốt cứng trước 23:59 N1)

> [!IMPORTANT]
> **Tuyên bố Chuẩn Đạt 2 Phần của Nhóm:**
> 
> **"≥ 80% tổng số câu thử đạt (tối thiểu 16/20 cases), và AI KHÔNG được bịa ra kiến thức chưa học (Zero-hallucination) hoặc trích dẫn sai mã slide bài giảng dù chỉ một lần."**

### Chi tiết 2 phần Chuẩn Đạt:
1. **Phần 1 — Con số phần trăm tổng thể**: Đạt **≥ 80%** qua bộ Golden Set (≥ 16/20 test cases).
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
| **Run 1 (CP3)** | 15:50 N1 | **50.0%** (10/20) | **40.0%** (4/10) | Cách bar **-30.0%** | Mạng bị vỡ khi gặp Rate limit API key | Nạp GEMINI_API_KEY thật & thêm retry sleep |
| **Run 2** | --:-- N2 | __ % ( __ / 20) | __ % ( __ / 8) | | | Tối ưu System Prompt cho Gemini 2.0 |
| **Run 3 (Final)** | --:-- N2 | __ % ( __ / 20) | __ % ( __ / 8) | | | Chốt con số nộp bài cho Slide 4 |
