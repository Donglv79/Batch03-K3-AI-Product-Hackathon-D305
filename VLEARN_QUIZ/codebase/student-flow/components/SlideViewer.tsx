"use client";

import { Role2Document } from "@/lib/quizBridge";
import { VLearnDocument } from "@/lib/vlearnData";

type Props = {
  document: VLearnDocument;
  uploadedRole2Doc?: Role2Document | null;
  currentPage: number;
  totalPages: number;
  zoomLevel: number;
  toolMode: "read" | "pen" | "highlight";
  onPageChange: (page: number) => void;
  onOpenQuiz: () => void;
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
}: Props) {
  const cleanTitle = document.title || document.filename.replace(/\.[^/.]+$/, "");
  const isPdfUpload =
    !!document.fileUrl &&
    (document.fileType === "application/pdf" || /\.pdf$/i.test(document.filename));

  if (isPdfUpload && document.fileUrl) {
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
            <a className="pdf-open-link" href={document.fileUrl} target="_blank" rel="noreferrer">
              Mở PDF
            </a>
          </div>
          <iframe
            className="pdf-reader-frame"
            key={`${document.id}-${currentPage}`}
            src={`${document.fileUrl}#page=${currentPage}&toolbar=0&navpanes=0&scrollbar=1&view=FitH`}
            title={cleanTitle}
          />
        </div>

        <div className="slide-floating-bottom-bar">
          <button className="btn-take-quiz-floating" onClick={onOpenQuiz}>
            Tạo quiz từ tài liệu
          </button>
        </div>
      </div>
    );
  }

  // Đọc nội dung văn bản THẬT bóc tách từng slide từ Backend Python
  const hasRealChunks = uploadedRole2Doc && uploadedRole2Doc.chunks && uploadedRole2Doc.chunks.length > 0;

  // Gom các chunk theo đúng từng mã SLIDE thật (SLIDE_01, SLIDE_02, SLIDE_03...)
  const slideMap = new Map<string, string[]>();

  if (hasRealChunks) {
    uploadedRole2Doc.chunks.forEach((chunk) => {
      // Lấy prefix mã slide (Ví dụ: SLIDE_01, SLIDE_18)
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
      {/* Hiển Thị Tất Cả Trang Slide Chuẩn Văn Bản Thật Bóc Tách Từ File Slide Của Bạn */}
      <div className="slide-list-vertical" style={{ transform: `scale(${zoomLevel / 100})` }}>
        {Array.from({ length: displayPagesCount }, (_, i) => {
          const pageNum = i + 1;
          const slideKey = slideKeys[i];
          const rawTexts = slideKey ? slideMap.get(slideKey) || [] : [];
          const fullText = rawTexts.join("\n");

          // Trích xuất dòng đầu tiên làm Tiêu đề thật của Slide này
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
              {/* Header của Slide */}
              <div className="slide-real-header">
                <span className="slide-real-tag">
                  {pageNum === 1 ? "TRANG BÌA SLIDE" : `SLIDE CHÍNH THỨC ${pageNum}`}
                </span>
                <span className="slide-real-page-num">
                  Trang {pageNum} / {displayPagesCount}
                </span>
              </div>

              {/* Thân Nội Dung Slide Đọc Đúng Văn Bản Bóc Tách Từ File PPTX Của Bạn */}
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

              {/* Footer của Slide */}
              <div className="slide-real-footer">
                <span>{document.filename} · VinUniversity</span>
                <span className="footer-line-accent" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Action Button Nổi Phía Dưới */}
      <div className="slide-floating-bottom-bar">
        <button className="btn-take-quiz-floating" onClick={onOpenQuiz}>
          Tạo quiz từ {displayPagesCount} slide
        </button>
      </div>
    </div>
  );
}
