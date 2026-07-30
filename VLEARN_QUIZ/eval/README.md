# Evaluation

Thư mục này chứa bằng chứng kiểm thử AI, không chỉ output đẹp để demo.

## Cấu trúc mục tiêu

```text
eval/
├── README.md
├── golden-set.json       # ≥20 case
├── rubric.md             # định nghĩa pass/fail từng chiều
├── run-01.csv            # đủ mọi case, kể cả fail
├── run-02.csv            # chạy lại toàn bộ sau khi sửa
└── traces/               # prompt/raw response/parsed output của AI call thật
```

## Chiều chất lượng

- Grounded và citation hợp lệ.
- Câu hỏi yêu cầu vận dụng, không hỏi lại định nghĩa.
- Chỉ một đáp án đúng.
- Ba distractor hợp lý và gắn misconception khác nhau.
- Không lộ đáp án nguyên văn từ slide.
- Không cần kiến thức ngoài nguồn.
- Giảng viên giữ quyền duyệt và quyết định.

## Quy tắc

- Golden set tối thiểu 20 case, đúng cơ cấu trong `spec.md`.
- Hai người chấm độc lập 5 output đầu để kiểm tra rubric.
- Quality bar chốt trước khi xem kết quả cuối và không đổi sau hạn.
- Không xóa case fail hoặc sửa số liệu sau khi chạy.
- Trace không được chứa API key hay nguyên data pack dài.

Hai trace hiện có được giữ làm bằng chứng AI call; cần liên kết chúng với dòng tương ứng trong bảng kết quả.
