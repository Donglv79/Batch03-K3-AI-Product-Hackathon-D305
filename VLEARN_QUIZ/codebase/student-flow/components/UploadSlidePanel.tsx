"use client";

import { useRef, useState } from "react";

type Props = {
  busy: boolean;
  statusText: string;
  summary?: {
    documentId: string;
    title: string;
    chunkCount: number;
    totalCharacters: number;
  } | null;
  onUpload: (payload: {
    files: File[];
    title: string;
    documentId: string;
    sourcePrefix: string;
  }) => Promise<void>;
};

const ACCEPTED_TYPES = ".pdf";

export default function UploadSlidePanel({ busy, statusText, summary, onUpload }: Props) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [title, setTitle] = useState("Bai giang 01");
  const [documentId, setDocumentId] = useState("slides_batch_01");
  const [sourcePrefix, setSourcePrefix] = useState("slide");
  const inputRef = useRef<HTMLInputElement>(null);

  function acceptFiles(files: FileList | null) {
    if (!files?.length) return;
    const validFiles = Array.from(files).filter((file) => /\.pdf$/i.test(file.name));
    if (!validFiles.length) return;
    setFileNames(validFiles.map((file) => file.name));
    setSelectedFiles(validFiles);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragOver(false);
    acceptFiles(e.dataTransfer.files);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const files = selectedFiles.length
      ? selectedFiles
      : inputRef.current?.files
        ? Array.from(inputRef.current.files)
        : [];
    if (!files.length) {
      return;
    }
    await onUpload({
      files,
      title,
      documentId,
      sourcePrefix,
    });
  }

  return (
    <form className="sidebar-section" onSubmit={handleSubmit}>
      <div className="sidebar-title">📤 Tải slide bài giảng mới</div>
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
          multiple
          onChange={(e) => acceptFiles(e.target.files)}
        />
        <div className="upload-icon">📄</div>
        <div className="upload-text">
          {fileNames.length ? (
            <strong>{fileNames.length} file đã chọn</strong>
          ) : (
            <>
              Kéo thả file <strong>.pdf</strong> vào đây,
              <br />
              hoặc bấm để chọn file
            </>
          )}
        </div>
      </div>
      <div className="field">
        <label>Tiêu đề:</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div className="field">
        <label>Document ID:</label>
        <input value={documentId} onChange={(e) => setDocumentId(e.target.value)} />
      </div>
      <div className="field">
        <label>Slide prefix:</label>
        <input value={sourcePrefix} onChange={(e) => setSourcePrefix(e.target.value)} />
      </div>
      <button className="btn btn-primary" disabled={busy} style={{ width: "100%", marginTop: 10 }}>
        {busy ? "Đang tải lên..." : "Tải lên & Sinh quiz"}
      </button>
      <p className="muted" style={{ marginTop: 8, marginBottom: 0 }}>
        {statusText || "Xử lý PDF qua Role 2 và sinh quiz qua Role 3."}
      </p>
      {summary && (
        <div className="upload-summary">
          <div className="upload-summary-title">{summary.title}</div>
          <div className="muted">
            {summary.documentId} · {summary.chunkCount} chunks · {summary.totalCharacters} ký tự
          </div>
        </div>
      )}
    </form>
  );
}
