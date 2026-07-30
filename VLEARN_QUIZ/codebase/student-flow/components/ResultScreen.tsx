"use client";

import { useState } from "react";
import {
  conciseExplanation,
  FeedbackEntry,
  pageNumberForCitation,
  Quiz,
  statusForScorePct,
  ungroundedIdsFor,
} from "@/lib/mockQuiz";

type CSSVarStyle = React.CSSProperties & Record<`--${string}`, string | number>;

type Props = {
  quiz: Quiz;
  answers: Record<string, string>;
  feedbackFormOpen: boolean;
  feedbackLog: FeedbackEntry[];
  onRetake: () => void;
  onRetakeWrong: (questionIds: string[]) => void;
  onOpenCitation: (page: number) => void;
  onToggleFeedbackForm: () => void;
  onSubmitFeedback: (entry: { who: string; role: string; comment: string }) => void;
};

export default function ResultScreen({
  quiz,
  answers,
  feedbackFormOpen,
  feedbackLog,
  onRetake,
  onRetakeWrong,
  onOpenCitation,
  onToggleFeedbackForm,
  onSubmitFeedback,
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
  else if (pct >= 80) summary = "Bạn đã nắm khá vững nội dung buổi học này!";
  else if (pct >= 50) summary = "Bạn nắm được phần lớn, nhưng còn vài chỗ cần xem lại.";
  else summary = "Buổi học này còn khá nhiều chỗ chưa vững — nên xem lại trước khi qua bài mới.";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = comment.trim();
    if (!trimmed) return;
    onSubmitFeedback({ who: who.trim() || "(ẩn danh)", role, comment: trimmed });
    setWho("");
    setComment("");
  }

  return (
    <>
      <div className="card">
        <div className="result-head">
          <div className="score-ring-wrap">
            <div
              className="score-ring"
              style={{ "--pct": pct, "--ring-color": status.color } as CSSVarStyle}
            />
            <div className="score-ring-inner">
              <div className="score-ring-value">{pct}%</div>
              <div className="score-ring-sub">
                {correctCount}/{scored.length} câu đúng
              </div>
            </div>
          </div>
          <div className="result-summary">
            <h1>Kết quả Đánh Giá Hiểu Bài</h1>
            <p>{summary}</p>
          </div>
        </div>
        <div className="result-actions">
          {wrongOnes.length > 0 && (
            <button
              className="btn btn-ghost"
              onClick={() => onRetakeWrong(wrongOnes.map((q) => q.id))}
            >
              Luyện lại {wrongOnes.length} câu sai
            </button>
          )}
          <button className="btn btn-ghost" onClick={onRetake}>
            ↻ Làm lại bài này
          </button>
          <button className="btn btn-primary" style={{ width: "auto" }} onClick={onToggleFeedbackForm}>
            💬 Đóng góp ý kiến (User Test Log)
          </button>
        </div>

        {feedbackFormOpen && (
          <form className="feedback-form" onSubmit={handleSubmit}>
            <label>Tên / vai trò:</label>
            <input
              value={who}
              onChange={(e) => setWho(e.target.value)}
              type="text"
              placeholder="VD: Minh — học viên K3"
            />
            <label>Bạn thử với vai trò gì?</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="willing-user">Willing user đã đăng ký ở CP1</option>
              <option value="classmate">Bạn học cùng lớp</option>
              <option value="other-zone">Thành viên nhóm/zone khác</option>
            </select>
            <label>Điều gì khó hiểu/khó chịu nhất, hoặc bạn có tin kết quả này không?</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              placeholder="Ghi nguyên văn câu trả lời của người thử..."
            />
            <div className="btn-row">
              <span className="spacer" />
              <button className="btn btn-primary" style={{ width: "auto" }} type="submit">
                Gửi phản hồi
              </button>
            </div>
          </form>
        )}

        {feedbackLog.map((f, i) => (
          <div className="feedback-log-item" key={i}>
            <span className="who">{f.who}</span>{" "}
            <span className="muted">
              ({f.role} · {f.ts})
            </span>
            <div>{f.comment}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <h2>🧭 Bản Đồ Lỗ Hổng Kiến Thức (Knowledge Gap Map)</h2>
        {ungroundedIds.length > 0 && (
          <p className="muted">
            Có {ungroundedIds.length} câu chưa xác minh được nguồn — không tính vào điểm và bản đồ
            lỗ hổng (xem chi tiết ở phần ôn lại bên dưới).
          </p>
        )}
        <div className="gap-grid">
          {wrongOnes.length === 0 ? (
            <div className="gap-empty">🎉 Không có lỗ hổng nào trong bộ câu tính điểm lần này.</div>
          ) : (
            wrongOnes.map((q) => (
              <div className="gap-card" key={q.id}>
                <div className="gap-card-title">⚠️ Lỗ hổng cần ôn lại: {q.topic}</div>
                <div className="gap-chunk">Mã trích dẫn: [{q.citation?.chunkId}]</div>
                <p>{conciseExplanation(q.explanation)}</p>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="card">
        <h2>Xem lại từng câu</h2>
        {quiz.questions.map((q, idx) => {
          const isUngrounded = ungroundedIds.includes(q.id);
          const userOption = q.options.find((o) => o.id === answers[q.id]);
          const correctOption = q.options.find((o) => o.id === q.correctOptionId)!;
          const isCorrect = answers[q.id] === q.correctOptionId;
          const citationPage = pageNumberForCitation(q.citation);
          return (
            <div className="review-item" key={q.id}>
              <div className="muted">
                Câu {idx + 1} · {q.topic}
              </div>
              <strong>{q.question}</strong>
              {!isUngrounded && (
                <div className="muted" style={{ margin: "6px 0" }}>
                  Bạn chọn:{" "}
                  <strong style={{ color: isCorrect ? "var(--status-good-ink)" : "var(--status-critical)" }}>
                    {userOption ? userOption.text : "(chưa trả lời)"}
                  </strong>
                  {isCorrect ? " ✓" : (
                    <>
                      {" "}— đáp án đúng: <strong>{correctOption.text}</strong>
                    </>
                  )}
                </div>
              )}
              {q.citation ? (
                <div className="citation-block">
                  {citationPage && (
                    <button
                      type="button"
                      className="citation-open-btn"
                      onClick={() => onOpenCitation(citationPage)}
                    >
                      Mở đúng trang {citationPage} →
                    </button>
                  )}
                  <div className="citation-quote">
                    &quot;{q.citation.quote}&quot; — [{q.citation.chunkId}]
                  </div>
                </div>
              ) : (
                <div className="feedback-panel is-warning" style={{ marginTop: 8 }}>
                  <div className="feedback-body">⚠️ {q.explanation}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
