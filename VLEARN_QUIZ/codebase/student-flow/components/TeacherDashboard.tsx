"use client";

import { useEffect, useState, useMemo } from "react";
import { DIFFICULTY_LABEL, Quiz } from "@/lib/mockQuiz";
import {
  adaptGeneratedQuiz,
  fetchQuizAttempts,
  fetchSavedQuiz,
  publishSavedQuiz,
  Role2Document,
  Role3Quiz,
  saveQuizDraft,
  saveQuizReview,
  QuizAttemptRecord,
} from "@/lib/quizBridge";
import { StudentSubmission, VLearnDay, VLearnDocument } from "@/lib/vlearnData";

type Props = {
  activeDocumentTitle: string;
  curriculumList: VLearnDay[];
  selectedDocument: VLearnDocument | null;
  onOpenDocument?: (doc: VLearnDocument) => void;
  onRefreshLibrary?: () => Promise<void> | void;
};

export default function TeacherDashboard({
  activeDocumentTitle,
  curriculumList,
  selectedDocument,
  onOpenDocument,
  onRefreshLibrary,
}: Props) {
  const [submissions, setSubmissions] = useState<StudentSubmission[]>([]);
  const [rawAttempts, setRawAttempts] = useState<QuizAttemptRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "Excellence" | "Good" | "Needs Review">("ALL");
  const [selectedSub, setSelectedSub] = useState<StudentSubmission | null>(null);
  const [reviewDoc, setReviewDoc] = useState<VLearnDocument | null>(null);
  const [reviewQuizRecord, setReviewQuizRecord] = useState<Role3Quiz | null>(null);
  const [reviewQuiz, setReviewQuiz] = useState<Quiz | null>(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewEditMode, setReviewEditMode] = useState(false);
  const [lessonFilterId, setLessonFilterId] = useState<string>("ALL");

  // Evaluation Form State
  const [teacherComment, setTeacherComment] = useState("");
  const [evalStatus, setEvalStatus] = useState<"Excellence" | "Good" | "Needs Review">("Good");
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);


  // Dynamic Metrics
  const filteredSubmissions = submissions.filter((sub) => {
    const matchSearch =
      sub.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.studentCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === "ALL" || sub.status === statusFilter;
    const matchLesson = lessonFilterId === "ALL" || sub.documentId === lessonFilterId;
    return matchSearch && matchStatus && matchLesson;
  });

  const allDocuments = curriculumList.flatMap((day) => day.documents);
  const selectedLessonDoc =
    allDocuments.find((doc) => doc.id === lessonFilterId) ||
    selectedDocument ||
    allDocuments.find((doc) => doc.quizStatus || doc.quizAvailable) ||
    allDocuments[0] ||
    null;
  const selectedLessonAttempts = selectedLessonDoc
    ? submissions.filter((sub) => sub.documentId === selectedLessonDoc.id)
    : submissions;
  const lessonAnalytics = allDocuments.map((doc) => {
    const docAttempts = submissions.filter((sub) => sub.documentId === doc.id);
    const avgDocScore =
      docAttempts.length > 0
        ? Math.round(docAttempts.reduce((sum, sub) => sum + sub.scorePct, 0) / docAttempts.length)
        : 0;
    const weakTopicCount = new Map<string, number>();
    docAttempts.forEach((sub) => {
      sub.weakTopics.forEach((topic) => {
        weakTopicCount.set(topic, (weakTopicCount.get(topic) || 0) + 1);
      });
    });
    const topWeakTopics = Array.from(weakTopicCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([topic]) => topic);
    return {
      doc,
      attempts: docAttempts.length,
      avgScore: avgDocScore,
      needsReview: docAttempts.filter((sub) => sub.status === "Needs Review").length,
      topWeakTopics,
      hasQuiz: !!doc.quizAvailable || doc.quizStatus === "published" || doc.quizStatus === "draft",
    };
  });
  const lessonFocus = lessonAnalytics.find((item) => item.doc.id === selectedLessonDoc?.id) || null;

  const totalLessons = curriculumList.length;
  const lessonsWithQuiz = curriculumList.filter((day) =>
    day.documents.some((doc) => doc.quizAvailable)
  ).length;
  const completedCount = submissions.length;
  const avgScore =
    completedCount > 0
      ? Math.round(submissions.reduce((acc, curr) => acc + curr.scorePct, 0) / completedCount)
      : 0;
  const needsReviewCount = submissions.filter((s) => s.status === "Needs Review").length;

  // Open Evaluation Modal
  function handleOpenEvalModal(sub: StudentSubmission) {
    setSelectedSub(sub);
    setTeacherComment(sub.teacherComment || "");
    setEvalStatus(sub.status);
  }

  // Save Teacher Evaluation
  function handleSaveEvaluation(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSub) return;

    const nowStr = new Date().toLocaleString("vi-VN");
    void saveQuizReview({
      attempt_id: selectedSub.attemptId || selectedSub.id,
      document_id: selectedSub.documentId || selectedDocument?.id || "",
      teacher_comment: teacherComment.trim(),
      status: evalStatus,
      reviewed_by: "TS. Nguyễn Hoàng (Giảng viên VinUni)",
    })
      .then(() => loadAttempts())
      .then(() => {
        triggerToast(`Đã lưu đánh giá cho sinh viên ${selectedSub.studentName} ✓`);
        setSelectedSub(null);
      })
      .catch((err) => {
        console.warn("Không lưu được đánh giá.", err);
        triggerToast("Không lưu được đánh giá, thử lại sau.");
      });
  }

  // Export CSV Gradebook
  function handleExportExcel() {
    if (submissions.length === 0) {
      triggerToast("Chưa có dữ liệu bài làm để xuất!");
      return;
    }
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
    csvContent += "STT,Họ và Tên,Mã SV,Thời Gian Nộp,Số Câu Đúng,Tỷ Lệ (%),Trạng Thái,Lỗ Hổng Kiến Thức,Nhận Xét Giảng Viên\n";

    submissions.forEach((s, index) => {
      const row = [
        index + 1,
        `"${s.studentName}"`,
        `"${s.studentCode}"`,
        `"${s.submittedAt}"`,
        `"${s.correctCount}/${s.totalCount}"`,
        `${s.scorePct}%`,
        `"${s.status}"`,
        `"${s.weakTopics.join("; ") || "Không có"}"`,
        `"${s.teacherComment || "Chưa nhận xét"}"`,
      ].join(",");
      csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Bang_Diem_VinUni_Quiz_AI_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    triggerToast("Đã xuất file bảng điểm (Excel/CSV) thành công! 📥");
  }

  function triggerToast(msg: string) {
    setNotificationMsg(msg);
    setTimeout(() => {
      setNotificationMsg(null);
    }, 4000);
  }

  async function loadAttempts() {
    try {
      const attempts = await fetchQuizAttempts();
      setRawAttempts(attempts);
      const mapped: StudentSubmission[] = attempts.map((attempt) => {
        const scorePct = attempt.score_pct ?? 0;
        return {
          id: attempt.attempt_id,
          attemptId: attempt.attempt_id,
          documentId: attempt.document_id,
          quizId: attempt.quiz_id,
          studentName: attempt.student_name,
          studentCode: attempt.student_code,
          submittedAt: attempt.submitted_at ? new Date(attempt.submitted_at).toLocaleString("vi-VN") : "",
          scorePct,
          correctCount: attempt.correct_count,
          totalCount: attempt.total_count,
          status:
            attempt.status ||
            (scorePct >= 80 ? "Excellence" : scorePct >= 50 ? "Good" : "Needs Review"),
          weakTopics: attempt.weak_topics || [],
          teacherComment: attempt.teacher_comment,
          evaluatedAt: attempt.reviewed_at ? new Date(attempt.reviewed_at).toLocaleString("vi-VN") : undefined,
          evaluatedBy: attempt.reviewed_by,
        };
      });
      setSubmissions(mapped);
    } catch (err) {
      console.warn("Không tải được danh sách bài nộp.", err);
    }
  }

  useEffect(() => {
    void loadAttempts();
  }, []);

  async function handleOpenQuizReview(doc: VLearnDocument) {
    setReviewDoc(doc);
    setLessonFilterId(doc.id);
    setReviewQuizRecord(null);
    setReviewQuiz(null);
    setReviewError(null);
    setReviewEditMode(false);
    setReviewLoading(true);

    try {
      const savedQuiz = await fetchSavedQuiz(doc.id, { includeDraft: true });
      if (!savedQuiz) {
        setReviewError("Chưa tìm thấy file quiz đã lưu cho bài học này.");
        return;
      }
      setReviewQuizRecord(savedQuiz);

      const documentForQuiz: Role2Document = {
        schema_version: "1.0",
        document_id: doc.id,
        title: doc.title,
        source_type: "pdf",
        original_filename: doc.filename,
        status: "ready",
        created_at: doc.uploadedAt || new Date().toISOString(),
        statistics: {
          total_chunks: doc.chunks?.length || doc.pages || 0,
          total_characters: (doc.chunks || []).reduce((sum, chunk) => sum + chunk.text.length, 0),
        },
        chunks: doc.chunks || [],
        file_url: doc.fileUrl,
      };

      setReviewQuiz(adaptGeneratedQuiz(savedQuiz, documentForQuiz));
    } catch (err) {
      setReviewError(err instanceof Error ? err.message : "Không tải được nội dung quiz.");
    } finally {
      setReviewLoading(false);
    }
  }

  function handleOpenSlideFromReview() {
    if (!reviewDoc || !onOpenDocument) return;
    onOpenDocument(reviewDoc);
  }

  function handleSelectLesson(docId: string) {
    setLessonFilterId(docId);
  }

  function updateQuestionDraft(
    questionIndex: number,
    updater: (question: Role3Quiz["questions"][number]) => Role3Quiz["questions"][number]
  ) {
    updateEditedQuiz((prev) => ({
      ...prev,
      questions: prev.questions.map((question, index) =>
        index === questionIndex ? updater(question) : question
      ),
    }));
  }

  const lessonRecommendations = useMemo(() => {
    if (!reviewDoc || !reviewQuizRecord || rawAttempts.length === 0) {
      return null;
    }
    
    const attemptsForDoc = rawAttempts.filter(
      (att) => att.document_id === reviewDoc.id
    );
    
    if (attemptsForDoc.length === 0) {
      return {
        hasAttempts: false,
        reteachTopic: null,
        changeQuestions: [],
      };
    }
    
    const questionStats = reviewQuizRecord.questions.map((q, idx) => {
      let correct = 0;
      let total = 0;
      attemptsForDoc.forEach((att) => {
        const studentAns = att.answers?.[q.question_id] || att.answers?.[`q_${idx + 1}`];
        if (studentAns) {
          total++;
          if (studentAns.toUpperCase() === q.correct_option_id.toUpperCase()) {
            correct++;
          }
        }
      });
      const incorrectRate = total > 0 ? (total - correct) / total : 0;
      return {
        questionId: q.question_id,
        index: idx + 1,
        questionText: q.question,
        topic: q.topic || "Tổng quan",
        incorrectRate,
        total,
        correct,
      };
    });
    
    const topicStats: Record<string, { totalAnswers: number; wrongAnswers: number }> = {};
    questionStats.forEach((stat) => {
      if (!topicStats[stat.topic]) {
        topicStats[stat.topic] = { totalAnswers: 0, wrongAnswers: 0 };
      }
      topicStats[stat.topic].totalAnswers += stat.total;
      topicStats[stat.topic].wrongAnswers += (stat.total - stat.correct);
    });
    
    const aggregatedTopics = Object.entries(topicStats).map(([topic, data]) => {
      const rate = data.totalAnswers > 0 ? data.wrongAnswers / data.totalAnswers : 0;
      return { topic, rate, ...data };
    });
    
    aggregatedTopics.sort((a, b) => b.rate - a.rate);
    const topWeakTopic = aggregatedTopics[0] && aggregatedTopics[0].rate > 0.3 ? aggregatedTopics[0] : null;
    
    const worstQuestions = questionStats
      .filter((q) => q.incorrectRate > 0.4)
      .sort((a, b) => b.incorrectRate - a.incorrectRate)
      .slice(0, 2);
      
    return {
      hasAttempts: true,
      reteachTopic: topWeakTopic,
      changeQuestions: worstQuestions,
    };
  }, [reviewDoc, reviewQuizRecord, rawAttempts]);

  function createEmptyQuestion(index: number): Role3Quiz["questions"][number] {
    let defaultParentId = reviewDoc?.id || "";
    let defaultSourceId = `SLIDE_${String(index + 1).padStart(2, "0")}`;
    
    if (reviewDoc && reviewDoc.chunks && reviewDoc.chunks.length > 0) {
      const chunkIdx = index % reviewDoc.chunks.length;
      defaultSourceId = reviewDoc.chunks[chunkIdx].source_id;
      defaultParentId = reviewDoc.chunks[chunkIdx].parent_source_id || reviewDoc.id;
    }

    return {
      question_id: `q_${Date.now()}_${index + 1}`,
      type: "single_choice",
      topic: "Tổng quan",
      difficulty: "medium",
      question: "",
      options: [
        { id: "A", text: "" },
        { id: "B", text: "" },
        { id: "C", text: "" },
        { id: "D", text: "" },
      ],
      correct_option_id: "A",
      explanation: "",
      citation: {
        source_id: defaultSourceId,
        parent_source_id: defaultParentId,
        quote: "",
      },
      citation_status: "draft",
    };
  }

  function cloneQuizRecord(record: Role3Quiz): Role3Quiz {
    return JSON.parse(JSON.stringify(record)) as Role3Quiz;
  }

  function normalizeQuizRecord(record: Role3Quiz): Role3Quiz {
    const normalizedQuestions = (record.questions || []).map((question, index) => {
      let defaultParentId = question.citation?.parent_source_id?.trim() || record.document_id || "";
      let defaultSourceId = question.citation?.source_id?.trim() || "";
      
      if (!defaultSourceId) {
        if (reviewDoc && reviewDoc.chunks && reviewDoc.chunks.length > 0) {
          const chunkIdx = index % reviewDoc.chunks.length;
          defaultSourceId = reviewDoc.chunks[chunkIdx].source_id;
          if (!defaultParentId) {
            defaultParentId = reviewDoc.chunks[chunkIdx].parent_source_id || reviewDoc.id;
          }
        } else {
          defaultSourceId = `SLIDE_${String(index + 1).padStart(2, "0")}`;
        }
      }
      if (!defaultParentId && reviewDoc) {
        defaultParentId = reviewDoc.id;
      }

      return {
        ...question,
        question_id: question.question_id || `q_${index + 1}`,
        type: "single_choice",
        topic: question.topic?.trim() || "Tổng quan",
        difficulty: (question.difficulty || "medium") as Role3Quiz["questions"][number]["difficulty"],
        question: question.question?.trim() || `Câu hỏi ${index + 1}`,
        options: (question.options || []).slice(0, 4).map((option, optIdx) => ({
          id: String.fromCharCode(65 + optIdx),
          text: option.text?.trim() || "",
        })),
        correct_option_id: (question.correct_option_id || "A").toUpperCase(),
        explanation: question.explanation?.trim() || "",
        citation: {
          source_id: defaultSourceId,
          parent_source_id: defaultParentId,
          quote: question.citation?.quote?.trim() || "",
        },
        citation_status: question.citation_status || "draft",
      };
    });

    return {
      ...record,
      document_id: record.document_id,
      status: "draft",
      questions: normalizedQuestions,
    };
  }

  function handleBeginEditQuiz() {
    if (!reviewQuizRecord) return;
    setReviewEditMode(true);
    setReviewQuizRecord((prev) => (prev ? cloneQuizRecord(prev) : prev));
  }

  function handleCancelQuizEdit() {
    if (!reviewQuizRecord || !reviewDoc) return;
    setReviewEditMode(false);
    void handleOpenQuizReview(reviewDoc);
  }

  function updateEditedQuiz(updater: (prev: Role3Quiz) => Role3Quiz) {
    setReviewQuizRecord((prev) => {
      if (!prev) return prev;
      const next = updater(cloneQuizRecord(prev));
      setReviewQuiz(adaptGeneratedQuiz(next, {
        schema_version: "1.0",
        document_id: next.document_id,
        title: reviewDoc?.title || next.document_id,
        source_type: "pdf",
        original_filename: reviewDoc?.filename || next.document_id,
        status: "ready",
        created_at: reviewDoc?.uploadedAt || next.created_at,
        statistics: {
          total_chunks: reviewDoc?.chunks?.length || reviewDoc?.pages || 0,
          total_characters: (reviewDoc?.chunks || []).reduce((sum, chunk) => sum + chunk.text.length, 0),
        },
        chunks: reviewDoc?.chunks || [],
        file_url: reviewDoc?.fileUrl,
      }));
      return next;
    });
  }

  function handleAddQuestion() {
    updateEditedQuiz((prev) => ({
      ...prev,
      questions: [...(prev.questions || []), createEmptyQuestion((prev.questions || []).length)],
    }));
  }

  function handleDeleteQuestion(questionIndex: number) {
    updateEditedQuiz((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, idx) => idx !== questionIndex),
    }));
  }

  function handleAddOption(questionIndex: number) {
    updateQuestionDraft(questionIndex, (question) => {
      const nextOptions = [...question.options];
      const optionId = String.fromCharCode(65 + nextOptions.length);
      nextOptions.push({ id: optionId, text: "" });
      return {
        ...question,
        options: nextOptions.slice(0, 4),
      };
    });
  }

  function handleRemoveOption(questionIndex: number, optionIndex: number) {
    updateQuestionDraft(questionIndex, (question) => {
      const nextOptions = question.options.filter((_, idx) => idx !== optionIndex);
      while (nextOptions.length < 2) {
        const optionId = String.fromCharCode(65 + nextOptions.length);
        nextOptions.push({ id: optionId, text: "" });
      }
      const corrected = nextOptions.map((option, idx) => ({
        id: String.fromCharCode(65 + idx),
        text: option.text,
      }));
      const currentCorrect = question.correct_option_id || "A";
      const safeCorrect =
        corrected.find((option) => option.id === currentCorrect)?.id || corrected[0]?.id || "A";
      return {
        ...question,
        options: corrected,
        correct_option_id: safeCorrect,
      };
    });
  }

  function handleSaveQuizDraft() {
    if (!reviewDoc || !reviewQuizRecord) return;
    const normalized = normalizeQuizRecord(reviewQuizRecord);
    setReviewLoading(true);
    setReviewError(null);
    void saveQuizDraft(reviewDoc.id, normalized)
      .then(async (saved) => {
        setReviewQuizRecord(saved);
        const documentForQuiz: Role2Document = {
          schema_version: "1.0",
          document_id: reviewDoc.id,
          title: reviewDoc.title,
          source_type: "pdf",
          original_filename: reviewDoc.filename,
          status: "ready",
          created_at: reviewDoc.uploadedAt || new Date().toISOString(),
          statistics: {
            total_chunks: reviewDoc.chunks?.length || reviewDoc.pages || 0,
            total_characters: (reviewDoc.chunks || []).reduce((sum, chunk) => sum + chunk.text.length, 0),
          },
          chunks: reviewDoc.chunks || [],
          file_url: reviewDoc.fileUrl,
        };
        setReviewQuiz(adaptGeneratedQuiz(saved, documentForQuiz));
        setReviewEditMode(false);
        await onRefreshLibrary?.();
        triggerToast("Đã lưu bản nháp quiz mới.");
      })
      .catch((err) => {
        console.warn("Không lưu được bản nháp quiz.", err);
        setReviewError(err instanceof Error ? err.message : "Không lưu được bản nháp quiz.");
      })
      .finally(() => {
        setReviewLoading(false);
      });
  }

  function handlePublishQuiz() {
    if (!reviewDoc) return;
    setReviewLoading(true);
    setReviewError(null);
    void publishSavedQuiz(reviewDoc.id)
      .then(async () => {
        await onRefreshLibrary?.();
        await loadAttempts();
        await handleOpenQuizReview(reviewDoc);
        triggerToast("Đã xuất bản quiz cho sinh viên.");
      })
      .catch((err) => {
        console.warn("Không xuất bản được quiz.", err);
        setReviewError(err instanceof Error ? err.message : "Không xuất bản được quiz.");
      })
      .finally(() => {
        setReviewLoading(false);
      });
  }

  return (
    <div className="teacher-dashboard-container">
      {notificationMsg && (
        <div className="dashboard-toast-banner">
          <span>✨ {notificationMsg}</span>
        </div>
      )}

      {/* Header Dashboard Banner */}
      <div className="dashboard-banner">
        <div className="banner-left">
          <span className="badge-dash">ĐẶC QUYỀN GIẢNG VIÊN</span>
          <h1>📊 Báo Cáo & Trung Tâm Đánh Giá Bài Làm SV</h1>
          <p className="subtitle">
            Phân tích tiến độ & chấm đánh giá bài làm Quiz AI môn học: <strong>{activeDocumentTitle}</strong>
          </p>
        </div>
        <div className="banner-actions">
          <button className="btn-export-excel" onClick={handleExportExcel}>
            📥 Xuất Bảng Điểm (Excel/CSV)
          </button>
        </div>
      </div>

      {/* KPI Cards Overview */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon icon-blue">📚</div>
          <div className="kpi-details">
            <span className="kpi-label">Tổng số bài giảng</span>
            <div className="kpi-value-row">
              <span className="kpi-value">{totalLessons}</span>
              <span className="kpi-total">Bài</span>
            </div>
            <span className="kpi-subtext">{lessonsWithQuiz} bài đã có Quiz AI</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon icon-green">🎯</div>
          <div className="kpi-details">
            <span className="kpi-label">Điểm trung bình bài test</span>
            <div className="kpi-value-row">
              <span className="kpi-value">{completedCount > 0 ? `${avgScore}%` : "—"}</span>
              <span className="kpi-status-text">
                {completedCount === 0
                  ? "Chưa có dữ liệu"
                  : avgScore >= 80 ? "Xuất sắc" : avgScore >= 50 ? "Khá tốt" : "Cần hỗ trợ"}
              </span>
            </div>
            <span className="kpi-subtext">Đo lường tự động từ hệ thống AI</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon icon-orange">⚠️</div>
          <div className="kpi-details">
            <span className="kpi-label">SV cần nhắc nhở ôn tập</span>
            <div className="kpi-value-row">
              <span className="kpi-value text-warning">{needsReviewCount}</span>
              <span className="kpi-total">Sinh viên</span>
            </div>
            <span className="kpi-subtext">Tỷ lệ đúng dưới 50%</span>
          </div>
        </div>
      </div>

      <div className="dash-card lesson-dashboard-card">
        <div className="dash-card-header">
          <div>
            <h2>📌 Dashboard Theo Từng Bài</h2>
            <p style={{ margin: "4px 0 0", fontSize: "0.82rem", color: "#64748b" }}>
              Chọn một bài để xem điểm trung bình, số bài làm, và những chủ đề đang hổng nhiều nhất.
            </p>
          </div>
          <span className="dash-pill">
            {lessonFocus ? `${lessonFocus.attempts} bài nộp` : "Tổng hợp toàn bộ"}
          </span>
        </div>

        {lessonAnalytics.length === 0 ? (
          <div className="empty-dashboard-state">
            <span className="empty-dash-icon">📭</span>
            <h3>Chưa có bài học nào để tổng hợp</h3>
            <p>Hãy nạp slide và tạo quiz trước, rồi dashboard sẽ tự gom số liệu theo từng bài.</p>
          </div>
        ) : (
          <div className="lesson-dashboard-grid">
            {lessonAnalytics.map((item) => (
              <button
                key={item.doc.id}
                type="button"
                className={`lesson-dashboard-item ${lessonFilterId === item.doc.id ? "active" : ""}`}
                onClick={() => {
                  handleSelectLesson(item.doc.id);
                  onOpenDocument?.(item.doc);
                }}
                title="Bấm để chuyển sang xem Slide này"
              >
                <div className="lesson-dashboard-item-head">
                  <strong>{item.doc.title}</strong>
                  <span>{item.hasQuiz ? "Có quiz" : "Chưa có quiz"}</span>
                </div>
                <div className="lesson-dashboard-item-stats">
                  <span>{item.attempts} bài nộp</span>
                  <span>{item.avgScore > 0 ? `${item.avgScore}% TB` : "Chưa có điểm"}</span>
                  <span>{item.needsReview} cần xem lại</span>
                </div>
                <div className="lesson-dashboard-item-weak">
                  {item.topWeakTopics.length > 0
                    ? item.topWeakTopics.join(" · ")
                    : "Chưa đủ dữ liệu lỗi hổng"}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Section 2: Quiz Per Lesson Overview */}
      <div className="dash-card">
        <div className="dash-card-header">
          <h2>📖 Danh Sách Quiz Theo Từng Bài Giảng</h2>
          <span className="dash-pill">Realtime từ hệ thống</span>
        </div>

        {curriculumList.length === 0 ? (
          <div className="empty-dashboard-state">
            <span className="empty-dash-icon">📭</span>
            <h3>Chưa có bài giảng nào được nạp</h3>
            <p>Vui lòng nạp slide bài giảng đầu tiên để bắt đầu tạo Quiz AI cho sinh viên.</p>
          </div>
        ) : (
          <div className="lesson-quiz-grid">
            {curriculumList.map((day, idx) => (
              <div key={day.id} className="lesson-quiz-card">
                <div className="lesson-quiz-header">
                  <span className="lesson-index-badge">{idx + 1}</span>
                  <div className="lesson-quiz-info">
                    <span className="lesson-quiz-title">{day.title || day.dayTag}</span>
                    <span className="lesson-quiz-meta">
                      {day.documents.length} tài liệu · {day.documents.reduce((sum, d) => sum + d.pages, 0)} trang
                    </span>
                  </div>
                </div>
                {(() => {
                  const firstDoc =
                    day.documents.find((doc) => doc.quizStatus) ||
                    day.documents.find((doc) => doc.quizAvailable) ||
                    day.documents[0];
                  if (!firstDoc) return null;
                  const statusLabel =
                    firstDoc.quizStatus === "published"
                      ? "Đã xuất bản"
                      : firstDoc.quizStatus === "draft"
                      ? "Bản nháp"
                      : firstDoc.quizAvailable
                      ? "Đã có Quiz AI"
                      : "Chưa tạo Quiz";
                  const quizButtonLabel =
                    firstDoc.quizStatus === "draft" ? "Duyệt Quiz" : "Xem Quiz";
                  const statusClass =
                    firstDoc.quizStatus === "published" || firstDoc.quizAvailable
                      ? "quiz-status-ready"
                      : firstDoc.quizStatus === "draft"
                      ? "quiz-status-pending"
                      : "quiz-status-pending";

                  return (
                    <>
                      <div className="lesson-quiz-status">
                        <span className={statusClass}>{statusLabel}</span>
                      </div>
                      <div className="lesson-quiz-actions">
                        <button
                          type="button"
                          className="btn-review-slide"
                          onClick={() => onOpenDocument?.(firstDoc)}
                        >
                          Xem slide
                        </button>
                        <button
                          type="button"
                          className="btn-review-quiz"
                          disabled={!firstDoc.quizStatus && !firstDoc.quizAvailable}
                          onClick={() => handleOpenQuizReview(firstDoc)}
                        >
                          {quizButtonLabel}
                        </button>
                      </div>
                      <div className="lesson-quiz-mini-stats">
                        <span>{lessonAnalytics.find((item) => item.doc.id === firstDoc.id)?.attempts || 0} bài nộp</span>
                        <span>
                          {lessonAnalytics.find((item) => item.doc.id === firstDoc.id)?.avgScore
                            ? `${lessonAnalytics.find((item) => item.doc.id === firstDoc.id)?.avgScore}% TB`
                            : "Chưa có điểm"}
                        </span>
                      </div>
                    </>
                  );
                })()}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 3: Interactive Student Evaluation Submissions Table */}
      <div className="dash-card">
        <div className="dash-card-header">
          <div>
            <h2>📋 Danh Sách & Đánh Giá Chi Tiết Bài Làm Sinh Viên</h2>
            <p style={{ margin: "4px 0 0", fontSize: "0.82rem", color: "#64748b" }}>
              {submissions.length > 0
                ? "Bấm vào hàng của từng sinh viên để viết Nhận xét & Đánh giá trực tiếp."
                : "Chưa có sinh viên nào nộp bài. Dữ liệu sẽ cập nhật khi sinh viên hoàn thành quiz."}
            </p>
          </div>

          {submissions.length > 0 && (
            <div className="table-controls-row">
              {lessonFilterId !== "ALL" && (
                <div className="active-lesson-chip">
                  <span>Đang xem: {selectedLessonDoc?.title || "Bài hiện tại"}</span>
                  <button type="button" onClick={() => setLessonFilterId("ALL")}>
                    Xem tất cả
                  </button>
                </div>
              )}

              {/* Filter Pills */}
              <div className="status-filter-pills">
                <button
                  className={`filter-pill ${statusFilter === "ALL" ? "active" : ""}`}
                  onClick={() => setStatusFilter("ALL")}
                >
                  Tất cả ({submissions.length})
                </button>
                <button
                  className={`filter-pill ${statusFilter === "Excellence" ? "active" : ""}`}
                  onClick={() => setStatusFilter("Excellence")}
                >
                  Nắm rất vững
                </button>
                <button
                  className={`filter-pill ${statusFilter === "Good" ? "active" : ""}`}
                  onClick={() => setStatusFilter("Good")}
                >
                  Đạt yêu cầu
                </button>
                <button
                  className={`filter-pill ${statusFilter === "Needs Review" ? "active" : ""}`}
                  onClick={() => setStatusFilter("Needs Review")}
                >
                  ⚠️ Cần ôn lại
                </button>
              </div>

              {/* Search Box */}
              <div className="table-search-box">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="🔍 Tìm tên sinh viên, MSSV..."
                  className="input-search"
                />
              </div>
            </div>
          )}
        </div>

        {submissions.length === 0 ? (
          <div className="empty-dashboard-state">
            <span className="empty-dash-icon">📝</span>
            <h3>Chưa Có Bài Làm Nào</h3>
            <p>Khi sinh viên hoàn thành Quiz AI, bài làm sẽ tự động hiển thị tại đây để giảng viên đánh giá.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="teacher-table">
              <thead>
                <tr>
                  <th>Họ & Tên Sinh Viên</th>
                  <th>MSSV</th>
                  <th>Thời Gian Nộp</th>
                  <th>Điểm Số</th>
                  <th>Tỷ Lệ (%)</th>
                  <th>Đánh Giá Hiểu Bài</th>
                  <th>Nhận Xét Giảng Viên</th>
                  <th>Hành Động</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubmissions.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: "center", padding: "30px", color: "#94a3b8" }}>
                      Không tìm thấy sinh viên nào phù hợp với bộ lọc.
                    </td>
                  </tr>
                ) : (
                  filteredSubmissions.map((sub) => (
                    <tr
                      key={sub.id}
                      className="clickable-row"
                      onClick={() => handleOpenEvalModal(sub)}
                    >
                      <td className="font-semibold">{sub.studentName}</td>
                      <td className="text-muted">{sub.studentCode}</td>
                      <td className="text-muted">{sub.submittedAt}</td>
                      <td>
                        <strong>{sub.correctCount}</strong>/{sub.totalCount} câu
                      </td>
                      <td>
                        <span
                          className={`score-badge ${
                            sub.scorePct >= 80
                              ? "score-high"
                              : sub.scorePct >= 50
                              ? "score-mid"
                              : "score-low"
                          }`}
                        >
                          {sub.scorePct}%
                        </span>
                      </td>
                      <td>
                        {sub.status === "Excellence" && (
                          <span className="tag-status tag-excellence">🌟 Nắm rất vững</span>
                        )}
                        {sub.status === "Good" && (
                          <span className="tag-status tag-good">👍 Đạt yêu cầu</span>
                        )}
                        {sub.status === "Needs Review" && (
                          <span className="tag-status tag-review">⚠️ Cần xem lại</span>
                        )}
                      </td>
                      <td>
                        {sub.teacherComment ? (
                          <span className="teacher-comment-preview" title={sub.teacherComment}>
                            💬 &quot;{sub.teacherComment}&quot;
                          </span>
                        ) : (
                          <span className="text-muted-italic">Chưa có nhận xét</span>
                        )}
                      </td>
                      <td>
                        <button
                          className="btn-eval-action"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEvalModal(sub);
                          }}
                        >
                          ✏️ Đánh giá
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal / Drawer Đánh Giá Chi Tiết Bài Làm Của Giảng Viên */}
      {selectedSub && (
        <div className="modal-overlay">
          <div className="modal-card eval-modal-card">
            <div className="modal-header">
              <h3>📝 Đánh Giá Chi Tiết Bài Làm: {selectedSub.studentName}</h3>
              <button className="btn-close-modal" onClick={() => setSelectedSub(null)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleSaveEvaluation} className="modal-body">
              <div className="eval-info-box">
                <div className="eval-info-col">
                  <span>Họ tên sinh viên:</span>
                  <strong>{selectedSub.studentName} ({selectedSub.studentCode})</strong>
                </div>
                <div className="eval-info-col">
                  <span>Thời gian nộp:</span>
                  <strong>{selectedSub.submittedAt}</strong>
                </div>
                <div className="eval-info-col">
                  <span>Kết quả làm bài:</span>
                  <strong className="eval-score-text">{selectedSub.scorePct}% ({selectedSub.correctCount}/{selectedSub.totalCount} câu)</strong>
                </div>
              </div>

              {selectedSub.weakTopics.length > 0 && (
                <div className="form-group">
                  <label>Chủ đề sinh viên làm sai:</label>
                  <div className="weak-topic-tags">
                    {selectedSub.weakTopics.map((t, idx) => (
                      <span key={idx} className="weak-tag">
                        ⚠️ {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="form-group">
                <label>Xếp loại đánh giá của Giảng viên:</label>
                <select
                  value={evalStatus}
                  onChange={(e) => setEvalStatus(e.target.value as any)}
                  className="input-text"
                >
                  <option value="Excellence">🌟 Nắm rất vững (Xuất sắc)</option>
                  <option value="Good">👍 Đạt yêu cầu (Khá/Trung bình)</option>
                  <option value="Needs Review">⚠️ Cần xem lại & Ôn bổ sung</option>
                </select>
              </div>

              <div className="form-group">
                <label>Nhận xét & Khuyên học dành cho sinh viên:</label>
                <textarea
                  rows={4}
                  className="input-text"
                  value={teacherComment}
                  onChange={(e) => setTeacherComment(e.target.value)}
                  placeholder="Ghi rõ ý kiến đánh giá, ví dụ: 'Cần đọc lại Slide 10 phần Attention mechanism trước khi làm bài thi giữa kỳ'..."
                />
              </div>

              {selectedSub.evaluatedAt && (
                <div className="eval-history-note">
                  <span>🕒 Đã đánh giá gần nhất: {selectedSub.evaluatedAt} bởi {selectedSub.evaluatedBy}</span>
                </div>
              )}

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setSelectedSub(null)}
                >
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary">
                  💾 Lưu & Gửi Đánh Giá Cho Sinh Viên
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {reviewDoc && (
        <div className="modal-overlay">
          <div className="modal-card quiz-review-modal-card">
            <div className="modal-header">
              <div>
                <h3>Xem Quiz AI: {reviewDoc.title}</h3>
                <p className="quiz-review-subtitle">
                  {reviewDoc.filename} · {reviewDoc.pages} trang · {reviewQuiz?.questions.length || 0} câu hỏi
                </p>
                <span className="quiz-review-status-pill">
                  {reviewQuizRecord?.status === "published" ? "Đã xuất bản" : "Bản nháp"}
                </span>
              </div>
              <button className="btn-close-modal" onClick={() => setReviewDoc(null)}>
                ×
              </button>
            </div>

            <div className="modal-body quiz-review-body">
              <div className="quiz-review-toolbar">
                <button type="button" className="btn-review-slide" onClick={handleOpenSlideFromReview}>
                  Mở slide bài học
                </button>
                <span className="quiz-review-note">
                  Giảng viên xem trước đáp án đúng, giải thích và nguồn slide trước khi cho sinh viên làm.
                </span>
              </div>

              <div className="quiz-review-action-row">
                {!reviewEditMode ? (
                  <>
                    <button
                      type="button"
                      className="btn-review-edit"
                      onClick={handleBeginEditQuiz}
                      disabled={!reviewQuizRecord || reviewLoading}
                    >
                      Chỉnh sửa quiz
                    </button>
                    {reviewQuizRecord && reviewQuizRecord.status !== "published" ? (
                      <button
                        type="button"
                        className="btn-review-publish"
                        onClick={handlePublishQuiz}
                        disabled={reviewLoading}
                      >
                        Xuất bản quiz
                      </button>
                    ) : (
                      <span className="quiz-review-live-note">Quiz này đã sẵn sàng cho sinh viên.</span>
                    )}
                  </>
                ) : (
                  <>
                    <button type="button" className="btn-review-secondary" onClick={handleAddQuestion} disabled={reviewLoading}>
                      + Thêm câu hỏi
                    </button>
                    <button type="button" className="btn-review-secondary" onClick={handleCancelQuizEdit} disabled={reviewLoading}>
                      Hủy sửa
                    </button>
                    <button type="button" className="btn-review-publish" onClick={handleSaveQuizDraft} disabled={reviewLoading}>
                      Lưu bản nháp
                    </button>
                  </>
                )}
              </div>

              {reviewQuizRecord?.history && reviewQuizRecord.history.length > 0 && (
                <div className="quiz-version-history">
                  <div className="quiz-version-history-title">Lịch Sử Phiên Bản</div>
                  <div className="quiz-version-history-list">
                    {reviewQuizRecord.history.slice().reverse().map((item) => (
                      <div className="quiz-version-history-item" key={`${item.quiz_id}-${item.version}`}>
                        <span>v{item.version}</span>
                        <span>{item.status}</span>
                        <span>{item.created_at ? new Date(item.created_at).toLocaleString("vi-VN") : ""}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {reviewQuizRecord?.warnings && reviewQuizRecord.warnings.filter(w => !w.toLowerCase().includes("attempt_")).length > 0 && (
                <div className="quiz-review-warnings">
                  <strong>Ghi Chú Nguồn Quiz</strong>
                  {reviewQuizRecord.warnings.filter(w => !w.toLowerCase().includes("attempt_")).map((warning, index) => (
                    <span key={`${warning}-${index}`}>{warning}</span>
                  ))}
                </div>
              )}

              <div className="quiz-lesson-dashboard">
                <div className="quiz-lesson-dashboard-head">
                  <div>
                    <strong>Dashboard bài này</strong>
                    <span>Nhìn nhanh kết quả sinh viên, lỗi hổng, và mức độ cần giảng lại.</span>
                  </div>
                  <div className="quiz-lesson-dashboard-metrics">
                    <span>{selectedLessonAttempts.length} bài nộp</span>
                    <span>
                      {lessonFocus?.avgScore ? `${lessonFocus.avgScore}% trung bình` : "Chưa có dữ liệu"}
                    </span>
                  </div>
                </div>

                {selectedLessonAttempts.length > 0 ? (
                  <div className="quiz-lesson-dashboard-grid">
                    <div className="quiz-lesson-dashboard-box">
                      <span className="quiz-lesson-dashboard-label">Sinh viên đã làm</span>
                      <div className="quiz-lesson-student-list">
                        {selectedLessonAttempts.slice(0, 6).map((attempt) => (
                          <div key={attempt.id} className="quiz-lesson-student-item">
                            <strong>{attempt.studentName}</strong>
                            <span>{attempt.studentCode}</span>
                            <span>{attempt.scorePct}%</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="quiz-lesson-dashboard-box">
                      <span className="quiz-lesson-dashboard-label">Chủ đề sai nhiều nhất</span>
                      <div className="quiz-lesson-topic-list">
                        {(lessonFocus?.topWeakTopics || []).length > 0 ? (
                          lessonFocus?.topWeakTopics.map((topic) => (
                            <span key={topic} className="weak-tag">
                              {topic}
                            </span>
                          ))
                        ) : (
                          <span className="quiz-lesson-empty">Chưa đủ dữ liệu để xếp hạng lỗi hổng.</span>
                        )}
                      </div>
                    </div>

                    <div className="quiz-lesson-dashboard-box evaluation-box">
                      <span className="quiz-lesson-dashboard-label">💡 Khuyến nghị Giảng dạy (AI)</span>
                      {lessonRecommendations && lessonRecommendations.hasAttempts ? (
                        <div className="recommendations-content">
                          {lessonRecommendations.reteachTopic ? (
                            <div className="recommendation-item">
                              <span className="rec-badge rec-reteach">Nên giảng lại</span>
                              <p>
                                Chủ đề <strong>{lessonRecommendations.reteachTopic.topic}</strong> có tỷ lệ trả lời sai cao (<strong>{Math.round(lessonRecommendations.reteachTopic.rate * 100)}%</strong>). Giảng viên nên dành thêm thời gian giảng kỹ lại nội dung này.
                              </p>
                            </div>
                          ) : (
                            <div className="recommendation-item">
                              <span className="rec-badge rec-good">Đạt tiến độ</span>
                              <p>Các chủ đề đều có mức độ hiểu bài tốt.</p>
                            </div>
                          )}
                          
                          {lessonRecommendations.changeQuestions.length > 0 ? (
                            <div className="recommendation-item">
                              <span className="rec-badge rec-change">Cần thay đổi câu hỏi</span>
                              <div className="rec-questions-list">
                                {lessonRecommendations.changeQuestions.map((q) => (
                                  <div key={q.questionId} className="rec-question-detail">
                                    <strong>Câu {q.index}:</strong> {q.questionText.length > 55 ? q.questionText.slice(0, 55) + "..." : q.questionText}
                                    <span className="danger-text"> (Sai {Math.round(q.incorrectRate * 100)}%)</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="recommendation-item">
                              <span className="rec-badge rec-good">Độ khó phù hợp</span>
                              <p>Các câu hỏi hiện tại có tỷ lệ đúng ổn định.</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="quiz-lesson-empty">Chưa có đủ dữ liệu bài làm để đưa ra khuyến nghị giảng dạy.</span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="quiz-lesson-empty">Chưa có sinh viên nào nộp bài cho bài học này.</div>
                )}
              </div>

              {reviewLoading && (
                <div className="quiz-review-state">Đang tải nội dung quiz...</div>
              )}

              {reviewError && (
                <div className="quiz-review-state is-error">{reviewError}</div>
              )}

              {reviewQuizRecord && reviewEditMode && (
                <div className="quiz-edit-banner">
                  <strong>Chế độ chỉnh sửa</strong>
                  <span>Lưu bản nháp để cập nhật danh sách câu hỏi, đáp án và trích dẫn.</span>
                </div>
              )}

              {reviewEditMode && reviewQuizRecord ? (
                <div className="quiz-edit-list">
                  {reviewQuizRecord.questions.map((question, index) => {
                    const correctOption = question.options.find(
                      (option) => option.id.toUpperCase() === question.correct_option_id.toUpperCase()
                    );

                    return (
                      <div key={question.question_id} className="quiz-review-question">
                        <div className="quiz-review-question-head">
                          <span className="quiz-review-count">Câu {index + 1}</span>
                          <span className="quiz-review-topic">{question.topic || "Tổng quan"}</span>
                          <span className="quiz-review-difficulty">
                            {question.difficulty === "easy"
                              ? "Dễ"
                              : question.difficulty === "hard"
                              ? "Khó"
                              : "Trung bình"}
                          </span>
                          <button
                            type="button"
                            className="btn-question-delete"
                            onClick={() => handleDeleteQuestion(index)}
                            disabled={reviewLoading}
                          >
                            Xóa câu hỏi
                          </button>
                        </div>

                        <div className="quiz-edit-question-form">
                          <label>
                            Chủ đề
                            <input
                              className="input-text"
                              value={question.topic}
                              onChange={(e) =>
                                updateQuestionDraft(index, (current) => ({
                                  ...current,
                                  topic: e.target.value,
                                }))
                              }
                            />
                          </label>
                          <label>
                            Câu hỏi
                            <textarea
                              className="input-text quiz-edit-textarea"
                              value={question.question}
                              onChange={(e) =>
                                updateQuestionDraft(index, (current) => ({
                                  ...current,
                                  question: e.target.value,
                                }))
                              }
                            />
                          </label>
                          <div className="quiz-edit-grid">
                            <label>
                              Độ khó
                              <select
                                className="input-text"
                                value={question.difficulty}
                                onChange={(e) =>
                                  updateQuestionDraft(index, (current) => ({
                                    ...current,
                                    difficulty: e.target.value as Role3Quiz["questions"][number]["difficulty"],
                                  }))
                                }
                              >
                                <option value="easy">Dễ</option>
                                <option value="medium">Trung bình</option>
                                <option value="hard">Khó</option>
                              </select>
                            </label>
                            <label>
                              Đáp án đúng
                              <select
                                className="input-text"
                                value={question.correct_option_id}
                                onChange={(e) =>
                                  updateQuestionDraft(index, (current) => ({
                                    ...current,
                                    correct_option_id: e.target.value.toUpperCase(),
                                  }))
                                }
                              >
                                {question.options.map((option) => (
                                  <option key={option.id} value={option.id.toUpperCase()}>
                                    {option.id.toUpperCase()}
                                  </option>
                                ))}
                              </select>
                            </label>
                          </div>

                          <div className="quiz-edit-options">
                            {question.options.map((option, optionIndex) => (
                              <div key={option.id} className="quiz-edit-option-row">
                                <div className="quiz-edit-option-id-label">
                                  {option.id}
                                </div>
                                <input
                                  className="input-text"
                                  value={option.text}
                                  onChange={(e) =>
                                    updateQuestionDraft(index, (current) => ({
                                      ...current,
                                      options: current.options.map((item, idx) =>
                                        idx === optionIndex ? { ...item, text: e.target.value } : item
                                      ),
                                    }))
                                  }
                                />
                                <button
                                  type="button"
                                  className="btn-question-link"
                                  onClick={() => handleRemoveOption(index, optionIndex)}
                                  disabled={reviewLoading || question.options.length <= 2}
                                >
                                  Xóa
                                </button>
                              </div>
                            ))}
                            {question.options.length < 4 && (
                              <button
                                type="button"
                                className="btn-question-link"
                                onClick={() => handleAddOption(index)}
                                disabled={reviewLoading}
                              >
                                + Thêm lựa chọn
                              </button>
                            )}
                          </div>

                          <label>
                            Giải thích
                            <textarea
                              className="input-text quiz-edit-textarea"
                              value={question.explanation}
                              onChange={(e) =>
                                updateQuestionDraft(index, (current) => ({
                                  ...current,
                                  explanation: e.target.value,
                                }))
                              }
                            />
                          </label>

                          <div className="quiz-edit-grid">
                            <label>
                              Mã nguồn slide (Source ID)
                              <div className="quiz-edit-id-static">
                                {question.citation?.source_id || `SLIDE_${String(index + 1).padStart(2, "0")}`}
                              </div>
                            </label>
                            <label>
                              Mã tài liệu (Parent Source ID)
                              <div className="quiz-edit-id-static">
                                {question.citation?.parent_source_id || reviewDoc?.id || ""}
                              </div>
                            </label>
                          </div>

                          <label>
                            Nội dung trích dẫn (quote)
                            <textarea
                              className="input-text quiz-edit-textarea"
                              value={question.citation?.quote || ""}
                              onChange={(e) =>
                                updateQuestionDraft(index, (current) => ({
                                  ...current,
                                  citation: {
                                    ...(current.citation || { source_id: "", parent_source_id: "", quote: "" }),
                                    quote: e.target.value,
                                  },
                                }))
                              }
                            />
                          </label>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : reviewQuiz ? (
                <div className="quiz-review-list">
                  {reviewQuiz.questions.map((question, index) => {
                    const correctOption = question.options.find(
                      (option) => option.id === question.correctOptionId
                    );

                    return (
                      <div key={question.id} className="quiz-review-question">
                        <div className="quiz-review-question-head">
                          <span className="quiz-review-count">Câu {index + 1}</span>
                          <span className="quiz-review-topic">{question.topic || "Tổng quan"}</span>
                          <span className="quiz-review-difficulty">
                            {DIFFICULTY_LABEL[question.difficulty] || question.difficulty}
                          </span>
                        </div>

                        <h4>{question.question}</h4>

                        <div className="quiz-review-options">
                          {question.options.map((option) => (
                            <div
                              key={option.id}
                              className={`quiz-review-option ${
                                option.id === question.correctOptionId ? "is-correct" : ""
                              }`}
                            >
                              <span className="quiz-review-option-id">{option.id.toUpperCase()}</span>
                              <span>{option.text}</span>
                            </div>
                          ))}
                        </div>

                        <div className="quiz-review-answer">
                          <strong>Đáp án đúng:</strong>{" "}
                          {correctOption
                            ? `${correctOption.id.toUpperCase()}. ${correctOption.text}`
                            : question.correctOptionId.toUpperCase()}
                        </div>

                        <div className="quiz-review-explanation">
                          <strong>Giai thich:</strong> {question.explanation}
                        </div>

                        {question.citation && (
                          <div className="quiz-review-citation">
                            <strong>Nguon slide [{question.citation.chunkId}]:</strong>{" "}
                            {question.citation.quote}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
