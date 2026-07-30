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
    <div className="card quiz-card">
      <div className="quiz-head">
        <span className="muted">
          Câu {currentIndex + 1} / {total}
        </span>
        <span className="pill pill-outline">{q.topic || "Machine Learning"}</span>
      </div>

      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${progressPct}%` }} />
      </div>

      <div className="tag-row">
        <span className="pill pill-accent">
          {DIFFICULTY_LABEL[q.difficulty] || "Hiểu bản chất"}
        </span>
        {q.citation ? (
          <span className="pill pill-chunk">Nguồn [{q.citation.chunkId}]</span>
        ) : (
          <span className="pill pill-warning">Chưa có căn cứ nguồn</span>
        )}
      </div>

      <h2 className="question-text">{q.question}</h2>

      <div className="option-list">
        {q.options.map((opt) => (
          <button
            key={opt.id}
            className={optionClass(opt.id)}
            onClick={() => onSelectOption(q.id, opt.id)}
          >
            <span className="opt-badge">{opt.id.toUpperCase()}</span>
            <span style={{ flex: 1 }}>{opt.text}</span>
          </button>
        ))}
      </div>

      {answered && (
        <div
          className={`feedback-panel ${
            isUngrounded ? "is-warning" : correct ? "is-correct" : "is-incorrect"
          }`}
        >
          <div
            className={`feedback-title ${
              isUngrounded ? "is-warning" : correct ? "is-correct" : "is-incorrect"
            }`}
          >
            {isUngrounded
              ? "⚠️ Chưa xác minh nguồn"
              : correct
              ? "✓ Chính xác!"
              : "✕ Chưa chính xác!"}
          </div>
          <div className="feedback-body">{q.explanation}</div>
          {q.citation && (
            <div className="citation-block">
              <div className="citation-label">
                Trích dẫn nguyên văn · [{q.citation.chunkId}]
              </div>
              <div className="citation-quote">&quot;{q.citation.quote}&quot;</div>
            </div>
          )}
          <button
            className="report-btn"
            data-reported={isReported}
            disabled={isReported}
            onClick={() => onReport(q.id)}
          >
            {isReported ? "Đã gửi báo cáo cho giảng viên ✓" : "Báo lỗi câu hỏi này"}
          </button>
        </div>
      )}

      <div className="btn-row">
        <button className="btn btn-ghost" onClick={onPrev} disabled={currentIndex === 0}>
          ← Câu trước
        </button>
        <button
          className="btn btn-primary"
          onClick={onNext}
          disabled={!answered}
        >
          {currentIndex === total - 1 ? "Nộp bài" : "Tiếp theo →"}
        </button>
      </div>
    </div>
  );
}
