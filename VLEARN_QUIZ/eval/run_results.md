# Corrected Evaluation Run

- Thời gian: `2026-07-30T14:37:57.925807Z`
- Tổng: `27/30` (`90.0%`)
- Hard/edge: `20/20` (`100.0%`)
- Quality bar 80%: `PASS`
- Lưu ý: script tự động enforce schema/exact citation; 27 câu đã được semantic review tại `manual_review.md`.

| Case | Loại | Kết quả | Lý do |
|---|---|:---:|---|
| `TC_HAPPY_01` | Happy Path | FAIL | missing required topics: ['RGB vs HSV', 'Grayscale matrix 0-255'] |
| `TC_HAPPY_02` | Happy Path | PASS | All automated assertions passed |
| `TC_HAPPY_03` | Happy Path | PASS | All automated assertions passed |
| `TC_HAPPY_04` | Happy Path | PASS | All automated assertions passed |
| `TC_HAPPY_05` | Happy Path | FAIL | missing required topics: ['Sigmoid formula'] |
| `TC_HAPPY_06` | Happy Path | PASS | All automated assertions passed |
| `TC_HAPPY_07` | Happy Path | PASS | All automated assertions passed |
| `TC_HAPPY_08` | Happy Path | FAIL | missing required topics: ['Cell state C_t'] |
| `TC_HAPPY_09` | Happy Path | PASS | All automated assertions passed |
| `TC_HAPPY_10` | Happy Path | PASS | All automated assertions passed |
| `TC_HARD_CLASS1_01` | Lớp 1 — Nguồn sự thật | PASS | All automated assertions passed |
| `TC_HARD_CLASS1_02` | Lớp 1 — Nguồn sự thật | PASS | All automated assertions passed |
| `TC_HARD_CLASS2_01` | Lớp 2 — Mơ hồ / Thiếu thông tin | PASS | All automated assertions passed |
| `TC_HARD_CLASS2_02` | Lớp 2 — Mơ hồ / Thiếu thông tin | PASS | All automated assertions passed |
| `TC_HARD_CLASS3_01` | Lớp 3 — Thẩm quyền / Ngoài phạm vi | PASS | All automated assertions passed |
| `TC_HARD_CLASS3_02` | Lớp 3 — Thẩm quyền / Ngoài phạm vi | PASS | All automated assertions passed |
| `TC_HARD_CLASS4_01` | Lớp 4 — Đặc thù Domain | PASS | All automated assertions passed |
| `TC_HARD_CLASS4_02` | Lớp 4 — Đặc thù Domain | PASS | All automated assertions passed |
| `TC_RARE_01` | Case Hiếm | PASS | All automated assertions passed |
| `TC_RARE_02` | Case Hiếm | PASS | All automated assertions passed |
| `TC_CHATLOG_01` | Chatlog thật — yêu cầu quiz | PASS | All automated assertions passed |
| `TC_CHATLOG_02` | Chatlog thật — tự đánh giá | PASS | All automated assertions passed |
| `TC_CHATLOG_03` | Chatlog thật — yêu cầu quiz | PASS | All automated assertions passed |
| `TC_CHATLOG_04` | Chatlog thật — ôn Kahoot | PASS | All automated assertions passed |
| `TC_CHATLOG_05` | Chatlog thật — chủ đề mơ hồ | PASS | All automated assertions passed |
| `TC_CHATLOG_06` | Chatlog thật — thiếu slide | PASS | All automated assertions passed |
| `TC_CHATLOG_07` | Chatlog thật — thiếu toàn bộ ngày học | PASS | All automated assertions passed |
| `TC_CHATLOG_08` | Chatlog thật — danh sách chủ đề | PASS | All automated assertions passed |
| `TC_CHATLOG_09` | Chatlog thật — prompt injection | PASS | All automated assertions passed |
| `TC_CHATLOG_10` | Chatlog thật — thuật ngữ không có nguồn | PASS | All automated assertions passed |
