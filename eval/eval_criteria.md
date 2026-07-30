# Tiêu Chí Đánh Giá & Quality Bar (Eval Criteria)

## 1. Các Chiều Chất Lượng (Quality Dimensions)

Bộ AI Quiz Engine được đánh giá theo 4 chiều chất lượng độc lập:

| Chiều đánh giá | Mô tả tiêu chí | Cách chấm (Pass/Fail) |
|---|---|---|
| **1. Grounding (Độ bám tài liệu)** | Mọi câu hỏi, đáp án đúng/sai và giải thích phải nằm hoàn toàn trong Slide/Transcript. Không ảo giác (Hallucination). | **Pass**: 100% chi tiết trace được về nguồn.<br>**Fail**: Có ≥1 thông tin bịa ra ngoài nguồn. |
| **2. Citation Accuracy (Độ chính xác trích dẫn)** | Mã trích dẫn (`source_id` / `citation_id`) phải trỏ chính xác về Slide/Transcript tương ứng. | **Pass**: Mã ID khớp 100% với đoạn nguồn chứa kiến thức.<br>**Fail**: Trỏ sai mã ID hoặc không trích dẫn. |
| **3. Difficulty & Domain Fit (Độ phù hợp độ khó)** | Câu hỏi có câu từ rõ ràng, đúng ngữ cảnh môn học, không trùng lặp các phương án A B C D. | **Pass**: Các phương án phân biệt rõ ràng, đáp án đúng là duy nhất.<br>**Fail**: Phương án mập mờ hoặc có >1 đáp án đúng. |
| **4. Edge Case Safety (Xử lý an toàn case bẫy)** | Nhận diện đúng 4 lớp chỗ khó (văn bản mơ hồ, ngoài thẩm quyền, thiếu thông tin) và từ chối sinh quiz hợp lý. | **Pass**: Từ chối/cảnh báo đúng khi input bị lỗi/thiếu.<br>**Fail**: Cố tình sinh quiz linh tinh trên input lỗi. |

---

## 2. Cam Kết Quality Bar (Chốt trước 23:59 N1)

> **Cam kết của Nhóm:**
> - **Tỷ lệ Đạt tổng thể bộ Golden Set (20 cases)**: **≥ 80%** (Tối thiểu 16/20 test cases đạt).
> - **Tiêu chí cứng (Must-have)**:
>   1. **Citation Accuracy**: Đạt **100%** trên các Happy Path cases.
>   2. **Zero Hallucination**: Đạt **100%** (Không bịa ra kiến thức chưa học).
>   3. **Edge Case Handling**: Đạt **≥ 75%** trên 8 cases thuộc 4 lớp chỗ khó.

---

## 3. Bảng Ghi Nhận Kết Quả Các Lượt Chạy (Eval Runs Log)

| Lượt chạy (Run) | Thời điểm | Điểm Đạt tổng thể (%) | Lớp chỗ khó (%) | Failure đau nhất phát hiện được | Hành động cải tiến |
|:---:|:---:|:---:|:---:|---|---|
| **Run 1 (CP3)** | --:-- N1 | __ % ( __ / 20) | __ % ( __ / 8) | *Chưa chạy* | *Ghi nhận baseline lượt đầu* |
| **Run 2** | --:-- N2 | __ % ( __ / 20) | __ % ( __ / 8) | | *Tối ưu System Prompt của Người 3* |
| **Run 3 (Final)** | --:-- N2 | __ % ( __ / 20) | __ % ( __ / 8) | | *Chốt con số nộp bài* |
