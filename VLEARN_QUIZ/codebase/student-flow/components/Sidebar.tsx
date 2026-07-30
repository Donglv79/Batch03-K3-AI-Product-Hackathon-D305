import { DIFFICULTY_OPTIONS, LECTURES, QUESTION_COUNT_OPTIONS } from "@/lib/mockQuiz";
import UploadSlidePanel from "./UploadSlidePanel";

type Props = {
  selectedLectureId: string;
  onSelectLecture: (id: string) => void;
  questionCount: number;
  onQuestionCountChange: (n: number) => void;
  difficulty: string;
  onDifficultyChange: (d: string) => void;
  onGenerate: () => void;
};

export default function Sidebar({
  selectedLectureId,
  onSelectLecture,
  questionCount,
  onQuestionCountChange,
  difficulty,
  onDifficultyChange,
  onGenerate,
}: Props) {
  return (
    <aside className="sidebar">
      <UploadSlidePanel />

      <div className="sidebar-section">
        <div className="sidebar-title">📖 CHỌN BÀI GIẢNG ĐÃ HỌC</div>
        {LECTURES.map((l) => {
          const selected = l.id === selectedLectureId;
          const unavailable = !l.quizId;
          const classes = [
            "lecture-card",
            selected ? "selected" : "",
            unavailable ? "unavailable" : "",
          ]
            .filter(Boolean)
            .join(" ");
          return (
            <button key={l.id} className={classes} onClick={() => onSelectLecture(l.id)}>
              <div className="day-tag">{l.dayTag}</div>
              <div className="lecture-title">{l.title}</div>
              <div className="lecture-meta">
                📄 {l.transcriptLabel} · {l.chunkCount} mã đoạn
                {unavailable ? " · chưa có quiz" : ""}
              </div>
            </button>
          );
        })}
      </div>

      <div className="sidebar-section">
        <div className="sidebar-title">⚙️ TÙY CHỌN QUIZ AI</div>
        <div className="field">
          <label>Số lượng câu hỏi:</label>
          <select
            value={questionCount}
            onChange={(e) => onQuestionCountChange(Number(e.target.value))}
          >
            {QUESTION_COUNT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Độ khó:</label>
          <select value={difficulty} onChange={(e) => onDifficultyChange(e.target.value)}>
            {DIFFICULTY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <button className="btn btn-primary" onClick={onGenerate}>
          🪄 AI Sinh Quiz Ngay
        </button>
      </div>
    </aside>
  );
}
