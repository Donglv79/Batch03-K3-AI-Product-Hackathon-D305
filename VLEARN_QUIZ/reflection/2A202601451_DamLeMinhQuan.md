# Bài Thu Hoạch Cá Nhân (Reflection)

- **Họ và tên**: Đàm Lê Minh Quân
- **Mã học viên**: 2A202601451
- **Vai trò trong nhóm**: Student Flow (Người 4)
- **Sản phẩm nhóm**: VLearn Quiz Engine & Teacher Knowledge Gap Map

---

## 1. Bài học lớn nhất rút ra từ sự kiện

Bài học đắt giá nhất với mình là: "AI không bịa" (zero-hallucination) là điều
kiện cần, chứ không phải điều kiện đủ. Nhóm mình làm rất tốt phần grounding —
mọi câu hỏi đều gắn `source_id` trích đúng slide/transcript, không suy đoán
kiến thức chưa dạy. Nhưng đến CP5, khi cho học viên thật dùng thử, mới lộ ra
lỗ hổng: trích dẫn đúng nhưng người dùng không có cách nào tự xem lại đoạn
nguồn đó, nên với họ, "AI không bịa" chỉ là lời hứa suông chứ không phải thứ
họ cảm nhận được. Từ đó mình rút ra: mỗi tính năng liên quan đến citation phải
tự hỏi "nếu mình là học viên, mình có verify được claim này bằng một cú click
không?", chứ không chỉ dựa vào log/eval nội bộ để tự trấn an là sản phẩm đã
đáng tin cậy.

Bài học thứ hai là về cách dùng AI khi code: dùng Claude Code để dựng khung
Next.js/TypeScript cho các component giúp mình đi nhanh hơn nhiều, nhưng cũng
chính AI là bên phát hiện ra một lỗ hổng bảo mật mức critical trong Next.js
14.2.5 khi chạy `npm run build` — thứ mà nếu chỉ tự soát tay code (không thực
sự chạy build/test) mình gần như chắc chắn bỏ sót vì nó không lộ ra khi chạy
`npm run dev` bình thường. Điều đó củng cố cho mình nguyên tắc: AI sinh code
rất nhanh, nhưng phải tự kiểm chứng lại (đọc hiểu, chạy thử thật) trước khi
merge, không copy-paste mà không hiểu.

## 2. Điều đã làm tốt nhất & điều lẽ ra nên làm khác đi

* **Điều mình làm tốt nhất**:
  * Xây dựng toàn bộ `codebase/student-flow/`: luồng chọn buổi học → sinh quiz
    → làm bài (feedback đúng/sai từng câu) → kết quả + bản đồ lỗ hổng kiến
    thức, đúng hợp đồng dữ liệu (`Quiz`/`Question` type trong `lib/mockQuiz.ts`)
    để Người 3 (Gemini quiz engine) cắm API thật vào mà không cần đổi phần
    render.
  * Chủ động phát hiện và bỏ một bộ quiz Day 2 mà chính mình từng tự soạn tay
    trước đó, chỉ giữ lại đúng 1 bộ có nguồn transcript rõ ràng — để không lẫn
    nội dung tự dựng của cá nhân với nội dung Người 2/3 sẽ nạp/sinh thật, giữ
    đúng nguyên tắc zero-hallucination của cả nhóm ngay ở tầng UI.
  * Xử lý case `citation: null`: khi AI không có căn cứ nguồn, UI hiện cảnh
    báo thay vì hiện đáp án, tránh để giao diện ngầm hợp thức hoá nội dung
    không có trích dẫn.
  * Chạy thử thật `npm install` / `npm run dev` / `npm run build` (không chỉ
    soát tay), nhờ đó phát hiện và vá được lỗ hổng bảo mật critical nói trên.

* **Điều lẽ ra nên làm khác đi**:
  * Vấn đề "trích dẫn đúng nhưng không xem lại được" (case fail ở mục 3 dưới
    đây) lẽ ra nên được mình tự đặt câu hỏi ngay từ lúc thiết kế UI, thay vì
    để đến khi học viên thật dùng thử ở CP5 mới phát hiện ra. Nếu làm lại,
    mình sẽ tự đóng vai người dùng cuối để bấm thử từng `source_id` trước khi
    coi tính năng là "xong", thay vì chỉ kiểm tra luồng logic chấm điểm.

## 3. Nhận xét về sự phối hợp trong nhóm

Nhờ chốt cứng hợp đồng dữ liệu (`Quiz`/`Question` type) ngay từ sớm, việc phối
hợp giữa student-flow của mình với quiz engine của Người 3 và luồng nạp dữ
liệu của Người 2 khá trơn tru — mình không cần chờ API thật mới dựng được UI,
chỉ cần đảm bảo `mockQuiz.ts` đúng shape là khi Người 3 có endpoint thật, chỉ
việc thay lời gọi trong `handleGenerate()` mà không phải sửa phần render.

Case fail đáng nhớ nhất của cả nhóm là ở CP5: khi cho học viên thật dùng thử,
có feedback từ Đỗ Duy Đức: *"Bấm vào mã slide_12 không thấy nó hiện đoạn bài
giảng ra xem lại..."* — mã trích dẫn hiện trên câu hỏi nhưng không xem lại
được đúng đoạn nguồn tương ứng. Cả nhóm phản ứng nhanh, thống nhất bổ sung
ngay popup/tooltip hiển thị nguyên văn trích dẫn khi tương tác với `source_id`
trên giao diện Quiz và cập nhật kịp cho mốc nộp CP5. Điều này cho thấy vòng
lặp user-validation của nhóm hoạt động đúng như kỳ vọng: lắng nghe phản hồi
thật, không chỉ tin vào eval nội bộ.
