"use client";

import { useState } from "react";
import {
  Difficulty,
  FeedbackEntry,
  LECTURES,
  Quiz,
  buildQuiz,
} from "@/lib/mockQuiz";
import {
  adaptGeneratedQuiz,
  generateRole3Quiz,
  Role2Document,
  uploadRole2Document,
} from "@/lib/quizBridge";
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
  const [uploadBusy, setUploadBusy] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("Sẵn sàng nhận slide PDF.");
  const [uploadedDocument, setUploadedDocument] = useState<Role2Document | null>(null);
  const [activeFlow, setActiveFlow] = useState<"mock" | "uploaded">("mock");

  async function runGeneratedQuiz(document: Role2Document) {
    setUploadStatus("Đang gọi Gemini để sinh quiz...");
    const quizResponse = await generateRole3Quiz({
      document,
      numQuestions: questionCount,
      difficulty,
    });
    const built = adaptGeneratedQuiz(quizResponse, document);
    setQuiz(built);
    setCurrentIndex(0);
    setAnswers({});
    setReported({});
    setFeedbackFormOpen(false);
    setActiveFlow("uploaded");
    setScreen("quiz");
    setUploadStatus(`Đã tạo quiz từ ${document.document_id}.`);
  }

  async function handleGenerate() {
    if (uploadedDocument) {
      setUploadBusy(true);
      try {
        await runGeneratedQuiz(uploadedDocument);
      } catch (error) {
        setUploadStatus(error instanceof Error ? error.message : "Quiz generation failed");
      } finally {
        setUploadBusy(false);
      }
      return;
    }

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
    setActiveFlow("mock");
    setScreen("quiz");
  }

  async function handleUpload(payload: {
    files: File[];
    title: string;
    documentId: string;
    sourcePrefix: string;
  }) {
    setUploadBusy(true);
    setUploadStatus("Đang tải slide lên...");
    try {
      const document = await uploadRole2Document(payload);
      setUploadedDocument(document);
      setUploadStatus(`Đã nạp ${document.statistics.total_chunks} chunks, đang sinh quiz...`);
      await runGeneratedQuiz(document);
    } catch (error) {
      setUploadStatus(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploadBusy(false);
    }
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
    console.log("[validation-log]", full);
    setFeedbackFormOpen(false);
  }

  const selectedLecture = LECTURES.find((l) => l.id === selectedLectureId);
  const uploadSummary = uploadedDocument
    ? {
        documentId: uploadedDocument.document_id,
        title: uploadedDocument.title,
        chunkCount: uploadedDocument.statistics.total_chunks,
        totalCharacters: uploadedDocument.statistics.total_characters,
      }
    : null;

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
          uploadBusy={uploadBusy}
          uploadStatus={uploadStatus}
          uploadSummary={uploadSummary}
          onUpload={handleUpload}
        />

        <main className="main-panel">
          {uploadedDocument && (
            <div className="card upload-result-card">
              <div className="quiz-head">
                <span className="muted">Nguồn đã nạp</span>
                <span className="pill pill-outline">
                  {activeFlow === "uploaded" ? "Role 2 + 3" : "Role 2"}
                </span>
              </div>
              <h2>{uploadedDocument.title}</h2>
              <p className="muted">
                {uploadedDocument.document_id} · {uploadedDocument.original_filename} ·{" "}
                {uploadedDocument.statistics.total_chunks} chunks ·{" "}
                {uploadedDocument.statistics.total_characters} ký tự
              </p>
            </div>
          )}

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

