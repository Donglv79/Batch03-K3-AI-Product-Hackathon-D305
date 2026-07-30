"use client";

import { useState } from "react";
import {
  Difficulty,
  FeedbackEntry,
  Quiz,
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
  StudentSubmission,
  VLearnDay,
  VLearnDocument,
} from "@/lib/vlearnData";

import VLearnHeader from "./VLearnHeader";
import VLearnSidebar from "./VLearnSidebar";
import SlideViewer from "./SlideViewer";
import TeacherDashboard from "./TeacherDashboard";
import QuizScreen from "./QuizScreen";
import ResultScreen from "./ResultScreen";

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
  const [role2Documents, setRole2Documents] = useState<Record<string, Role2Document>>({});

  // Viewer State
  const [zoomLevel, setZoomLevel] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);

  // Quiz Engine State
  const [questionCount, setQuestionCount] = useState(DEFAULT_QUESTION_COUNT);
  const [difficulty, setDifficulty] = useState<"all" | Difficulty>(DEFAULT_DIFFICULTY);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [reported, setReported] = useState<Record<string, boolean>>({});
  const [feedbackLog, setFeedbackLog] = useState<FeedbackEntry[]>([]);
  const [feedbackFormOpen, setFeedbackFormOpen] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [sessionSubmissions, setSessionSubmissions] = useState<StudentSubmission[]>([]);

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
    const sourceDocument = selectedDocument ? role2Documents[selectedDocument.id] : null;
    setGenerationError(null);
    setActiveTab("quiz");

    if (!sourceDocument) {
      setQuiz(null);
      setGenerationError("Tài liệu này chưa được ingestion thành công. Hãy nạp lại PDF khi backend đang chạy.");
      return;
    }

    setIsGenerating(true);
    try {
      const role3Quiz = await generateRole3Quiz({
        document: sourceDocument,
        numQuestions: questionCount,
        difficulty,
      });
      if (role3Quiz.status === "rejected" || role3Quiz.questions.length === 0) {
        setQuiz(null);
        setGenerationError(
          role3Quiz.warnings.join(" ") || "Nguồn chưa đủ chắc chắn để tạo quiz có căn cứ."
        );
        return;
      }
      setQuiz(adaptGeneratedQuiz(role3Quiz, sourceDocument));
      setCurrentIndex(0);
      setAnswers({});
      setReported({});
      setFeedbackFormOpen(false);
      setIsSubmitted(false);
    } catch (err) {
      setQuiz(null);
      setGenerationError(err instanceof Error ? err.message : "Không thể gọi Quiz Engine.");
    } finally {
      setIsGenerating(false);
    }
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
      setRole2Documents((prev) => ({ ...prev, [realDoc!.document_id]: realDoc! }));
    } catch (err) {
      URL.revokeObjectURL(fileUrl);
      setGenerationError(err instanceof Error ? err.message : "Backend ingestion chưa sẵn sàng.");
      throw err;
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
    setGenerationError(null);
    setActiveTab("reader");
    if (autoGenerateQuizNow && realDoc) {
      setIsGenerating(true);
      try {
        const role3Quiz = await generateRole3Quiz({
          document: realDoc,
          numQuestions: questionCount,
          difficulty,
        });
        if (role3Quiz.status === "rejected" || role3Quiz.questions.length === 0) {
          setQuiz(null);
          setGenerationError(
            role3Quiz.warnings.join(" ") || "Nguồn chưa đủ chắc chắn để tạo quiz có căn cứ."
          );
          setActiveTab("quiz");
          return;
        }
        setQuiz(adaptGeneratedQuiz(role3Quiz, realDoc));
        setCurrentIndex(0);
        setAnswers({});
        setReported({});
        setFeedbackFormOpen(false);
        setIsSubmitted(false);
        setActiveTab("quiz");
      } catch (err) {
        setQuiz(null);
        setGenerationError(err instanceof Error ? err.message : "Không thể sinh quiz sau khi upload.");
        setActiveTab("quiz");
      } finally {
        setIsGenerating(false);
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
      recordCurrentSubmission();
      setIsSubmitted(true);
    }
  }

  function recordCurrentSubmission() {
    if (!quiz || activeAccount.role !== "student") return;
    const scored = quiz.questions.filter((question) => question.citation);
    const correctCount = scored.filter(
      (question) => answers[question.id] === question.correctOptionId
    ).length;
    const scorePct = scored.length ? Math.round((correctCount / scored.length) * 100) : 0;
    const weakTopics = Array.from(
      new Set(
        scored
          .filter((question) => answers[question.id] !== question.correctOptionId)
          .map((question) => question.topic)
      )
    );
    const submission: StudentSubmission = {
      id: `${activeAccount.id}-${Date.now()}`,
      studentName: activeAccount.name,
      studentCode: activeAccount.code,
      submittedAt: new Date().toLocaleString("vi-VN"),
      scorePct,
      correctCount,
      totalCount: scored.length,
      status: scorePct >= 80 ? "Excellence" : scorePct >= 50 ? "Good" : "Needs Review",
      weakTopics,
    };
    setSessionSubmissions((previous) => [submission, ...previous]);
  }

  function handlePrev() {
    setCurrentIndex((i) => Math.max(0, i - 1));
  }

  function handleRetake() {
    setCurrentIndex(0);
    setAnswers({});
    setReported({});
    setFeedbackFormOpen(false);
    setIsSubmitted(false);
  }

  function handleRetakeWrong(questionIds: string[]) {
    if (!quiz || questionIds.length === 0) return;
    const retryIds = new Set(questionIds);
    setQuiz({
      ...quiz,
      id: `${quiz.id}-retry-${Date.now()}`,
      title: `${quiz.title} · Luyện lại câu sai`,
      questions: quiz.questions.filter((question) => retryIds.has(question.id)),
    });
    setCurrentIndex(0);
    setAnswers({});
    setReported({});
    setIsSubmitted(false);
  }

  function handleOpenCitation(page: number) {
    setCurrentPage(Math.max(1, page));
    setActiveTab("reader");
  }

  function handleOpenQuizForReview() {
    if (!quiz) return;
    setCurrentIndex(0);
    setIsSubmitted(false);
    setActiveTab("quiz");
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
        zoomLevel={zoomLevel}
        onZoomChange={handleZoomChange}
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
          isGenerating={isGenerating}
          canGenerateQuiz={
            !!selectedDocument && !!role2Documents[selectedDocument.id]
          }
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
                uploadedRole2Doc={role2Documents[selectedDocument.id] || null}
                currentPage={currentPage}
                totalPages={selectedDocument.pages}
                zoomLevel={zoomLevel}
                toolMode="read"
                onPageChange={setCurrentPage}
                onOpenQuiz={handleGenerateQuiz}
              />
            ) : (
              <div className="empty-state-container">
                <div className="empty-state-card empty-state-onboarding">
                  <span className="empty-kicker">Bắt đầu trong 3 bước</span>
                  <h2>Chưa có tài liệu được chọn</h2>
                  <p>
                    {activeAccount.role === "teacher"
                      ? "Tải PDF có nội dung văn bản, chọn tài liệu, sau đó tạo quiz có trích dẫn."
                      : "Chọn một tài liệu ở danh sách bên trái để đọc và làm quiz."}
                  </p>
                  <ol className="onboarding-steps">
                    <li><span>1</span>Tải tài liệu PDF</li>
                    <li><span>2</span>Kiểm tra nội dung nguồn</li>
                    <li><span>3</span>Tạo và làm quiz</li>
                  </ol>
                </div>
              </div>
            )
          )}

          {/* TAB 2: Quiz AI Execution & Results */}
          {activeTab === "quiz" && (
            <div className="quiz-tab-wrapper">
              {isGenerating ? (
                <div className="empty-state-card status-state-card" aria-live="polite">
                  <span className="status-spinner" aria-hidden="true" />
                  <h2>Đang tạo quiz có căn cứ</h2>
                  <p>Hệ thống đang kiểm tra nguồn, sinh câu hỏi và xác minh từng trích dẫn.</p>
                </div>
              ) : generationError ? (
                <div className="empty-state-card status-state-card is-error">
                  <span className="status-symbol" aria-hidden="true">!</span>
                  <h2>Chưa thể tạo Quiz có căn cứ</h2>
                  <p>{generationError}</p>
                  <button className="btn btn-ghost" onClick={() => setActiveTab("reader")}>
                    Quay lại tài liệu
                  </button>
                </div>
              ) : !quiz ? (
                <div className="empty-state-card status-state-card">
                  <span className="status-symbol" aria-hidden="true">?</span>
                  <h2>Chưa có quiz</h2>
                  <p>Chọn tài liệu và thiết lập quiz ở thanh bên trái để bắt đầu.</p>
                </div>
              ) : isSubmitted ? (
                <ResultScreen
                  quiz={quiz}
                  answers={answers}
                  feedbackFormOpen={feedbackFormOpen}
                  feedbackLog={feedbackLog}
                  onRetake={handleRetake}
                  onRetakeWrong={handleRetakeWrong}
                  onOpenCitation={handleOpenCitation}
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
                  onOpenCitation={handleOpenCitation}
                />
              )}
            </div>
          )}

          {/* TAB 3: Teacher Dashboard (Chỉ Giảng viên mới mở được) */}
          {activeTab === "dashboard" && activeAccount.role === "teacher" && (
            <TeacherDashboard
              activeDocumentTitle={selectedDocument ? selectedDocument.title : "Tất cả bài giảng"}
              submissions={sessionSubmissions}
              onOpenQuizForReview={quiz ? handleOpenQuizForReview : undefined}
            />
          )}
        </main>
      </div>
    </div>
  );
}
