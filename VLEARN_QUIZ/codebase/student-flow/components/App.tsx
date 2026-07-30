"use client";

import { useState } from "react";
import {
  Difficulty,
  FeedbackEntry,
  LECTURES,
  Quiz,
  buildQuiz,
} from "@/lib/mockQuiz";
import Sidebar from "./Sidebar";
import QuizScreen from "./QuizScreen";
import ResultScreen from "./ResultScreen";
import UnavailableScreen from "./UnavailableScreen";

type Screen = "quiz" | "result" | "unavailable";

const DEFAULT_LECTURE_ID = "t04";
const DEFAULT_QUESTION_COUNT = 3;
const DEFAULT_DIFFICULTY: "all" | Difficulty = "all";

export default function App() {
  const [selectedLectureId, setSelectedLectureId] = useState(DEFAULT_LECTURE_ID);
  const [questionCount, setQuestionCount] = useState(DEFAULT_QUESTION_COUNT);
  const [difficulty, setDifficulty] = useState<"all" | Difficulty>(DEFAULT_DIFFICULTY);
  const [screen, setScreen] = useState<Screen>("quiz");
  const [quiz, setQuiz] = useState<Quiz | null>(() =>
    buildQuiz(DEFAULT_LECTURE_ID, DEFAULT_QUESTION_COUNT, DEFAULT_DIFFICULTY)
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [reported, setReported] = useState<Record<string, boolean>>({});
  const [feedbackLog, setFeedbackLog] = useState<FeedbackEntry[]>([]);
  const [feedbackFormOpen, setFeedbackFormOpen] = useState(false);

  function handleGenerate() {
    const built = buildQuiz(selectedLectureId, questionCount, difficulty);
    if (!built) {
      setScreen("unavailable");
      setQuiz(null);
      return;
    }
    setQuiz(built);
    setCurrentIndex(0);
    setAnswers({});
    setReported({});
    setFeedbackFormOpen(false);
    setScreen("quiz");
  }

  function handleSelectOption(questionId: string, optionId: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  }

  function handleNext() {
    if (!quiz) return;
    if (currentIndex < quiz.questions.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      setScreen("result");
    }
  }

  function handlePrev() {
    setCurrentIndex((i) => Math.max(0, i - 1));
  }

  function handleRetake() {
    setCurrentIndex(0);
    setAnswers({});
    setReported({});
    setFeedbackFormOpen(false);
    setScreen("quiz");
  }

  function handleReport(questionId: string) {
    setReported((prev) => ({ ...prev, [questionId]: true }));
  }

  function handleToggleFeedbackForm() {
    setFeedbackFormOpen((v) => !v);
  }

  function handleSubmitFeedback(entry: { who: string; role: string; comment: string }) {
    const full: FeedbackEntry = { ...entry, ts: new Date().toLocaleString("vi-VN") };
    setFeedbackLog((prev) => [full, ...prev]);
    // Ghi ra console theo đúng cột scaffold validation/ log (guide §4.2) để copy thủ công.
    console.log("[validation-log]", full);
    setFeedbackFormOpen(false);
  }

  const selectedLecture = LECTURES.find((l) => l.id === selectedLectureId);

  return (
    <>
      <div className="topbar">
        <div className="brand">
          <div className="brand-icon">🎓</div>
          <div>
            <div className="brand-name">
              VLearn <span>Quiz AI</span>
            </div>
            <span className="pill pill-muted">CP3 Prototype Working</span>
          </div>
        </div>
        <div className="topbar-right">
          <span className="pill pill-outline">🔑 API: Sẵn sàng (Mock/Gemini)</span>
          <span className="pill pill-outline">🤖 Học viên AI Thực Chiến</span>
        </div>
      </div>

      <div className="layout">
        <Sidebar
          selectedLectureId={selectedLectureId}
          onSelectLecture={setSelectedLectureId}
          questionCount={questionCount}
          onQuestionCountChange={setQuestionCount}
          difficulty={difficulty}
          onDifficultyChange={(d) => setDifficulty(d as "all" | Difficulty)}
          onGenerate={handleGenerate}
        />

        <main className="main-panel">
          {screen === "unavailable" && (
            <UnavailableScreen lectureTitle={selectedLecture ? selectedLecture.title : ""} />
          )}
          {screen === "quiz" && quiz && (
            <QuizScreen
              quiz={quiz}
              currentIndex={currentIndex}
              answers={answers}
              reported={reported}
              onSelectOption={handleSelectOption}
              onReport={handleReport}
              onNext={handleNext}
              onPrev={handlePrev}
            />
          )}
          {screen === "result" && quiz && (
            <ResultScreen
              quiz={quiz}
              answers={answers}
              feedbackFormOpen={feedbackFormOpen}
              feedbackLog={feedbackLog}
              onRetake={handleRetake}
              onToggleFeedbackForm={handleToggleFeedbackForm}
              onSubmitFeedback={handleSubmitFeedback}
            />
          )}
        </main>
      </div>
    </>
  );
}
