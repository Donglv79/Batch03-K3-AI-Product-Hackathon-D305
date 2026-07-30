# Codebase

Ba module chạy theo một hợp đồng dữ liệu chung:

```text
role2_ingestion → quiz_engine → student-flow → teacher dashboard
```

## Module

| Module | Trách nhiệm | Trạng thái |
|---|---|---|
| `role2_ingestion/` | Transcript/PDF text → chunks có `source_id` | Đã có backend; cần nối UI và contract |
| `quiz_engine/` | Gemini tạo quiz grounded, kiểm tra schema/citation, lưu trace | Đã có engine; đang cần thu hẹp từ nhiều câu về một câu chẩn đoán |
| `student-flow/` | Teacher Preview, học viên trả lời, dashboard | Frontend build được; một phần còn dùng mock và flow cá nhân |

## Canonical flow

1. Ingestion xuất document JSON.
2. Quiz Engine trả một diagnostic question JSON.
3. Teacher Preview yêu cầu giảng viên duyệt.
4. Student Flow nhận một lựa chọn A/B/C/D.
5. Dashboard tổng hợp response counts; không dùng dữ liệu cá nhân.

Contract chính thức phải được thống nhất giữa ba module trước khi tích hợp. Không tạo adapter riêng âm thầm ở từng module.

## Quy ước

- API key chỉ ở biến môi trường.
- Không commit `.next/`, `node_modules/`, `__pycache__/`, log hoặc processed data.
- Dữ liệu mock phải ghi rõ.
- Trace AI thật lưu trong `../eval/traces/` và phải được quét key trước commit.
- Chạy build/test của module trước khi mở PR.
