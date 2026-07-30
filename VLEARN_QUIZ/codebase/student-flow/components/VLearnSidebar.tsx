"use client";

import { useState } from "react";
import { Difficulty } from "@/lib/mockQuiz";
import { UserRole, VLearnDay, VLearnDocument } from "@/lib/vlearnData";

type Props = {
  activeRole: UserRole;
  selectedDocument: VLearnDocument | null;
  onSelectDocument: (doc: VLearnDocument, dayTag: string) => void;
  questionCount: number;
  onQuestionCountChange: (n: number) => void;
  difficulty: "all" | Difficulty;
  onDifficultyChange: (d: "all" | Difficulty) => void;
  onGenerateQuiz: () => void;
  isGenerating: boolean;
  canGenerateQuiz: boolean;
  onUploadSlide: (payload: {
    file: File;
    lessonTitle: string;
    hasExplanation: boolean;
    autoGenerateQuizNow: boolean;
  }) => Promise<void>;
  collapsed: boolean;
  onToggleCollapse: () => void;
  curriculumList: VLearnDay[];
};

export default function VLearnSidebar({
  activeRole,
  selectedDocument,
  onSelectDocument,
  questionCount,
  onQuestionCountChange,
  difficulty,
  onDifficultyChange,
  onGenerateQuiz,
  isGenerating,
  canGenerateQuiz,
  onUploadSlide,
  collapsed,
  onToggleCollapse,
  curriculumList,
}: Props) {
  const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>({});

  // Modal Upload Form State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [lessonTitle, setLessonTitle] = useState("");
  const [hasExplanation, setHasExplanation] = useState(true);
  const [autoGenerateQuizNow, setAutoGenerateQuizNow] = useState(false); // Tuỳ chọn sinh Quiz ngay hay xem slide trước
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  function toggleDay(dayId: string) {
    setExpandedDays((prev) => ({ ...prev, [dayId]: !prev[dayId] }));
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) {
      setSelectedFile(f);
      setLessonTitle(f.name.replace(/\.[^/.]+$/, ""));
      setUploadError(null);
      setShowUploadModal(true);
      e.target.value = "";
    }
  }

  async function handleConfirmUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedFile || isUploading) return;
    setIsUploading(true);
    setUploadError(null);
    try {
      await onUploadSlide({
        file: selectedFile,
        lessonTitle: lessonTitle.trim() || selectedFile.name,
        hasExplanation,
        autoGenerateQuizNow,
      });
      setShowUploadModal(false);
      setSelectedFile(null);
      setLessonTitle("");
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Không thể tải tài liệu.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <>
      <aside className={`vlearn-sidebar ${collapsed ? "collapsed" : ""}`}>
        <div className="sidebar-header-box">
          <div className="sidebar-title-wrap">
            <span className="sidebar-icon" aria-hidden="true">▤</span>
            {!collapsed && (
              <div>
                <h3 className="sidebar-title">Tài liệu học tập</h3>
                <p className="sidebar-sub">Nguồn dùng để tạo quiz</p>
              </div>
            )}
          </div>
          <button
            className="collapse-toggle-btn"
            onClick={onToggleCollapse}
            title={collapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
          >
            {collapsed ? "❯" : "❮"}
          </button>
        </div>

        {!collapsed && (
          <>
            {/* Nạp tài liệu mới - Dành cho Giảng Viên */}
            {activeRole === "teacher" && (
              <div className="teacher-upload-card">
                <div className="teacher-upload-title">
                  <span>Tải tài liệu mới</span>
                  <span className="pill-teacher-badge">PDF</span>
                </div>
                <label className="sidebar-upload-dropzone">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                  />
                  <span className="upload-icon" aria-hidden="true">+</span>
                  <span className="upload-lbl">Chọn tệp PDF</span>
                </label>
              </div>
            )}

            {/* Danh Sách Bài Học Theo Accordion */}
            <div className="accordion-list">
              {curriculumList.length === 0 ? (
                <div className="empty-sidebar-msg">
                  <span>📭 Chưa có tài liệu nào</span>
                </div>
              ) : (
                curriculumList.map((day) => {
                  const isExpanded = expandedDays[day.id] !== false;
                  return (
                    <div key={day.id} className="accordion-item">
                      <button
                        className={`accordion-header ${isExpanded ? "active" : ""}`}
                        onClick={() => toggleDay(day.id)}
                      >
                        <div className="day-info">
                          <span className="play-icon">{isExpanded ? "🔽" : "▶"}</span>
                          <span className="day-tag-title">{day.dayTag}</span>
                        </div>
                        <span className="doc-count-badge">{day.documents.length} TÀI LIỆU</span>
                      </button>

                      {isExpanded && (
                        <div className="accordion-content">
                          {day.documents.map((doc) => {
                            const isSelected = selectedDocument?.id === doc.id;
                            return (
                              <button
                                key={doc.id}
                                className={`doc-item-btn ${isSelected ? "selected" : ""}`}
                                onClick={() => onSelectDocument(doc, day.dayTag)}
                              >
                                <div className="doc-item-left">
                                  <span className="doc-type-icon" aria-hidden="true">PDF</span>
                                  <div className="doc-item-meta">
                                    <span className="doc-item-title">{doc.title}</span>
                                    <span className="doc-item-pages">{doc.pages} trang</span>
                                  </div>
                                </div>
                                {doc.status === "STUDYING" && (
                                  <span className="status-studying-badge">Đang học</span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Quick AI Quiz Launcher Section */}
            {curriculumList.length > 0 && (
              <div className="quiz-generator-box">
                <div className="generator-title">
                  <span>Thiết lập quiz</span>
                </div>
                <div className="sidebar-field">
                  <label>Số câu hỏi</label>
                  <select
                    value={questionCount}
                    onChange={(e) => onQuestionCountChange(Number(e.target.value))}
                  >
                    <option value={3}>3 câu · Nhanh</option>
                    <option value={5}>5 câu · Tiêu chuẩn</option>
                    <option value={10}>10 câu · Chuyên sâu</option>
                  </select>
                </div>
                <div className="sidebar-field">
                  <label>Độ khó</label>
                  <select
                    value={difficulty}
                    onChange={(e) => onDifficultyChange(e.target.value as "all" | Difficulty)}
                  >
                    <option value="all">Tất cả độ khó</option>
                    <option value="remember">Nhận biết & Thông hiểu</option>
                    <option value="understand">Vận dụng</option>
                    <option value="apply">Vận dụng cao</option>
                  </select>
                </div>
                <button
                  className="btn-generate-quiz"
                  onClick={onGenerateQuiz}
                  disabled={!canGenerateQuiz || isGenerating}
                >
                  {isGenerating ? "Đang tạo quiz…" : "Tạo quiz từ tài liệu"}
                </button>
                {!canGenerateQuiz && (
                  <p className="generator-hint">
                    {selectedDocument
                      ? "Tài liệu mẫu chưa có dữ liệu nguồn. Hãy tải một PDF mới."
                      : "Chọn một tài liệu để tiếp tục."}
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </aside>

      {/* Modal Cấu Hình Upload Slide Dành Cho Giảng Viên */}
      {showUploadModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>📄 Nạp Slide Bài Giảng Mới</h3>
              <button className="btn-close-modal" onClick={() => setShowUploadModal(false)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleConfirmUpload} className="modal-body">
              <div className="form-group">
                <label>File đã chọn:</label>
                <div className="file-name-badge">📁 {selectedFile?.name}</div>
              </div>

              <div className="form-group">
                <label>Tên bài giảng / Tên môn học:</label>
                <input
                  type="text"
                  className="input-text"
                  value={lessonTitle}
                  onChange={(e) => setLessonTitle(e.target.value)}
                  placeholder="Ví dụ: Bài 01 - Kỹ thuật Machine Learning..."
                  required
                />
              </div>

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={hasExplanation}
                    onChange={(e) => setHasExplanation(e.target.checked)}
                  />
                  <span>Tự động sinh kèm <strong>Bài giải & Trích dẫn nguồn</strong> cho Quiz</span>
                </label>
              </div>

              <div className="form-group checkbox-group" style={{ background: "#eff6ff", borderColor: "#bfdbfe" }}>
                <label className="checkbox-label" style={{ color: "#1e40af" }}>
                  <input
                    type="checkbox"
                    checked={autoGenerateQuizNow}
                    onChange={(e) => setAutoGenerateQuizNow(e.target.checked)}
                  />
                  <span>Bật làm <strong>Quiz AI ngay lập tức</strong> sau khi nạp slide</span>
                </label>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setShowUploadModal(false)}
                  disabled={isUploading}
                >
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary" disabled={isUploading}>
                  {isUploading ? "Đang tải và xử lý…" : "🚀 Tải lên & xem tài liệu"}
                </button>
              </div>
              {uploadError && <p className="modal-error" role="alert">{uploadError}</p>}
            </form>
          </div>
        </div>
      )}
    </>
  );
}
