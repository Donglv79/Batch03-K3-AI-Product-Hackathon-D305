"use client";

import { useState } from "react";
import {
  Difficulty,
  FeedbackEntry,
  Quiz,
  buildQuiz,
} from "@/lib/mockQuiz";
import {
  adaptGeneratedQuiz,
  generateRole3Quiz,
  Role2Document,
  uploadRole2Document,
} from "@/lib/quizBridge";
import {
  USER_ACCOUNTS,
  UserAccount,
  VLEARN_CURRICULUM,
  VLearnDay,
  VLearnDocument,
} from "@/lib/vlearnData";

import VLearnHeader from "./VLearnHeader";
import VLearnSidebar from "./VLearnSidebar";
import SlideViewer from "./SlideViewer";
import TeacherDashboard from "./TeacherDashboard";
import QuizScreen from "./QuizScreen";
import ResultScreen from "./ResultScreen";

const DEFAULT_LECTURE_ID = "t04";
const DEFAULT_QUESTION_COUNT = 3;
const DEFAULT_DIFFICULTY: "all" | Difficulty = "all";

export default function App() {
  // Account & Role State
  const [activeAccount, setActiveAccount] = useState<UserAccount>(USER_ACCOUNTS[0]);
  const [activeTab, setActiveTab] = useState<"reader" | "quiz" | "dashboard">("reader");

  // Dynamic Curriculum State
  const [curriculumList, setCurriculumList] = useState<VLearnDay[]>(VLEARN_CURRICULUM);

  // Document & Sidebar State
  const [selectedDocument, setSelectedDocument] = useState<VLearnDocument | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Real Ingestion Data State
  const [uploadedRole2Doc, setUploadedRole2Doc] = useState<Role2Document | null>(null);

  // Viewer State
  const [toolMode, setToolMode] = useState<"read" | "pen" | "highlight">("read");
  const [zoomLevel, setZoomLevel] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);

  // Quiz Engine State
  const [selectedLectureId, setSelectedLectureId] = useState(DEFAULT_LECTURE_ID);
  const [questionCount, setQuestionCount] = useState(DEFAULT_QUESTION_COUNT);
  const [difficulty, setDifficulty] = useState<"all" | Difficulty>(DEFAULT_DIFFICULTY);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [reported, setReported] = useState<Record<string, boolean>>({});
  const [feedbackLog, setFeedbackLog] = useState<FeedbackEntry[]>([]);
  const [feedbackFormOpen, setFeedbackFormOpen] = useState(false);

  // Switch Account Handler
  function handleSwitchAccount(acc: UserAccount) {
    setActiveAccount(acc);
    if (acc.role === "student" && activeTab === "dashboard") {
      setActiveTab("reader");
    }
  }

  // Document Selection Handler
  function handleSelectDocument(doc: VLearnDocument, dayTag: string) {
    setSelectedDocument(doc);
    setCurrentPage(1);
  }

  // Quiz Generation Handler (Gọi Gemini sinh Quiz trực tiếp từ văn bản slide nạp thật)
  async function handleGenerateQuiz() {
    if (uploadedRole2Doc) {
      try {
        const role3Quiz = await generateRole3Quiz({
          document: uploadedRole2Doc,
          numQuestions: questionCount,
          difficulty,
        });
        const adapted = adaptGeneratedQuiz(role3Quiz, uploadedRole2Doc);
        setQuiz(adapted);
        setCurrentIndex(0);
        setAnswers({});
        setReported({});
        setFeedbackFormOpen(false);
        setActiveTab("quiz");
        return;
      } catch (err) {
        console.warn("Chưa gọi được Backend Gemini real-time, chuyển sang bộ sinh Quiz mẫu.", err);
      }
    }

    const built = buildQuiz(selectedLectureId, questionCount, difficulty);
    setQuiz(built);
    setCurrentIndex(0);
    setAnswers({});
    setReported({});
    setFeedbackFormOpen(false);
    setActiveTab("quiz");
  }

  // Upload & Process Ingestion Slide Handler
  async function handleUploadSlidePayload({
    file,
    lessonTitle,
    hasExplanation,
    autoGenerateQuizNow,
  }: {
    file: File;
    lessonTitle: string;
    hasExplanation: boolean;
    autoGenerateQuizNow: boolean;
  }) {
    const docId = `DOC_${Date.now()}`;
    let realDoc: Role2Document | null = null;
    const fileUrl = URL.createObjectURL(file);

    try {
      realDoc = await uploadRole2Document({
        files: [file],
        title: lessonTitle,
        documentId: docId,
        sourcePrefix: "SLIDE",
      });
      setUploadedRole2Doc(realDoc);
    } catch (err) {
      console.warn("Backend server chưa khởi chạy API, thực hiện Client-side Ingestion.", err);
    }

    const sourceIds = realDoc
      ? new Set(realDoc.chunks.map((chunk) => chunk.parent_source_id || chunk.source_id))
      : null;
    const totalPages = sourceIds && sourceIds.size > 0 ? sourceIds.size : 1;
    const dayIndex = curriculumList.length + 1;
    const newDocId = realDoc ? realDoc.document_id : docId;

    const newDoc: VLearnDocument = {
      id: newDocId,
      title: lessonTitle,
      pages: totalPages,
      status: "STUDYING",
      filename: file.name,
      fileUrl,
      fileType: file.type,
      hasExplanation,
      uploadedAt: new Date().toLocaleString("vi-VN"),
    };

    const newDayId = `day-${Date.now()}`;
    const newDay: VLearnDay = {
      id: newDayId,
      dayTag: `Bài ${dayIndex}`,
      title: lessonTitle,
      documents: [newDoc],
    };

    setCurriculumList((prev) => [...prev, newDay]);
    setSelectedDocument(newDoc);
    setCurrentPage(1);
    setActiveTab("reader");
    if (autoGenerateQuizNow && realDoc) {
      try {
        const role3Quiz = await generateRole3Quiz({
          document: realDoc,
          numQuestions: questionCount,
          difficulty,
        });
        setQuiz(adaptGeneratedQuiz(role3Quiz, realDoc));
        setCurrentIndex(0);
        setAnswers({});
        setReported({});
        setFeedbackFormOpen(false);
        setActiveTab("quiz");
      } catch (err) {
        console.warn("Không thể sinh quiz tự động ngay sau upload.", err);
      }
    }
  }

  // Zoom Handler
  function handleZoomChange(delta: number) {
    setZoomLevel((prev) => Math.min(150, Math.max(70, prev + delta)));
  }

  function handleSelectOption(questionId: string, optionId: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  }

  function handleNext() {
    if (!quiz) return;
    if (currentIndex < quiz.questions.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      setActiveTab("quiz");
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
    setFeedbackFormOpen(false);
  }

  return (
    <div className="vlearn-app-wrapper">
      {/* 1. Topbar Header Chuẩn VLearn */}
      <VLearnHeader
        currentDocumentTitle={selectedDocument ? selectedDocument.title : "Chưa chọn tài liệu"}
        activeAccount={activeAccount}
        onSwitchAccount={handleSwitchAccount}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        toolMode={toolMode}
        onToolModeChange={setToolMode}
        zoomLevel={zoomLevel}
        onZoomChange={handleZoomChange}
        currentPage={currentPage}
        totalPages={selectedDocument ? selectedDocument.pages : 1}
        onPageChange={setCurrentPage}
      />

      {/* 2. Body Main Layout */}
      <div className="vlearn-main-layout">
        {/* Sidebar Accordion Bên Trái */}
        <VLearnSidebar
          activeRole={activeAccount.role}
          selectedDocument={selectedDocument}
          onSelectDocument={handleSelectDocument}
          questionCount={questionCount}
          onQuestionCountChange={setQuestionCount}
          difficulty={difficulty}
          onDifficultyChange={(d) => setDifficulty(d)}
          onGenerateQuiz={handleGenerateQuiz}
          onUploadSlide={handleUploadSlidePayload}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
          curriculumList={curriculumList}
        />

        {/* Dynamic Center Panel */}
        <main className="vlearn-center-content">
          {/* TAB 1: Slide Reader Viewer */}
          {activeTab === "reader" && (
            selectedDocument ? (
              <SlideViewer
                document={selectedDocument}
                uploadedRole2Doc={uploadedRole2Doc}
                currentPage={currentPage}
                totalPages={selectedDocument.pages}
                zoomLevel={zoomLevel}
                toolMode={toolMode}
                onPageChange={setCurrentPage}
                onOpenQuiz={handleGenerateQuiz}
              />
            ) : (
              <div className="empty-state-container">
                <div className="empty-state-card">
                  <span className="empty-icon">📤</span>
                  <h2>Chưa Có Bài Giảng Nào Được Nạp</h2>
                  <p>
                    {activeAccount.role === "teacher"
                      ? "Vui lòng bấm vào nút 'Nạp Slide Giảng Dạy' ở cột bên trái để tải lên slide PDF/PPTX đầu tiên của bạn."
                      : "Vui lòng chuyển sang tài khoản Giảng viên để nạp bài giảng mới vào hệ thống VLearn."}
                  </p>
                </div>
              </div>
            )
          )}

          {/* TAB 2: Quiz AI Execution & Results */}
          {activeTab === "quiz" && (
            <div className="quiz-tab-wrapper">
              {!quiz ? (
                <div className="empty-state-card">
                  <span className="empty-icon">🪄</span>
                  <h2>Chưa Có Bài Quiz Nào Được Khởi Tạo</h2>
                  <p>Vui lòng nạp slide bài giảng và bấm nút 'Tạo Bài Quiz Từ Slide Này' để bắt đầu làm bài.</p>
                </div>
              ) : Object.keys(answers).length === quiz.questions.length && currentIndex === quiz.questions.length - 1 ? (
                <ResultScreen
                  quiz={quiz}
                  answers={answers}
                  feedbackFormOpen={feedbackFormOpen}
                  feedbackLog={feedbackLog}
                  onRetake={handleRetake}
                  onToggleFeedbackForm={handleToggleFeedbackForm}
                  onSubmitFeedback={handleSubmitFeedback}
                />
              ) : (
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
            </div>
          )}

          {/* TAB 3: Teacher Dashboard (Chỉ Giảng viên mới mở được) */}
          {activeTab === "dashboard" && activeAccount.role === "teacher" && (
            <TeacherDashboard activeDocumentTitle={selectedDocument ? selectedDocument.title : "Tất cả bài giảng"} />
          )}
        </main>
      </div>
    </div>
  );
}
