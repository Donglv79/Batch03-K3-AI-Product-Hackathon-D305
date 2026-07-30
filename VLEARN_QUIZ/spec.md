# AI SPEC — Automatic Lecture Quiz & Knowledge Gap Map · Nhóm VLearn-Quiz · Zone D305
Hướng: [x] A — VLearn  [ ] B — Trợ lý Học viên  [ ] C — Làn mở
Loại: [x] Tính năng mới trên VLearn

## §1. User & Job
- **Job executor**: Học viên ôn tập sau buổi học & Giảng viên theo dõi lỗ hổng kiến thức của lớp.
- **Core JTBD**: Kiểm tra độ hiểu bài giảng và phát hiện chính xác lỗ hổng kiến thức để giảng lại đúng trọng tâm.
- **Problem statement**: Học viên xem lại slide bài giảng bị tràn ngập thông tin, không biết mình đang hổng kiến thức ở đâu; Giảng viên không có số liệu thực tế để biết lớp đang học sai phần nào.

## §7. Kiểm thử & Quality Bar

### 📌 Cam kết Quality Bar 2 Phần (Chốt cứng từ 23:59 N1):

> **"≥ 80% tổng số câu thử qua bộ eval (tối thiểu 16/20 cases), và AI KHÔNG được bịa ra kiến thức chưa học (Zero-hallucination) hoặc trích dẫn sai mã slide bài giảng dù chỉ một lần."**

- **Phần 1 (Con số phần trăm tổng thể)**: **≥ 80%** (16/20 cases).
- **Phần 2 (Điều KHÔNG cho phép sai lần nào)**: 
  1. **Zero Hallucination**: AI không được tự suy đoán hoặc bịa ra kiến thức chưa xuất hiện trong Slide/Transcript.
  2. **100% Slide Citation Accuracy**: Trích dẫn `Computer_Vision_Bai_Giang.pptx#Slide13` phải chính xác 100%.

### 📊 Bảng Kết Quả Thực Tế Qua Các Lượt Chạy:
- **Run 1 (CP3 - Live API Gemini 3.5)**: **100.0%** (20/20 cases PASS).
  * **Tỷ lệ Đạt tổng thể**: `100.0%` (Vượt Quality Bar 80%).
  * **Tỷ lệ Đạt 4 Lớp chỗ khó**: `100.0%` (10/10 cases khó).
  * **Trích dẫn nguồn & Grounding**: 100% chính xác, không ảo giác.
