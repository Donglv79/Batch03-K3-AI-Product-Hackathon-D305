"use client";

import { useEffect, useRef, useState } from "react";
import {
  Difficulty,
  FeedbackEntry,
  Quiz,
  buildQuiz,
} from "@/lib/mockQuiz";
import {
  adaptGeneratedQuiz,
  fetchLibrary,
  fetchQuizAttempts,
  fetchSavedQuiz,
  generateRole3Quiz,
  Role2Document,
  QuizAttemptRecord,
  saveQuizAttempt,
  uploadRole2Document,
} from "@/lib/quizBridge";
import {
  UserAccount,
  USER_ACCOUNTS,
  VLearnDay,
  VLearnDocument,
} from "@/lib/vlearnData";
import { ungroundedIdsFor } from "@/lib/mockQuiz";

import LoginScreen from "./LoginScreen";
import VLearnHeader from "./VLearnHeader";
import VLearnSidebar from "./VLearnSidebar";
import SlideViewer from "./SlideViewer";
import TeacherDashboard from "./TeacherDashboard";
import QuizScreen from "./QuizScreen";
import ResultScreen from "./ResultScreen";

const DEFAULT_LECTURE_ID = "t04";
const DEFAULT_QUESTION_COUNT = 15;
const DEFAULT_DIFFICULTY: "all" | Difficulty = "all";
const AUTH_STORAGE_KEY = "vlearn.activeAccountId";

export default function App() {
  // Account & Role State
  const [activeAccount, setActiveAccount] = useState<UserAccount | null>(null);
  const [activeTab, setActiveTab] = useState<"reader" | "quiz" | "dashboard">("reader");

  // Dynamic Curriculum State
  const [curriculumList, setCurriculumList] = useState<VLearnDay[]>([]);

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
  const savedAttemptsRef = useRef<Record<string, boolean>>({});
  const [studentQuizAttempt, setStudentQuizAttempt] = useState<QuizAttemptRecord | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null);


  // Switch Account Handler
  function handleSwitchAccount(acc: UserAccount) {
    setActiveAccount(acc);
    if (acc.role === "teacher" && activeTab === "reader") {
      setActiveTab("dashboard");
    } else if (acc.role === "student" && activeTab === "dashboard") {
      setActiveTab("reader");
    }
  }

  function handleLogin(acc: UserAccount) {
    window.localStorage.setItem(AUTH_STORAGE_KEY, acc.id);
    handleSwitchAccount(acc);
  }

  function handleLogout() {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    setActiveAccount(null);
    setActiveTab("reader");
    setSelectedDocument(null);
    setUploadedRole2Doc(null);
    setQuiz(null);
    setCurrentIndex(0);
    setAnswers({});
    setReported({});
    setFeedbackFormOpen(false);
    setStudentQuizAttempt(null);
  }

  async function refreshLibrary() {
    try {
      const items = await fetchLibrary();
      setCurriculumList(items);
      if (selectedDocument) {
        let foundDoc = null;
        for (const day of items) {
          for (const doc of day.documents) {
            if (doc.id === selectedDocument.id) {
              foundDoc = doc;
              break;
            }
          }
          if (foundDoc) break;
        }
        if (foundDoc) {
          setSelectedDocument(foundDoc);
        }
      } else {
        const firstDoc = items[0]?.documents?.[0];
        if (firstDoc) {
          setSelectedDocument(firstDoc);
        }
      }
    } catch (err) {
      console.warn("Không tải được thư viện bài học đã lưu.", err);
    }
  }

  useEffect(() => {
    if (activeAccount) {
      void refreshLibrary();
    }
  }, [activeAccount]);

  useEffect(() => {
    const savedAccountId = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!savedAccountId) return;
    const account = USER_ACCOUNTS.find((item) => item.id === savedAccountId);
    if (account) {
      setActiveAccount(account);
      setActiveTab(account.role === "teacher" ? "dashboard" : "reader");
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadStudentAttempt() {
      if (activeAccount?.role !== "student" || !selectedDocument?.quizAvailable) {
        setStudentQuizAttempt(null);
        return;
      }
      try {
        const attempts = await fetchQuizAttempts(selectedDocument.id);
        const currentAttempt = attempts.find((attempt) => attempt.student_code === activeAccount.code) || null;
        if (!cancelled) {
          setStudentQuizAttempt(currentAttempt);
        }
      } catch (err) {
        console.warn("Không tải được lịch sử làm quiz của sinh viên.", err);
        if (!cancelled) {
          setStudentQuizAttempt(null);
        }
      }
    }
    void loadStudentAttempt();
    return () => {
      cancelled = true;
    };
  }, [activeAccount?.code, activeAccount?.role, selectedDocument?.id, selectedDocument?.quizAvailable]);

  // Auto-launch quiz when switching to quiz tab if available
  useEffect(() => {
    if (activeTab === "quiz" && !quiz && selectedDocument?.quizAvailable) {
      void handleGenerateQuiz();
    }
  }, [activeTab, quiz, selectedDocument]);

  // Document Selection Handler
  function handleSelectDocument(doc: VLearnDocument, dayTag: string) {
    setSelectedDocument(doc);
    setCurrentPage(1);
    setQuiz(null);
    setCurrentIndex(0);
    setAnswers({});
    setReported({});
    setFeedbackFormOpen(false);
  }

  // Quiz Generation Handler (Gọi Gemini sinh Quiz trực tiếp từ văn bản slide nạp thật)
  async function handleGenerateQuiz() {
    const isTeacher = activeAccount?.role === "teacher";

    if (!isTeacher && selectedDocument?.quizAvailable) {
      setLoadingMessage("Đang tải dữ liệu bài học...");
      try {
        const savedQuiz = await fetchSavedQuiz(selectedDocument.id);
        if (savedQuiz) {
          const fallbackDoc: Role2Document = uploadedRole2Doc || {
            schema_version: "1.0",
            document_id: selectedDocument.id,
            title: selectedDocument.title,
            source_type: "pdf",
            original_filename: selectedDocument.filename,
            status: "ready",
            created_at: new Date().toISOString(),
            statistics: {
              total_chunks: selectedDocument.pages,
              total_characters: 0,
            },
            chunks: [],
          };
          const adapted = adaptGeneratedQuiz(savedQuiz, fallbackDoc);
          
          setQuiz(adapted);
          setCurrentIndex(0);
          setAnswers({});
          setReported({});
          setFeedbackFormOpen(false);
          setActiveTab("quiz");
          return;
        }
      } catch (err) {
        console.warn("Không tải được quiz đã lưu, sẽ sinh quiz mới.", err);
      } finally {
        setLoadingMessage(null);
      }
    }

    if (!isTeacher) {
      window.alert("Quiz cho bài học này chưa được giảng viên xuất bản.");
      return;
    }

    const documentForQuiz: Role2Document | null =
      uploadedRole2Doc ||
      (selectedDocument?.chunks?.length
        ? {
            schema_version: "1.0",
            document_id: selectedDocument.id,
            title: selectedDocument.title,
            source_type: "pdf",
            original_filename: selectedDocument.filename,
            status: "ready",
            created_at: selectedDocument.uploadedAt || new Date().toISOString(),
            statistics: {
              total_chunks: selectedDocument.chunks.length,
              total_characters: selectedDocument.chunks.reduce((sum, chunk) => sum + chunk.text.length, 0),
            },
            chunks: selectedDocument.chunks,
            file_url: selectedDocument.fileUrl,
          }
        : null);

    if (documentForQuiz) {
      setLoadingMessage("Đang phân tích bài giảng & sinh câu hỏi bằng AI...");
      try {
        const role3Quiz = await generateRole3Quiz({
          document: documentForQuiz,
          numQuestions: questionCount,
          difficulty,
        });
        await refreshLibrary();

        window.alert(`🎉 Đã tạo bản nháp Quiz AI cho bài giảng [${selectedDocument?.title}]. Vào Dashboard để duyệt và xuất bản.`);
        return;
      } catch (err) {
        console.warn("Chưa gọi được Backend Gemini real-time, chuyển sang bộ sinh Quiz mẫu.", err);
      } finally {
        setLoadingMessage(null);
      }
    }

    if (!isTeacher) {
      window.alert("Quiz cho bài học này chưa được xuất bản.");
      return;
    }

    setLoadingMessage("Đang tạo bản nháp câu hỏi mẫu...");
    await new Promise((resolve) => setTimeout(resolve, 800));
    setLoadingMessage(null);

    const built = buildQuiz(selectedLectureId, questionCount, difficulty);
    if (!built) {
      window.alert("Chưa có bộ câu hỏi mẫu cho bài học này. Vui lòng thử lại sau khi backend tạo quiz hoàn tất.");
      return;
    }
    
    window.alert(`🎉 [Hệ thống mẫu] Đã tạo bản nháp quiz cho [${selectedDocument?.title}].`);
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

    setLoadingMessage("Đang nạp slide & trích xuất văn bản...");
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
    } finally {
      setLoadingMessage(null);
    }

    // Refresh library from backend and find the newly uploaded document
    setLoadingMessage("Đang cập nhật thư viện bài giảng...");
    try {
      const items = await fetchLibrary();
      setCurriculumList(items);
      const uploadedDocId = realDoc ? realDoc.document_id : docId;
      let foundDoc: VLearnDocument | null = null;
      for (const day of items) {
        for (const doc of day.documents) {
          if (doc.id === uploadedDocId) {
            foundDoc = doc;
            break;
          }
        }
        if (foundDoc) break;
      }
      if (foundDoc) {
        setSelectedDocument(foundDoc);
      }
    } catch (err) {
      console.warn("Không tải được thư viện sau upload.", err);
    } finally {
      setLoadingMessage(null);
    }

    setCurrentPage(1);
    setActiveTab("reader");

    if (autoGenerateQuizNow && realDoc) {
      setLoadingMessage("Đang phân tích bài giảng & sinh câu hỏi bằng AI...");
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
      } finally {
        setLoadingMessage(null);
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
    if (quiz) {
      delete savedAttemptsRef.current[quiz.id];
    }
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

  function handleOpenSourceSlide(chunkId: string) {
    const match = chunkId.match(/(\d+)/);
    const pageNum = match ? Number(match[1]) : 1;
    setActiveTab("reader");
    setCurrentPage(pageNum);
    window.setTimeout(() => {
      const target = document.getElementById(`slide-page-${pageNum}`);
      target?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  }

  useEffect(() => {
    if (activeAccount?.role !== "student" || !quiz || !selectedDocument) return;
    const completed =
      Object.keys(answers).length === quiz.questions.length &&
      currentIndex === quiz.questions.length - 1;
    if (!completed || savedAttemptsRef.current[quiz.id]) return;

    const ungroundedIds = ungroundedIdsFor(quiz);
    const scored = quiz.questions.filter((q) => !ungroundedIds.includes(q.id));
    const correctCount = scored.filter((q) => answers[q.id] === q.correctOptionId).length;
    const scorePct = scored.length ? Math.round((correctCount / scored.length) * 100) : 0;
    const weakTopics = scored
      .filter((q) => answers[q.id] !== q.correctOptionId)
      .map((q) => q.topic)
      .filter(Boolean);
    const attemptId = `${quiz.id}:${activeAccount.code}`;

    savedAttemptsRef.current[quiz.id] = true;
    void saveQuizAttempt({
      attempt_id: attemptId,
      document_id: selectedDocument.id,
      quiz_id: quiz.id,
      student_name: activeAccount.name,
      student_code: activeAccount.code,
      score_pct: scorePct,
      correct_count: correctCount,
      total_count: scored.length,
      answers,
      weak_topics: weakTopics,
      submitted_at: new Date().toISOString(),
    })
      .then((saved) => {
        setStudentQuizAttempt(saved);
      })
      .catch((err) => {
        console.warn("Cannot save quiz attempt.", err);
        delete savedAttemptsRef.current[quiz.id];
      });
  }, [activeAccount, quiz, answers, currentIndex, selectedDocument]);

  return (
    <div className="vlearn-app-wrapper">
      {!activeAccount ? (
        <LoginScreen onLogin={handleLogin} />
      ) : (
        <>
      {/* 1. Topbar Header Chuẩn VLearn */}
      <VLearnHeader
        currentDocumentTitle={selectedDocument ? selectedDocument.title : "Chưa chọn tài liệu"}
        activeAccount={activeAccount}
        onLogout={handleLogout}
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
                questionCount={questionCount}
                onQuestionCountChange={setQuestionCount}
                difficulty={difficulty}
                onDifficultyChange={setDifficulty}
                activeRole={activeAccount.role}
                onOpenDashboard={() => setActiveTab("dashboard")}
                hasCompletedQuiz={!!studentQuizAttempt}
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
                  <button type="button" className="btn-empty-refresh" onClick={() => void refreshLibrary()}>
                    Tải lại thư viện bài giảng
                  </button>
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
                  <button type="button" className="btn-empty-refresh" onClick={() => void refreshLibrary()}>
                    Kiểm tra bài giảng mới
                  </button>
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
                  onOpenSourceSlide={handleOpenSourceSlide}
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
            <TeacherDashboard
              activeDocumentTitle={selectedDocument ? selectedDocument.title : "Tất cả bài giảng"}
              curriculumList={curriculumList}
              selectedDocument={selectedDocument}
              onRefreshLibrary={refreshLibrary}
              onOpenDocument={(doc) => {
                handleSelectDocument(doc, "");
                setActiveTab("reader");
              }}
            />
          )}
        </main>
      </div>
        </>
      )}
      {loadingMessage && (
        <div className="vlearn-loading-overlay">
          <div className="vlearn-loading-card">
            <div className="vlearn-loader-container">
              <div className="vlearn-loader-ring"></div>
              <div className="vlearn-loader-ring-glow"></div>
              <span className="vlearn-loader-icon">🪄</span>
            </div>
            <h3 className="vlearn-loading-title">{loadingMessage}</h3>
            <p className="vlearn-loading-desc">
              Quá trình này có thể mất từ 10-30 giây tùy thuộc vào dung lượng bài giảng. Vui lòng giữ cửa sổ trình duyệt mở.
            </p>
            <div className="vlearn-progress-track">
              <div className="vlearn-progress-bar"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
