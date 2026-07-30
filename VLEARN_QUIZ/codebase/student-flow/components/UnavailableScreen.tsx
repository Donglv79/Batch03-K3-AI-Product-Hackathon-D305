type Props = { lectureTitle: string };

export default function UnavailableScreen({ lectureTitle }: Props) {
  return (
    <div className="card">
      <h1>Chưa có quiz cho buổi này</h1>
      <p>
        &quot;{lectureTitle}&quot; chưa được Người 3 (Gemini Quiz Engine) sinh quiz — tránh hiện nội
        dung bịa khi chưa có căn cứ.
      </p>
      <p className="muted">
        Chọn &quot;Foundation: cách LLM hoạt động&quot; hoặc &quot;Xác định bài toán kinh doanh cho
        AI&quot; ở danh sách bên trái để dùng bản demo đang chạy được, hoặc chờ quiz engine bổ sung
        buổi này.
      </p>
    </div>
  );
}
