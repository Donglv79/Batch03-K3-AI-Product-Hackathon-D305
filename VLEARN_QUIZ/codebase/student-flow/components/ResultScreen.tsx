"use client";

import { useState } from "react";
import { FeedbackEntry, Quiz, statusForScorePct, ungroundedIdsFor } from "@/lib/mockQuiz";

type CSSVarStyle = React.CSSProperties & Record<`--${string}`, string | number>;

type Props = {
  quiz: Quiz;
  answers: Record<string, string>;
  feedbackFormOpen: boolean;
  feedbackLog: FeedbackEntry[];
  onRetake: () => void;
  onToggleFeedbackForm: () => void;
  onSubmitFeedback: (entry: { who: string; role: string; comment: string }) => void;
  onOpenSourceSlide?: (chunkId: string) => void;
};

export default function ResultScreen({
  quiz,
  answers,
  feedbackFormOpen,
  feedbackLog,
  onRetake,
  onToggleFeedbackForm,
  onSubmitFeedback,
  onOpenSourceSlide,
}: Props) {
  const [who, setWho] = useState("");
  const [role, setRole] = useState("willing-user");
  const [comment, setComment] = useState("");

  const ungroundedIds = ungroundedIdsFor(quiz);
  const scored = quiz.questions.filter((q) => !ungroundedIds.includes(q.id));
  const correctCount = scored.filter((q) => answers[q.id] === q.correctOptionId).length;
  const pct = scored.length ? Math.round((correctCount / scored.length) * 100) : 0;
  const status = statusForScorePct(pct);
  const wrongOnes = scored.filter((q) => answers[q.id] !== q.correctOptionId);

  let summary: string;
  if (scored.length === 0) summary = "Chưa có câu nào tính điểm được trong bộ này.";
  else if (pct >= 80) summary = "Xuất sắc! Bạn đã nắm rất vững toàn bộ nội dung slide bài học này.";
  else if (pct >= 50) summary = "Khá tốt! Bạn đã nắm được phần lớn, nhưng còn vài khái niệm cần ôn lại.";
  else summary = "Cần chú ý: Bài học này có nhiều nội dung chưa nắm vững — nên đọc lại slide bài giảng.";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = comment.trim();
    if (!trimmed) return;
    onSubmitFeedback({ who: who.trim() || "(ẩn danh)", role, comment: trimmed });
    setWho("");
    setComment("");
  }

  return (
    <div className="result-screen-container">
      <div className="card result-hero-card">
        <div className="result-head">
          <div
            className="score-badge-large"
            style={{ backgroundColor: `${status.color}15`, color: status.color, borderColor: status.color }}
          >
            <span className="score-num">{pct}%</span>
            <span className="score-sub">
              {correctCount}/{scored.length} câu đúng
            </span>
          </div>
          <div className="result-summary">
            <span className="result-tag" style={{ color: status.color, backgroundColor: `${status.color}18` }}>
              {status.label}
            </span>
            <h1>Kết quả Đánh Giá Hiểu Bài</h1>
            <p>{summary}</p>
          </div>
        </div>

        <div className="result-actions">
          <button className="btn btn-ghost" onClick={onRetake}>
            🔄 Làm lại bài Quiz
          </button>
          <button className="btn btn-primary" onClick={onToggleFeedbackForm}>
            💬 Đóng góp ý kiến (User Feedback)
          </button>
        </div>

        {feedbackFormOpen && (
          <form className="feedback-form" onSubmit={handleSubmit}>
            <h3>📝 Gửi Phản Hồi Cho Hệ Thống VLearn</h3>
            <div className="form-group">
              <label>Họ tên / Vai trò:</label>
              <input
                value={who}
                onChange={(e) => setWho(e.target.value)}
                type="text"
                className="input-text"
                placeholder="VD: Minh — Sinh viên K3 VinUni"
              />
            </div>
            <div className="form-group">
              <label>Bạn thử nghiệm với vai trò nào?</label>
              <select value={role} onChange={(e) => setRole(e.target.value)} className="input-text">
                <option value="willing-user">Học viên VinUniversity</option>
                <option value="classmate">Bạn học cùng lớp</option>
                <option value="other-zone">Giảng viên / Trợ giảng</option>
              </select>
            </div>
            <div className="form-group">
              <label>Ý kiến góp ý hoặc nội dung chưa hài lòng:</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                className="input-text"
                placeholder="Nhập nội dung phản hồi chi tiết..."
              />
            </div>
            <div className="btn-row" style={{ marginTop: 12 }}>
              <button className="btn btn-primary" type="submit">
                🚀 Gửi phản hồi ngay
              </button>
            </div>
          </form>
        )}

        {feedbackLog.length > 0 && (
          <div className="feedback-log-list">
            <h4>Lịch sử phản hồi đã ghi nhận:</h4>
            {feedbackLog.map((f, i) => (
              <div className="feedback-log-item" key={i}>
                <div className="feedback-log-meta">
                  <span className="who">{f.who}</span>
                  <span className="muted">
                    ({f.role} · {f.ts})
                  </span>
                </div>
                <div className="feedback-log-text">{f.comment}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card gap-map-card">
        <div className="gap-header">
          <h2>🗺️ Bản Đồ Lỗ Hổng Kiến Thức (Knowledge Gap Map)</h2>
          {ungroundedIds.length > 0 && (
            <span className="pill pill-warning">
              {ungroundedIds.length} câu chưa xác minh nguồn (bỏ qua)
            </span>
          )}
        </div>
        <p className="section-desc">
          AI tự động phát hiện các chủ đề bạn trả lời chưa chính xác và trích dẫn vị trí slide cần ôn tập lại.
        </p>

        <div className="gap-grid">
          {wrongOnes.length === 0 ? (
            <div className="gap-empty-state">
              <span className="empty-icon">🎉</span>
              <h3>Tuyệt vời! Không có lỗ hổng kiến thức nào</h3>
              <p>Bạn đã trả lời đúng toàn bộ các câu hỏi có căn cứ trích dẫn trong bài học này.</p>
            </div>
          ) : (
            wrongOnes.map((q) => (
              <div className="gap-card" key={q.id}>
                <div className="gap-card-top">
                  <span className="gap-topic-tag">⚠️ {q.topic}</span>
                  {q.citation && onOpenSourceSlide && (
                    <button
                      type="button"
                      className="gap-chunk-tag gap-chunk-link"
                      onClick={() => onOpenSourceSlide(q.citation!.chunkId)}
                    >
                      Mở slide nguồn: [{q.citation.chunkId}]
                    </button>
                  )}
                </div>
                <h4 className="gap-q-title">{q.question}</h4>
                <p className="gap-explanation">{q.explanation}</p>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="card review-card">
        <h2>🔍 Xem Lại Chi Tiết Tất Cả Các Câu Hỏi</h2>
        <div className="review-list">
          {quiz.questions.map((q, idx) => {
            const isUngrounded = ungroundedIds.includes(q.id);
            const userOption = q.options.find((o) => o.id === answers[q.id]);
            const correctOption = q.options.find((o) => o.id === q.correctOptionId)!;
            const isCorrect = answers[q.id] === q.correctOptionId;
            return (
              <div className="review-item" key={q.id}>
                <div className="review-item-header">
                  <span className="review-num">Câu {idx + 1}</span>
                  <span className="pill pill-outline">{q.topic}</span>
                </div>
                <h3 className="review-q-text">{q.question}</h3>
                {!isUngrounded && (
                  <div className="review-user-ans">
                    <span>Lựa chọn của bạn: </span>
                    <strong className={isCorrect ? "text-correct" : "text-incorrect"}>
                      {userOption ? `${userOption.id.toUpperCase()}. ${userOption.text}` : "(Chưa chọn)"}
                    </strong>
                    {isCorrect ? (
                      <span className="ans-tag tag-correct">✓ Đúng</span>
                    ) : (
                      <span className="ans-tag tag-incorrect">
                        ✖ Sai (Đáp án đúng: {correctOption?.id.toUpperCase()}. {correctOption?.text})
                      </span>
                    )}
                  </div>
                )}
                {q.citation ? (
                  <div className="citation-block">
                    <div className="citation-quote">{q.citation.quote}</div>
                    {onOpenSourceSlide && (
                      <button
                        type="button"
                        className="citation-link-btn"
                        onClick={() => onOpenSourceSlide(q.citation!.chunkId)}
                      >
                        Mở slide nguồn [{q.citation.chunkId}]
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="feedback-panel is-warning">
                    <div className="feedback-body">⚠️ {q.explanation}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
