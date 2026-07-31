"use client";

import { useEffect, useState } from "react";
import { Difficulty } from "@/lib/mockQuiz";
import { resolveRole2Url, Role2Document } from "@/lib/quizBridge";
import { UserRole, VLearnDocument } from "@/lib/vlearnData";

type Props = {
  document: VLearnDocument;
  uploadedRole2Doc?: Role2Document | null;
  currentPage: number;
  totalPages: number;
  zoomLevel: number;
  toolMode: "read" | "pen" | "highlight";
  onPageChange: (page: number) => void;
  onOpenQuiz: () => void;
  questionCount: number;
  onQuestionCountChange: (n: number) => void;
  difficulty: "all" | Difficulty;
  onDifficultyChange: (d: "all" | Difficulty) => void;
  activeRole: UserRole;
  onOpenDashboard?: () => void;
  hasCompletedQuiz?: boolean;
};

export default function SlideViewer({
  document,
  uploadedRole2Doc,
  currentPage,
  totalPages,
  zoomLevel,
  toolMode,
  onPageChange,
  onOpenQuiz,
  questionCount,
  onQuestionCountChange,
  difficulty,
  onDifficultyChange,
  activeRole,
  onOpenDashboard,
  hasCompletedQuiz = false,
}: Props) {
  const [customQuestionCount, setCustomQuestionCount] = useState(String(questionCount));
  const cleanTitle = document.title || document.filename.replace(/\.[^/.]+$/, "");
  const isPdfUpload =
    !!document.fileUrl &&
    (document.fileType === "application/pdf" || /\.pdf$/i.test(document.filename));

  const chunks = document.chunks || uploadedRole2Doc?.chunks || [];
  const pdfUrl = resolveRole2Url(document.fileUrl);

  const isTeacher = activeRole === "teacher";
  const isQuizAvailable = !!document.quizAvailable;

  useEffect(() => {
    setCustomQuestionCount(String(questionCount));
  }, [questionCount]);

  function applyCustomQuestionCount() {
    const parsed = Number(customQuestionCount);
    if (!Number.isFinite(parsed)) return;
    const safeCount = Math.min(60, Math.max(1, Math.round(parsed)));
    setCustomQuestionCount(String(safeCount));
    onQuestionCountChange(safeCount);
  }

  const quizGeneratorSection = (
    <div className="slide-quiz-generator-section">
      <div className="slide-quiz-generator-card">
        {isTeacher ? (
          <>
            <div className="slide-quiz-gen-header">
              <div className="slide-quiz-gen-icon-box">
                <span className="slide-quiz-gen-icon">👩‍🏫</span>
              </div>
              <div className="slide-quiz-gen-header-text">
                <h3 className="slide-quiz-gen-title">
                  {isQuizAvailable ? "Cập Nhật Bài Quiz AI Từ Bài Giảng Này" : "Đặt Câu Hỏi AI Từ Bài Giảng Này"}
                </h3>
                <p className="slide-quiz-gen-desc">
                  {isQuizAvailable
                    ? "Bài học này đã được tạo Quiz. Bạn có thể thay đổi số lượng/độ khó và tạo lại bài mới."
                    : "Hệ thống AI sẽ phân tích toàn bộ nội dung slide và sinh câu hỏi trắc nghiệm tự động."}
                </p>
              </div>
            </div>

            <div className="slide-quiz-gen-controls">
              <div className="slide-quiz-gen-field">
                <label>SỐ LƯỢNG CÂU HỎI:</label>
                <select
                  className="slide-quiz-gen-select"
                  value={questionCount}
                  onChange={(e) => {
                    const nextCount = Number(e.target.value);
                    setCustomQuestionCount(String(nextCount));
                    onQuestionCountChange(nextCount);
                  }}
                >
                  <option value={10}>10 câu hỏi (Nhanh)</option>
                  <option value={15}>15 câu hỏi (Mặc định)</option>
                  <option value={20}>20 câu hỏi (Bao quát)</option>
                  <option value={25}>25 câu hỏi (Chuyên sâu)</option>
                  <option value={30}>30 câu hỏi (Rất chi tiết)</option>
                </select>
                <div className="question-count-custom-row">
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={customQuestionCount}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCustomQuestionCount(val);
                      const parsed = Number(val);
                      if (Number.isFinite(parsed) && parsed >= 1 && parsed <= 60) {
                        onQuestionCountChange(Math.round(parsed));
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        applyCustomQuestionCount();
                      }
                    }}
                    aria-label="Nhập số câu hỏi mong muốn"
                    className="custom-count-input"
                  />
                  <button type="button" className="btn-apply-count" onClick={applyCustomQuestionCount}>
                    Áp dụng
                  </button>
                </div>
              </div>

              <div className="slide-quiz-gen-field">
                <label>ĐỘ KHÓ BÀI TEST:</label>
                <select
                  className="slide-quiz-gen-select"
                  value={difficulty}
                  onChange={(e) => onDifficultyChange(e.target.value as "all" | Difficulty)}
                >
                  <option value="all">Tất cả độ khó</option>
                  <option value="remember">Nhận biết & Thông hiểu</option>
                  <option value="understand">Vận dụng</option>
                  <option value="apply">Vận dụng cao</option>
                </select>
              </div>
            </div>

            {isQuizAvailable ? (
              <>
                <div className="slide-quiz-gen-live">
                  Bài quiz này đã được duyệt/xuất bản. Xem trước và chỉnh sửa trong Dashboard Giảng Viên.
                </div>
                <button className="slide-quiz-gen-btn" onClick={onOpenDashboard}>
                  Mở Dashboard Giảng Viên
                </button>
              </>
            ) : (
              <button
                className="slide-quiz-gen-btn"
                onClick={() => {
                  applyCustomQuestionCount();
                  onOpenQuiz();
                }}
              >
                ⚡ Tạo Bài Quiz AI
              </button>
            )}
          </>
        ) : (
          <>
            <div className="slide-quiz-gen-header">
              <div className="slide-quiz-gen-icon-box">
                <span className="slide-quiz-gen-icon">{isQuizAvailable ? "📝" : "⏳"}</span>
              </div>
              <div className="slide-quiz-gen-header-text">
                <h3 className="slide-quiz-gen-title">
                  {isQuizAvailable ? "Làm Bài Quiz AI Đánh Giá Kiến Thức" : "Chưa có Bài Quiz cho tài liệu này"}
                </h3>
                <p className="slide-quiz-gen-desc">
                  {isQuizAvailable
                    ? "Bấm vào nút phía dưới để bắt đầu làm bài Quiz do giảng viên đã chuẩn bị từ slide này."
                    : "Giảng viên của bạn chưa khởi tạo bài trắc nghiệm cho bài học này. Vui lòng quay lại sau."}
                </p>
              </div>
            </div>

            {isQuizAvailable ? (
              hasCompletedQuiz ? (
                <button className="slide-quiz-gen-btn" onClick={onOpenQuiz}>
                  🔁 Làm Lại Bài Quiz AI
                </button>
              ) : (
                <button className="slide-quiz-gen-btn" onClick={onOpenQuiz}>
                  ✍️ Bắt Đầu Làm Bài Quiz AI
                </button>
              )
            ) : (
              <button
                className="slide-quiz-gen-btn btn-disabled"
                disabled
                style={{ background: "#cbd5e1", cursor: "not-allowed", boxShadow: "none" }}
              >
                Chờ Giảng Viên Tạo Bài...
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );

  if (isPdfUpload && pdfUrl) {
    return (
      <div className="slide-scroll-viewer-container">
        <div className="pdf-reader-shell">
          <div className="pdf-reader-header">
            <div>
              <span className="slide-real-tag">PDF GỐC ĐÃ UPLOAD</span>
              <h2>{cleanTitle}</h2>
              <p>
                {document.filename} · {totalPages} trang ·{" "}
                {document.hasExplanation ? "Có sinh bài giải" : "Chưa kèm bài giải"}
              </p>
            </div>
            <a className="pdf-open-link" href={pdfUrl} target="_blank" rel="noreferrer">
              Mở PDF
            </a>
          </div>
          <iframe
            className="pdf-reader-frame"
            src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`}
            title={cleanTitle}
          />
        </div>

        {quizGeneratorSection}
      </div>
    );
  }

  const hasRealChunks = chunks.length > 0;
  const slideMap = new Map<string, string[]>();

  if (hasRealChunks) {
    chunks.forEach((chunk) => {
      const slideKey = chunk.parent_source_id || chunk.source_id.split("-")[0] || "SLIDE_01";
      if (!slideMap.has(slideKey)) {
        slideMap.set(slideKey, []);
      }
      slideMap.get(slideKey)!.push(chunk.text);
    });
  }

  const slideKeys = Array.from(slideMap.keys());
  const displayPagesCount = hasRealChunks ? slideKeys.length : totalPages || 54;

  return (
    <div className="slide-scroll-viewer-container">
      <div className="slide-list-vertical" style={{ transform: `scale(${zoomLevel / 100})` }}>
        {Array.from({ length: displayPagesCount }, (_, i) => {
          const pageNum = i + 1;
          const slideKey = slideKeys[i];
          const rawTexts = slideKey ? slideMap.get(slideKey) || [] : [];
          const fullText = rawTexts.join("\n");

          const lines = fullText
            .split("\n")
            .map((l) => l.trim())
            .filter(Boolean);
          const slideTitle = lines[0] || (pageNum === 1 ? cleanTitle : `Trang Slide ${pageNum}`);
          const bulletLines = lines.slice(1);

          return (
            <div
              key={pageNum}
              id={`slide-page-${pageNum}`}
              className="slide-card-presentation-real"
              style={{
                background: pageNum === 1 ? "#1e293b" : "#ffffff",
                color: pageNum === 1 ? "#ffffff" : "#0f172a",
              }}
            >
              <div className="slide-real-header">
                <span className="slide-real-tag">
                  {pageNum === 1 ? "TRANG BÌA SLIDE" : `SLIDE CHÍNH THỨC ${pageNum}`}
                </span>
                <span className="slide-real-page-num">
                  Trang {pageNum} / {displayPagesCount}
                </span>
              </div>

              <div className="slide-real-body">
                <h1 className="slide-real-title">{slideTitle}</h1>

                {bulletLines.length > 0 ? (
                  <div className="slide-bullets-list">
                    {bulletLines.map((line, idx) => (
                      <div key={idx} className="bullet-row-item-knn">
                        {line}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="slide-real-subtitle">
                    {fullText || "Tài liệu học tập Machine Learning bài giảng VinUniversity"}
                  </p>
                )}
              </div>

              <div className="slide-real-footer">
                <span>{document.filename} · VinUniversity</span>
                <span className="footer-line-accent" />
              </div>
            </div>
          );
        })}
      </div>

      {quizGeneratorSection}
    </div>
  );
}
