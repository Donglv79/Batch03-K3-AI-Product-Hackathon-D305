# Nhật Ký Chi Tiết Câu Hỏi Quiz Sinh Bởi AI Gemini 3.5

Thời gian ghi nhận: `2026-07-30T16:42:15.899016`

## [TC_HAPPY_01] Happy Path — Computer_Vision_Bai_Giang.pptx
- **Mã nguồn Slide/Transcript**: `Computer_Vision_Bai_Giang.pptx#Slide12-13`
- **Văn bản đầu vào bài giảng**: *"CHƯƠNG 2 · ẢNH SỐ. RGB (Red-Green-Blue) là mô hình cộng màu, mô phỏng cách mắt người và màn hình hiển thị. HSV (Hue-Saturation-Value) tách biệt thông tin màu sắc và độ sáng. Biểu diễn ảnh xám (Grayscale) bằng ma trận 2 chiều, mỗi phần tử có cường độ sáng từ 0 đến 255. Ảnh màu biểu diễn bằng tensor 3 chiều."*
- **Trạng thái**: `PASS`

### ❓ Câu hỏi 1: Trong các mô hình màu sắc được đề cập, mô hình nào có đặc điểm tách biệt thông tin màu sắc và độ sáng?
- **A**. RGB (Red-Green-Blue)
- **B**. HSV (Hue-Saturation-Value) (✔ ĐÁP ÁN ĐÚNG)
- **C**. Grayscale
- **D**. Tensor 3 chiều
- 💡 **Giải thích**: Theo tài liệu, HSV (Hue-Saturation-Value) là mô hình tách biệt thông tin màu sắc và độ sáng.
- 📍 **Trích dẫn nguồn (`citation`)**: `{'source_id': 'Computer_Vision_Bai_Giang.pptx#Slide12-13', 'parent_source_id': 'Computer_Vision_Bai_Giang.pptx#Slide12-13', 'quote': 'HSV (Hue-Saturation-Value) tách biệt thông tin màu sắc và độ sáng.'}`

---

## [TC_HAPPY_02] Happy Path — Computer_Vision_Bai_Giang.pptx
- **Mã nguồn Slide/Transcript**: `Computer_Vision_Bai_Giang.pptx#Slide25`
- **Văn bản đầu vào bài giảng**: *"CHƯƠNG 3 · XỬ LÝ ẢNH. Biến đổi hình thái học: Erosion (Phép co) thu nhỏ vùng đối tượng foreground trong ảnh nhị phân, loại bỏ các điểm nhiễu nhỏ và tách các đối tượng dính liền. Dilation (Phép giãn) làm mở rộng vùng đối tượng."*
- **Trạng thái**: `PASS`

### ❓ Câu hỏi 1: Trong xử lý ảnh nhị phân, phép toán nào được sử dụng để loại bỏ các điểm nhiễu nhỏ và tách các đối tượng dính liền?
- **A**. Dilation (Phép giãn)
- **B**. Erosion (Phép co) (✔ ĐÁP ÁN ĐÚNG)
- **C**. Biến đổi hình thái học tổng quát
- **D**. Mở rộng vùng đối tượng
- 💡 **Giải thích**: Phép co (Erosion) có chức năng thu nhỏ vùng đối tượng, giúp loại bỏ nhiễu và tách các đối tượng dính liền nhau.
- 📍 **Trích dẫn nguồn (`citation`)**: `{'source_id': 'Computer_Vision_Bai_Giang.pptx#Slide25', 'parent_source_id': 'Computer_Vision_Bai_Giang.pptx#Slide25', 'quote': 'CHƯƠNG 3 · XỬ LÝ ẢNH. Biến đổi hình thái học: Erosion (Phép co) thu nhỏ vùng đối tượng foreground trong ảnh nhị phân, loại bỏ các điểm nhiễu nhỏ và tách các đối tượng dính liền. Dilation (Phép giãn) làm mở rộng vùng đối tượng.'}`

---

## [TC_HAPPY_03] Happy Path — Computer_Vision_Bai_Giang.pptx
- **Mã nguồn Slide/Transcript**: `Computer_Vision_Bai_Giang.pptx#Slide31`
- **Văn bản đầu vào bài giảng**: *"CHƯƠNG 4 · ĐẶC TRƯNG ẢNH. SIFT - Scale Invariant Feature Transform. Bước 1: Phát hiện cực trị trong không gian tỉ lệ dùng Difference of Gaussian (DoG) ở nhiều tỉ lệ để tìm điểm đặc trưng ứng viên. SIFT có tính bất biến với tỉ lệ và phép quay."*
- **Trạng thái**: `PASS`

### ❓ Câu hỏi 1: Tại sao thuật toán SIFT (Scale Invariant Feature Transform) lại được coi là một phương pháp trích xuất đặc trưng mạnh mẽ trong thị giác máy tính?
- **A**. Vì nó sử dụng Difference of Gaussian để phát hiện cực trị trong không gian tỉ lệ.
- **B**. Vì nó có khả năng duy trì tính ổn định trước sự thay đổi về tỉ lệ và phép quay của ảnh. (✔ ĐÁP ÁN ĐÚNG)
- **C**. Vì nó chỉ tập trung vào việc tìm kiếm các điểm đặc trưng ứng viên ở một tỉ lệ duy nhất.
- **D**. Vì nó loại bỏ hoàn toàn các điểm đặc trưng không quan trọng trong không gian tỉ lệ.
- 💡 **Giải thích**: Theo tài liệu, SIFT có tính bất biến với tỉ lệ và phép quay, giúp nó duy trì hiệu quả khi ảnh bị thay đổi các yếu tố này.
- 📍 **Trích dẫn nguồn (`citation`)**: `{'source_id': 'Computer_Vision_Bai_Giang.pptx#Slide31', 'parent_source_id': 'Computer_Vision_Bai_Giang.pptx#Slide31', 'quote': 'SIFT có tính bất biến với tỉ lệ và phép quay.'}`

---

## [TC_HAPPY_04] Happy Path — Computer_Vision_Bai_Giang.pptx
- **Mã nguồn Slide/Transcript**: `Computer_Vision_Bai_Giang.pptx#Slide43`
- **Văn bản đầu vào bài giảng**: *"CHƯƠNG 5 · CNN. ResNet - Residual Learning. Vấn đề mạng quá sâu: Khi tăng số lớp, độ chính xác có thể giảm do vấn đề tiêu biến/bùng nổ gradient. Giải pháp: Kết nối tắt (Skip Connection) cho phép thông tin đi tắt qua một hoặc nhiều lớp."*
- **Trạng thái**: `PASS`

### ❓ Câu hỏi 1: Trong kiến trúc ResNet, mục đích chính của việc sử dụng 'Kết nối tắt' (Skip Connection) là gì?
- **A**. Để tăng số lượng lớp trong mạng mà không làm thay đổi độ chính xác.
- **B**. Để giải quyết vấn đề tiêu biến hoặc bùng nổ gradient khi mạng quá sâu. (✔ ĐÁP ÁN ĐÚNG)
- **C**. Để loại bỏ hoàn toàn các lớp ẩn trong mạng CNN.
- **D**. Để thay thế hoàn toàn quá trình học tập của các lớp trong mạng.
- 💡 **Giải thích**: Kết nối tắt (Skip Connection) được sử dụng như một giải pháp để khắc phục vấn đề độ chính xác giảm do tiêu biến hoặc bùng nổ gradient khi mạng có quá nhiều lớp.
- 📍 **Trích dẫn nguồn (`citation`)**: `{'source_id': 'Computer_Vision_Bai_Giang.pptx#Slide43', 'parent_source_id': 'Computer_Vision_Bai_Giang.pptx#Slide43', 'quote': 'Vấn đề mạng quá sâu: Khi tăng số lớp, độ chính xác có thể giảm do vấn đề tiêu biến/bùng nổ gradient. Giải pháp: Kết nối tắt (Skip Connection) cho phép thông tin đi tắt qua một hoặc nhiều lớp.'}`

---

## [TC_HAPPY_05] Happy Path — Deep_Learning_Bai_Giang.pptx
- **Mã nguồn Slide/Transcript**: `Deep_Learning_Bai_Giang.pptx#Slide10-11`
- **Văn bản đầu vào bài giảng**: *"BÀI GIẢNG Deep Learning. Vai trò của hàm kích hoạt (Activation Function): Tạo tính phi tuyến cho mạng nơ-ron. Nếu không có hàm kích hoạt, chồng nhiều lớp tuyến tính vẫn chỉ tương đương một phép biến đổi tuyến tính đơn. Hàm Sigmoid = 1 / (1 + e^-x), miền giá trị (0,1)."*
- **Trạng thái**: `PASS`

### ❓ Câu hỏi 1: Tại sao mạng nơ-ron cần sử dụng hàm kích hoạt (Activation Function)?
- **A**. Để tăng tốc độ tính toán của các lớp tuyến tính.
- **B**. Để tạo tính phi tuyến cho mạng nơ-ron. (✔ ĐÁP ÁN ĐÚNG)
- **C**. Để giới hạn miền giá trị của đầu vào trong khoảng (0,1).
- **D**. Để thay thế các phép biến đổi tuyến tính bằng phép biến đổi phi tuyến.
- 💡 **Giải thích**: Hàm kích hoạt đóng vai trò tạo tính phi tuyến cho mạng nơ-ron, giúp tránh việc chồng nhiều lớp tuyến tính chỉ tương đương với một phép biến đổi tuyến tính đơn.
- 📍 **Trích dẫn nguồn (`citation`)**: `{'source_id': 'Deep_Learning_Bai_Giang.pptx#Slide10-11', 'parent_source_id': 'Deep_Learning_Bai_Giang.pptx#Slide10-11', 'quote': 'Vai trò của hàm kích hoạt (Activation Function): Tạo tính phi tuyến cho mạng nơ-ron. Nếu không có hàm kích hoạt, chồng nhiều lớp tuyến tính vẫn chỉ tương đương một phép biến đổi tuyến tính đơn.'}`

---

## [TC_HAPPY_06] Happy Path — Deep_Learning_Bai_Giang.pptx
- **Mã nguồn Slide/Transcript**: `Deep_Learning_Bai_Giang.pptx#Slide13`
- **Văn bản đầu vào bài giảng**: *"BÀI GIẢNG Deep Learning. ĐO LƯỜNG SAI SỐ - Hàm mất mát (Loss Function). Mean Squared Error (MSE) áp dụng cho bài toán Hồi quy (Regression), phạt nặng sai số lớn do bình phương. Mean Absolute Error (MAE) ít nhạy với điểm ngoại lai (outliers)."*
- **Trạng thái**: `PASS`

### ❓ Câu hỏi 1: Tại sao Mean Squared Error (MSE) lại phạt nặng các sai số lớn trong bài toán hồi quy?
- **A**. Vì nó sử dụng giá trị tuyệt đối của sai số.
- **B**. Vì nó thực hiện phép tính bình phương sai số. (✔ ĐÁP ÁN ĐÚNG)
- **C**. Vì nó nhạy cảm với các điểm ngoại lai (outliers).
- **D**. Vì nó được thiết kế riêng cho các bài toán phân loại.
- 💡 **Giải thích**: MSE phạt nặng sai số lớn do thực hiện phép tính bình phương sai số.
- 📍 **Trích dẫn nguồn (`citation`)**: `{'source_id': 'Deep_Learning_Bai_Giang.pptx#Slide13', 'parent_source_id': 'Deep_Learning_Bai_Giang.pptx#Slide13', 'quote': 'Mean Squared Error (MSE) áp dụng cho bài toán Hồi quy (Regression), phạt nặng sai số lớn do bình phương.'}`

---

## [TC_HAPPY_07] Happy Path — Deep_Learning_Bai_Giang.pptx
- **Mã nguồn Slide/Transcript**: `Deep_Learning_Bai_Giang.pptx#Slide19`
- **Văn bản đầu vào bài giảng**: *"BÀI GIẢNG Deep Learning. Các thuật toán Optimizer nâng cao: Momentum tích luỹ đà từ các bước trước giúp vượt qua điểm yên ngựa (saddle point). AdaGrad tự điều chỉnh learning rate riêng cho từng tham số."*
- **Trạng thái**: `PASS`

### ❓ Câu hỏi 1: Trong Deep Learning, thuật toán Optimizer nào có khả năng tự điều chỉnh tốc độ học (learning rate) cho từng tham số riêng biệt?
- **A**. Momentum
- **B**. AdaGrad (✔ ĐÁP ÁN ĐÚNG)
- **C**. Saddle Point Optimizer
- **D**. Gradient Descent cơ bản
- 💡 **Giải thích**: Theo tài liệu, AdaGrad là thuật toán có chức năng tự điều chỉnh learning rate riêng cho từng tham số.
- 📍 **Trích dẫn nguồn (`citation`)**: `{'source_id': 'Deep_Learning_Bai_Giang.pptx#Slide19', 'parent_source_id': 'Deep_Learning_Bai_Giang.pptx#Slide19', 'quote': 'BÀI GIẢNG Deep Learning. Các thuật toán Optimizer nâng cao: Momentum tích luỹ đà từ các bước trước giúp vượt qua điểm yên ngựa (saddle point). AdaGrad tự điều chỉnh learning rate riêng cho từng tham số.'}`

---

## [TC_HAPPY_08] Happy Path — Deep_Learning_Bai_Giang.pptx
- **Mã nguồn Slide/Transcript**: `Deep_Learning_Bai_Giang.pptx#Slide37`
- **Văn bản đầu vào bài giảng**: *"BÀI GIẢNG Deep Learning. Mạng LSTM (Long Short-Term Memory). Trạng thái ô nhớ (Cell state C_t). Forget Gate (Cổng quên) quyết định phần thông tin nào từ quá trình trước sẽ bị bỏ qua. Input Gate (Cổng vào) cập nhật thông tin mới."*
- **Trạng thái**: `PASS`

### ❓ Câu hỏi 1: Trong mạng LSTM, chức năng chính của 'Forget Gate' (Cổng quên) là gì?
- **A**. Cập nhật thông tin mới vào trạng thái ô nhớ.
- **B**. Quyết định phần thông tin nào từ quá trình trước sẽ bị bỏ qua. (✔ ĐÁP ÁN ĐÚNG)
- **C**. Lưu trữ toàn bộ trạng thái ô nhớ C_t.
- **D**. Chuyển đổi dữ liệu đầu vào thành trạng thái ẩn.
- 💡 **Giải thích**: Theo tài liệu, Forget Gate (Cổng quên) có nhiệm vụ quyết định phần thông tin nào từ quá trình trước sẽ bị bỏ qua.
- 📍 **Trích dẫn nguồn (`citation`)**: `{'source_id': 'Deep_Learning_Bai_Giang.pptx#Slide37', 'parent_source_id': 'Deep_Learning_Bai_Giang.pptx#Slide37', 'quote': 'Forget Gate (Cổng quên) quyết định phần thông tin nào từ quá trình trước sẽ bị bỏ qua.'}`

---

## [TC_HAPPY_09] Happy Path — Machine_Learning_Bai_Giang.pptx
- **Mã nguồn Slide/Transcript**: `Machine_Learning_Bai_Giang.pptx#Slide10-11`
- **Văn bản đầu vào bài giảng**: *"TRÍ TUỆ NHÂN TẠO - Machine Learning. Ba nhóm bài toán chính: Học có giám sát (Supervised Learning), Học không giám sát (Unsupervised Learning), và Học tăng cường (Reinforcement Learning). Học có giám sát gồm 2 bài toán chính: Hồi quy (dự đoán giá trị liên tục) và Phân loại (dự đoán nhãn rời rạc)."*
- **Trạng thái**: `PASS`

### ❓ Câu hỏi 1: Trong học có giám sát (Supervised Learning), bài toán nào được sử dụng để dự đoán giá trị liên tục?
- **A**. Học tăng cường
- **B**. Hồi quy (✔ ĐÁP ÁN ĐÚNG)
- **C**. Phân loại
- **D**. Học không giám sát
- 💡 **Giải thích**: Học có giám sát bao gồm bài toán hồi quy dùng để dự đoán giá trị liên tục.
- 📍 **Trích dẫn nguồn (`citation`)**: `{'source_id': 'Machine_Learning_Bai_Giang.pptx#Slide10-11', 'parent_source_id': 'Machine_Learning_Bai_Giang.pptx#Slide10-11', 'quote': 'Học có giám sát gồm 2 bài toán chính: Hồi quy (dự đoán giá trị liên tục) và Phân loại (dự đoán nhãn rời rạc).'}`

---

## [TC_HAPPY_10] Happy Path — Machine_Learning_Bai_Giang.pptx
- **Mã nguồn Slide/Transcript**: `Machine_Learning_Bai_Giang.pptx#Slide25`
- **Văn bản đầu vào bài giảng**: *"TRÍ TUỆ NHÂN TẠO - Machine Learning. Phân cụm K-Means Clustering: Bước 1: Chọn K tâm cụm (centroid) ban đầu ngẫu nhiên. Bước 2: Gán mỗi điểm dữ liệu vào cụm có tâm gần nhất. Bước 3: Cập nhật lại tâm cụm bằng trung bình cộng các điểm trong cụm."*
- **Trạng thái**: `PASS`

### ❓ Câu hỏi 1: Trong thuật toán K-Means Clustering, bước nào được thực hiện sau khi đã gán mỗi điểm dữ liệu vào cụm có tâm gần nhất?
- **A**. Chọn K tâm cụm ban đầu ngẫu nhiên.
- **B**. Cập nhật lại tâm cụm bằng trung bình cộng các điểm trong cụm. (✔ ĐÁP ÁN ĐÚNG)
- **C**. Xóa bỏ các điểm dữ liệu không thuộc cụm.
- **D**. Tăng số lượng cụm K lên gấp đôi.
- 💡 **Giải thích**: Theo quy trình K-Means, sau khi gán các điểm vào cụm, bước tiếp theo là cập nhật lại tâm cụm bằng trung bình cộng các điểm trong cụm đó.
- 📍 **Trích dẫn nguồn (`citation`)**: `{'source_id': 'Machine_Learning_Bai_Giang.pptx#Slide25', 'parent_source_id': 'Machine_Learning_Bai_Giang.pptx#Slide25', 'quote': 'TRÍ TUỆ NHÂN TẠO - Machine Learning. Phân cụm K-Means Clustering: Bước 1: Chọn K tâm cụm (centroid) ban đầu ngẫu nhiên. Bước 2: Gán mỗi điểm dữ liệu vào cụm có tâm gần nhất. Bước 3: Cập nhật lại tâm cụm bằng trung bình cộng các điểm trong cụm.'}`

---

## [TC_HARD_CLASS1_01] Lớp 1 — Nguồn sự thật — Machine_Learning_Bai_Giang.pptx
- **Mã nguồn Slide/Transcript**: `Machine_Learning_Bai_Giang.pptx#Slide10`
- **Văn bản đầu vào bài giảng**: *"PHÂN LOẠI THEO CÁCH HỌC: Ba nhóm bài toán chính trong ML: 1) Học có giám sát, 2) Học không giám sát, 3) Học tăng cường."*
- **Trạng thái**: `PASS`

### ❓ Câu hỏi 1: Theo tài liệu giảng dạy, Machine Learning được chia thành bao nhiêu nhóm bài toán chính dựa trên cách học?
- **A**. Hai nhóm
- **B**. Ba nhóm (✔ ĐÁP ÁN ĐÚNG)
- **C**. Bốn nhóm
- **D**. Năm nhóm
- 💡 **Giải thích**: Tài liệu nêu rõ có ba nhóm bài toán chính trong ML: Học có giám sát, Học không giám sát và Học tăng cường.
- 📍 **Trích dẫn nguồn (`citation`)**: `{'source_id': 'Machine_Learning_Bai_Giang.pptx#Slide10', 'parent_source_id': 'Machine_Learning_Bai_Giang.pptx#Slide10', 'quote': 'PHÂN LOẠI THEO CÁCH HỌC: Ba nhóm bài toán chính trong ML: 1) Học có giám sát, 2) Học không giám sát, 3) Học tăng cường.'}`

---

## [TC_HARD_CLASS1_02] Lớp 1 — Nguồn sự thật — Deep_Learning_Bai_Giang.pptx
- **Mã nguồn Slide/Transcript**: `Deep_Learning_Bai_Giang.pptx#Slide25`
- **Văn bản đầu vào bài giảng**: *"Khởi tạo trọng số (Weight Initialization). Khởi tạo bằng 0 làm mọi nơ-ron học giống hệt nhau. Khởi tạo ngẫu nhiên nhỏ giúp phá vỡ tính đối xứng."*
- **Trạng thái**: `PASS`

### ❓ Câu hỏi 1: Tại sao việc khởi tạo trọng số bằng 0 trong mạng nơ-ron lại không được khuyến khích?
- **A**. Vì nó làm cho các nơ-ron không thể hội tụ.
- **B**. Vì nó làm mọi nơ-ron học giống hệt nhau. (✔ ĐÁP ÁN ĐÚNG)
- **C**. Vì nó làm mất đi tính đối xứng của mô hình.
- **D**. Vì nó khiến trọng số trở nên quá lớn.
- 💡 **Giải thích**: Khởi tạo trọng số bằng 0 khiến các nơ-ron không có sự khác biệt trong quá trình học, dẫn đến việc chúng học giống hệt nhau.
- 📍 **Trích dẫn nguồn (`citation`)**: `{'source_id': 'Deep_Learning_Bai_Giang.pptx#Slide25', 'parent_source_id': 'Deep_Learning_Bai_Giang.pptx#Slide25', 'quote': 'Khởi tạo trọng số (Weight Initialization). Khởi tạo bằng 0 làm mọi nơ-ron học giống hệt nhau. Khởi tạo ngẫu nhiên nhỏ giúp phá vỡ tính đối xứng.'}`

---

## [TC_HARD_CLASS2_01] Lớp 2 — Mơ hồ / Thiếu thông tin — Machine_Learning_Bai_Giang.pptx
- **Mã nguồn Slide/Transcript**: `Machine_Learning_Bai_Giang.pptx#Slide49`
- **Văn bản đầu vào bài giảng**: *"PHẦN 7 Công cụ, đạo đức & xu hướng. Hệ sinh thái thực hành và định hướng phát triển."*
- **Trạng thái**: `PASS`

### ❓ Câu hỏi 1: Nội dung chính của Phần 7 trong bài giảng Machine Learning là gì?
- **A**. Công cụ, đạo đức và xu hướng phát triển. (✔ ĐÁP ÁN ĐÚNG)
- **B**. Các thuật toán học máy nâng cao.
- **C**. Lịch sử hình thành của trí tuệ nhân tạo.
- **D**. Cách cài đặt phần mềm lập trình.
- 💡 **Giải thích**: Phần 7 tập trung vào các công cụ, đạo đức và xu hướng, bao gồm hệ sinh thái thực hành và định hướng phát triển.
- 📍 **Trích dẫn nguồn (`citation`)**: `{'source_id': 'Machine_Learning_Bai_Giang.pptx#Slide49', 'parent_source_id': 'Machine_Learning_Bai_Giang.pptx#Slide49', 'quote': 'PHẦN 7 Công cụ, đạo đức & xu hướng. Hệ sinh thái thực hành và định hướng phát triển.'}`

---

## [TC_HARD_CLASS2_02] Lớp 2 — Mơ hồ / Thiếu thông tin — Computer_Vision_Bai_Giang.pptx
- **Mã nguồn Slide/Transcript**: `Computer_Vision_Bai_Giang.pptx#Slide55`
- **Văn bản đầu vào bài giảng**: *"Luồng quang học (Optical Flow). Phương pháp cổ điển Thuật toán Lucas-Kana..."*
- **Trạng thái**: `PASS`

### ❓ Câu hỏi 1: Thuật toán nào được nhắc đến như một phương pháp cổ điển trong lĩnh vực Luồng quang học (Optical Flow)?
- **A**. Thuật toán Lucas-Kanade (✔ ĐÁP ÁN ĐÚNG)
- **B**. Thuật toán YOLO
- **C**. Thuật toán Canny
- **D**. Thuật toán Harris Corner
- 💡 **Giải thích**: Theo tài liệu, thuật toán Lucas-Kanade được phân loại là một phương pháp cổ điển trong Luồng quang học.
- 📍 **Trích dẫn nguồn (`citation`)**: `{'source_id': 'Computer_Vision_Bai_Giang.pptx#Slide55', 'parent_source_id': 'Computer_Vision_Bai_Giang.pptx#Slide55', 'quote': 'Luồng quang học (Optical Flow). Phương pháp cổ điển Thuật toán Lucas-Kana...'}`

---

## [TC_HARD_CLASS3_01] Lớp 3 — Thẩm quyền / Ngoài phạm vi — Download_Logistics
- **Mã nguồn Slide/Transcript**: `Download_Logistics#Log01`
- **Văn bản đầu vào bài giảng**: *"Thông báo từ Phòng Đào tạo: Sinh viên cần hoàn thành học phí học kỳ trước ngày 15/08 và đăng ký lịch thi lại trên portal."*
- **Trạng thái**: `PASS`

### ❓ Câu hỏi 1: Theo thông báo từ Phòng Đào tạo, sinh viên cần thực hiện công việc gì trước ngày 15/08?
- **A**. Hoàn thành học phí học kỳ (✔ ĐÁP ÁN ĐÚNG)
- **B**. Đăng ký môn học mới
- **C**. Nộp đơn xin nghỉ học
- **D**. Nhận bằng tốt nghiệp
- 💡 **Giải thích**: Thông báo nêu rõ sinh viên cần hoàn thành học phí học kỳ trước ngày 15/08.
- 📍 **Trích dẫn nguồn (`citation`)**: `{'source_id': 'Download_Logistics#Log01', 'parent_source_id': 'Download_Logistics#Log01', 'quote': 'Thông báo từ Phòng Đào tạo: Sinh viên cần hoàn thành học phí học kỳ trước ngày 15/08 và đăng ký lịch thi lại trên portal.'}`

---

## [TC_HARD_CLASS3_02] Lớp 3 — Thẩm quyền / Ngoài phạm vi — General_Topic
- **Mã nguồn Slide/Transcript**: `General_Topic#AutoClicker`
- **Văn bản đầu vào bài giảng**: *"Hướng dẫn sử dụng AutoClicker: Thiết lập khoảng thời gian giữa các lần nhấp chuột tính bằng millisecond và chọn vị trí cố định trên màn hình."*
- **Trạng thái**: `PASS`

### ❓ Câu hỏi 1: Khi thiết lập AutoClicker, người dùng cần xác định những thông số nào?
- **A**. Khoảng thời gian giữa các lần nhấp và vị trí cố định trên màn hình. (✔ ĐÁP ÁN ĐÚNG)
- **B**. Tốc độ internet và độ phân giải của màn hình.
- **C**. Số lượng ứng dụng đang chạy và dung lượng RAM.
- **D**. Tên người dùng và mật khẩu đăng nhập hệ thống.
- 💡 **Giải thích**: Theo hướng dẫn, người dùng cần thiết lập khoảng thời gian giữa các lần nhấp (tính bằng millisecond) và chọn vị trí cố định trên màn hình.
- 📍 **Trích dẫn nguồn (`citation`)**: `{'source_id': 'General_Topic#AutoClicker', 'parent_source_id': 'General_Topic#AutoClicker', 'quote': 'Hướng dẫn sử dụng AutoClicker: Thiết lập khoảng thời gian giữa các lần nhấp chuột tính bằng millisecond và chọn vị trí cố định trên màn hình.'}`

---

## [TC_HARD_CLASS4_01] Lớp 4 — Đặc thù Domain — Machine_Learning_Bai_Giang.pptx
- **Mã nguồn Slide/Transcript**: `Machine_Learning_Bai_Giang.pptx#Slide43`
- **Văn bản đầu vào bài giảng**: *"CÁC THUẬT TOÁN BOOSTING PHỔ BIẾN: AdaBoost tăng trọng số cho các mẫu bị phân loại sai qua từng vòng lặp. Gradient Boosting: Mỗi cây mới học để dự đoán phần dư (residual) của các cây trước."*
- **Trạng thái**: `PASS`

### ❓ Câu hỏi 1: Trong thuật toán Gradient Boosting, mục tiêu chính của mỗi cây quyết định mới được thêm vào là gì?
- **A**. Tăng trọng số cho các mẫu bị phân loại sai.
- **B**. Dự đoán phần dư (residual) của các cây trước đó. (✔ ĐÁP ÁN ĐÚNG)
- **C**. Loại bỏ các mẫu dữ liệu có nhiễu cao.
- **D**. Tăng số lượng vòng lặp để giảm độ phức tạp của mô hình.
- 💡 **Giải thích**: Theo tài liệu, Gradient Boosting hoạt động bằng cách để mỗi cây mới học để dự đoán phần dư (residual) của các cây trước.
- 📍 **Trích dẫn nguồn (`citation`)**: `{'source_id': 'Machine_Learning_Bai_Giang.pptx#Slide43', 'parent_source_id': 'Machine_Learning_Bai_Giang.pptx#Slide43', 'quote': 'Gradient Boosting: Mỗi cây mới học để dự đoán phần dư (residual) của các cây trước.'}`

---

## [TC_HARD_CLASS4_02] Lớp 4 — Đặc thù Domain — Computer_Vision_Bai_Giang.pptx
- **Mã nguồn Slide/Transcript**: `Computer_Vision_Bai_Giang.pptx#Slide49`
- **Văn bản đầu vào bài giảng**: *"Họ mô hình R-CNN. R-CNN (2014) trích xuất ~2000 vùng đề xuất (region proposals) và chạy CNN riêng lẻ. Fast R-CNN (2015) chia sẻ tính toán CNN cho toàn bộ ảnh, nhanh hơn nhiều."*
- **Trạng thái**: `PASS`

### ❓ Câu hỏi 1: Tại sao Fast R-CNN (2015) được coi là cải tiến hơn so với R-CNN (2014) về mặt hiệu năng?
- **A**. Nó sử dụng nhiều vùng đề xuất hơn để tăng độ chính xác.
- **B**. Nó chia sẻ tính toán CNN cho toàn bộ ảnh thay vì chạy riêng lẻ cho từng vùng. (✔ ĐÁP ÁN ĐÚNG)
- **C**. Nó loại bỏ hoàn toàn việc sử dụng các vùng đề xuất (region proposals).
- **D**. Nó tăng số lượng vùng đề xuất lên gấp đôi so với R-CNN.
- 💡 **Giải thích**: Fast R-CNN nhanh hơn vì nó chia sẻ tính toán CNN cho toàn bộ ảnh thay vì chạy CNN riêng lẻ cho từng vùng như R-CNN.
- 📍 **Trích dẫn nguồn (`citation`)**: `{'source_id': 'Computer_Vision_Bai_Giang.pptx#Slide49', 'parent_source_id': 'Computer_Vision_Bai_Giang.pptx#Slide49', 'quote': 'Họ mô hình R-CNN. R-CNN (2014) trích xuất ~2000 vùng đề xuất (region proposals) và chạy CNN riêng lẻ. Fast R-CNN (2015) chia sẻ tính toán CNN cho toàn bộ ảnh, nhanh hơn nhiều.'}`

---

## [TC_RARE_01] Case Hiếm — Deep_Learning_Bai_Giang.pptx
- **Mã nguồn Slide/Transcript**: `Deep_Learning_Bai_Giang.pptx#Slide11`
- **Văn bản đầu vào bài giảng**: *"Sigmoid f(x) = 1 / (1 + e^-x) có đạo hàm f'(x) = f(x)(1 - f(x)). ReLU f(x) = max(0, x) có đạo hàm bằng 1 khi x > 0 và bằng 0 khi x < 0."*
- **Trạng thái**: `PASS`

### ❓ Câu hỏi 1: Đạo hàm của hàm ReLU f(x) = max(0, x) có giá trị là bao nhiêu khi x > 0?
- **A**. 0
- **B**. 1 (✔ ĐÁP ÁN ĐÚNG)
- **C**. x
- **D**. f(x)(1 - f(x))
- 💡 **Giải thích**: Theo tài liệu, hàm ReLU có đạo hàm bằng 1 khi x > 0.
- 📍 **Trích dẫn nguồn (`citation`)**: `{'source_id': 'Deep_Learning_Bai_Giang.pptx#Slide11', 'parent_source_id': 'Deep_Learning_Bai_Giang.pptx#Slide11', 'quote': 'ReLU f(x) = max(0, x) có đạo hàm bằng 1 khi x > 0 và bằng 0 khi x < 0.'}`

---

## [TC_RARE_02] Case Hiếm — Computer_Vision_Bai_Giang.pptx
- **Mã nguồn Slide/Transcript**: `Computer_Vision_Bai_Giang.pptx#Slide37`
- **Văn bản đầu vào bài giảng**: *"Mạng nơ-ron tích chập (CNN) tận dụng cấu trúc không gian của ảnh, chia sẻ trọng số (weight sharing) giúp giảm số tham số so với mạng fully-connected. Đạt tính bất biến với dịch chuyển nhỏ (translation invariance)."*
- **Trạng thái**: `PASS`

### ❓ Câu hỏi 1: Tại sao mạng nơ-ron tích chập (CNN) lại có số lượng tham số ít hơn so với mạng fully-connected?
- **A**. Vì CNN sử dụng cơ chế chia sẻ trọng số (weight sharing). (✔ ĐÁP ÁN ĐÚNG)
- **B**. Vì CNN không sử dụng các lớp ẩn.
- **C**. Vì CNN chỉ xử lý các ảnh có kích thước rất nhỏ.
- **D**. Vì CNN loại bỏ hoàn toàn cấu trúc không gian của ảnh.
- 💡 **Giải thích**: CNN giảm số lượng tham số so với mạng fully-connected nhờ vào việc chia sẻ trọng số (weight sharing).
- 📍 **Trích dẫn nguồn (`citation`)**: `{'source_id': 'Computer_Vision_Bai_Giang.pptx#Slide37', 'parent_source_id': 'Computer_Vision_Bai_Giang.pptx#Slide37', 'quote': 'Mạng nơ-ron tích chập (CNN) tận dụng cấu trúc không gian của ảnh, chia sẻ trọng số (weight sharing) giúp giảm số tham số so với mạng fully-connected.'}`

---

