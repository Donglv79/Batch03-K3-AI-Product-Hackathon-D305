# Bằng chứng lời gọi AI thật

Repo có 20 trace Gemini được tạo ngày 2026-07-30 trong `../../eval/traces/`. Mỗi trace có model, prompt, raw model text, raw response và parsed output; không chứa API key. Kiểm tra tự động metadata cho thấy cả 20/20 file có `prompt` và `raw_text` khác rỗng, model `gemini-3.1-flash-lite`.

Ba mẫu có thể kiểm tra bằng SHA-256:

| Trace | Câu trả về | SHA-256 |
|---|---:|---|
| `quiz_Computer_Vision_Bai_Giang_pptx_Slide12-13_20260730T093717.975261Z.json` | 1 | `4f0f7f0d79afa3329cbd170670ac55fe43c923e7704f964f1e3b6f05280528ff` |
| `quiz_Deep_Learning_Bai_Giang_pptx_Slide10-11_20260730T093819.141163Z.json` | 1 | `459a55db18363069a209262ad80a5cf1c59964b12755a6ec7a11625f8deafa50` |
| `quiz_Machine_Learning_Bai_Giang_pptx_Slide10-11_20260730T093918.296985Z.json` | 1 | `2281c332abaeb254376485a34bbd037a7751fd500b1accb8d1d6b05b4ce11870` |

## Ranh giới kết luận

- Các trace chứng minh **đã có lời gọi AI thật ở quyết định trung tâm**.
- Chúng **không chứng minh 20/20 case đạt quality bar**: evaluator legacy không assert expected rejection và từng ghi PASS cho logistics/autoclicker.
- Corrected evaluator nằm tại `run_eval.py`. Strict baseline qua 9Router đạt **27/30 (90%)**, hard/edge 100%, 0 bad citation; manual review 27/27 câu grounded/single-answer.
- Các lượt 27/30, 30/30 trung gian và 25/30 được giữ trong `runs/`. Lượt 30/30 không dùng làm kết luận vì topic matcher từng tính cả citation quote.
