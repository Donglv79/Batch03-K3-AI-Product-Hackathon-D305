"use client";

import { useRef, useState } from "react";

const ACCEPTED_TYPES = ".pptx,.pdf";

export default function UploadSlidePanel() {
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function acceptFile(file: File | undefined) {
    if (!file) return;
    const isValidExt = /\.(pptx|pdf)$/i.test(file.name);
    if (!isValidExt) return;
    setFileName(file.name);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragOver(false);
    acceptFile(e.dataTransfer.files?.[0]);
  }

  return (
    <div className="sidebar-section">
      <div className="sidebar-title">📤 TẢI SLIDE BÀI GIẢNG MỚI</div>
      <div
        className={`upload-dropzone${isDragOver ? " drag-over" : ""}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES}
          className="hidden"
          onChange={(e) => acceptFile(e.target.files?.[0])}
        />
        <div className="upload-icon">📄</div>
        <div className="upload-text">
          {fileName ? (
            <strong>{fileName}</strong>
          ) : (
            <>
              Kéo thả file <strong>.pptx</strong> hoặc <strong>.pdf</strong> vào đây,
              <br />
              hoặc bấm để chọn file
            </>
          )}
        </div>
      </div>
      <button className="btn" disabled style={{ width: "100%", marginTop: 10 }}>
        ⏳ Tải lên &amp; Trích xuất (sắp có)
      </button>
      <p className="muted" style={{ marginTop: 8, marginBottom: 0 }}>
        Khung giao diện — xử lý PPTX/PDF thật do Người 2 (Nạp dữ liệu) đảm nhiệm.
      </p>
    </div>
  );
}
