import { DIFFICULTY_LABEL, Quiz } from "@/lib/mockQuiz";

type Props = {
  quiz: Quiz;
  currentIndex: number;
  answers: Record<string, string>;
  reported: Record<string, boolean>;
  onSelectOption: (questionId: string, optionId: string) => void;
  onReport: (questionId: string) => void;
  onNext: () => void;
  onPrev: () => void;
};

export default function QuizScreen({
  quiz,
  currentIndex,
  answers,
  reported,
  onSelectOption,
  onReport,
  onNext,
  onPrev,
}: Props) {
  const q = quiz.questions[currentIndex];
  const total = quiz.questions.length;
  const progressPct = Math.round(((currentIndex + 1) / total) * 100);
  const selectedOptionId = answers[q.id];
  const answered = selectedOptionId !== undefined;
  const isUngrounded = !q.citation;
  const isReported = !!reported[q.id];

  function optionClass(optionId: string) {
    let cls = "option";
    if (!answered) return cls;
    if (isUngrounded) {
      if (optionId === selectedOptionId) cls += " picked-neutral";
    } else if (optionId === q.correctOptionId) {
      cls += " correct";
    } else if (optionId === selectedOptionId) {
      cls += " incorrect";
    }
    return cls;
  }

  const correct = !isUngrounded && selectedOptionId === q.correctOptionId;

  return (
    <div className="quiz-card card">
      <div className="quiz-head">
        <div className="quiz-counter-badge">
          <span className="counter-label">Câu hỏi</span>
          <span className="counter-val">{currentIndex + 1}</span>
          <span className="counter-total">/ {total}</span>
        </div>
        <span className="pill pill-outline">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
          {q.topic || "Machine Learning"}
        </span>
      </div>

      <div className="progress-container">
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progressPct}%` }} />
        </div>
        <span className="progress-text">{progressPct}% Hoàn thành</span>
      </div>

      <div className="tag-row">
        <span className="pill pill-accent">
          ⚡ {DIFFICULTY_LABEL[q.difficulty] || "Hiểu bản chất"}
        </span>
      </div>

      <h2 className="question-text">{q.question}</h2>

      <div className="option-list">
        {q.options.map((opt) => {
          const isSelected = selectedOptionId === opt.id;
          return (
            <button
              key={opt.id}
              className={optionClass(opt.id)}
              onClick={() => onSelectOption(q.id, opt.id)}
            >
              <div className="opt-badge">{opt.id.toUpperCase()}</div>
              <span className="opt-text">{opt.text}</span>
              {answered && !isUngrounded && opt.id === q.correctOptionId && (
                <span className="opt-status-icon status-correct">✓</span>
              )}
              {answered && !isUngrounded && isSelected && opt.id !== q.correctOptionId && (
                <span className="opt-status-icon status-incorrect">✕</span>
              )}
            </button>
          );
        })}
      </div>

      {answered && (
        <div
          className={`feedback-panel ${
            isUngrounded ? "is-warning" : correct ? "is-correct" : "is-incorrect"
          }`}
        >
          <div className="feedback-header">
            <div className="feedback-title">
              {isUngrounded
                ? "⚠️ Chưa xác minh nguồn slide"
                : correct
                ? "✨ Chính xác! Rất tốt"
                : "✖ Chưa chính xác"}
            </div>
            <button
              className="report-btn"
              data-reported={isReported}
              disabled={isReported}
              onClick={() => onReport(q.id)}
            >
              {isReported ? "✓ Đã gửi báo cáo" : "🚩 Báo lỗi câu này"}
            </button>
          </div>
          <div className="feedback-body">{q.explanation}</div>
        </div>
      )}

      <div className="btn-row">
        <button className="btn btn-ghost" onClick={onPrev} disabled={currentIndex === 0}>
          ← Câu trước
        </button>
        <button className="btn btn-primary" onClick={onNext} disabled={!answered}>
          {currentIndex === total - 1 ? "Xem kết quả bài test 🎉" : "Câu tiếp theo →"}
        </button>
      </div>
    </div>
  );
}
