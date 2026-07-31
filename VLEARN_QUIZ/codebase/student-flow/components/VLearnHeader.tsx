"use client";

import { UserAccount } from "@/lib/vlearnData";

type Props = {
  currentDocumentTitle: string;
  activeAccount: UserAccount;
  onLogout: () => void;
  activeTab: "reader" | "quiz" | "dashboard";
  onTabChange: (tab: "reader" | "quiz" | "dashboard") => void;
  toolMode: "read" | "pen" | "highlight";
  onToolModeChange: (mode: "read" | "pen" | "highlight") => void;
  zoomLevel: number;
  onZoomChange: (delta: number) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export default function VLearnHeader({
  currentDocumentTitle,
  activeAccount,
  onLogout,
  activeTab,
  onTabChange,
  toolMode,
  onToolModeChange,
  zoomLevel,
  onZoomChange,
  currentPage,
  totalPages,
  onPageChange,
}: Props) {
  return (
    <header className="vlearn-header">
      {/* 1. Brand Logo VLearn */}
      <div className="vlearn-header-left">
        <div className="vlearn-brand" onClick={() => onTabChange("reader")}>
          <div className="vlearn-logo">
            <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 10L18 27L29 10H22L18 17L14 10H7Z" fill="white" />
              <path d="M14 10L18 17L22 10" stroke="#00d2ff" strokeWidth="2.5" />
            </svg>
          </div>
          <span className="vlearn-brand-text">VLearn</span>
        </div>

        <div className="vlearn-doc-info">
          <span className="doc-icon">📖</span>
          <span className="doc-title-text" title={currentDocumentTitle}>
            {currentDocumentTitle}
          </span>
        </div>
      </div>

      {/* 2. Compact Reader ToolBar */}
      {activeTab === "reader" && (
        <div className="vlearn-header-center">
          <div className="tool-group">
            <button
              className={`tool-btn ${toolMode === "read" ? "active" : ""}`}
              onClick={() => onToolModeChange("read")}
              title="Chế độ Đọc"
            >
              📖 <span>Đọc</span>
            </button>
            <button
              className={`tool-btn ${toolMode === "pen" ? "active" : ""}`}
              onClick={() => onToolModeChange("pen")}
              title="Chế độ Vẽ/Bút"
            >
              ✏️ <span>Bút</span>
            </button>
            <button
              className={`tool-btn ${toolMode === "highlight" ? "active" : ""}`}
              onClick={() => onToolModeChange("highlight")}
              title="Chế độ Highlight"
            >
              🖍️ <span>Highlight</span>
            </button>
          </div>

          <div className="divider-vert" />

          <div className="page-nav-group">
            <span className="note-indicator">Trang {currentPage} · 1 note</span>
            <div className="zoom-controls">
              <button onClick={() => onZoomChange(-10)} title="Thu nhỏ">-</button>
              <span className="zoom-val">{zoomLevel}%</span>
              <button onClick={() => onZoomChange(10)} title="Phóng to">+</button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Navigation & Clean Account Switcher */}
      <div className="vlearn-header-right">
        <div className="nav-tabs">
          <button
            className={`tab-btn ${activeTab === "reader" ? "active" : ""}`}
            onClick={() => onTabChange("reader")}
          >
            📚 Slide Bài Học
          </button>
          <button
            className={`tab-btn ${activeTab === "quiz" ? "active" : ""}`}
            onClick={() => onTabChange("quiz")}
          >
            🪄 Quiz AI
          </button>
          {activeAccount.role === "teacher" && (
            <button
              className={`tab-btn tab-teacher ${activeTab === "dashboard" ? "active" : ""}`}
              onClick={() => onTabChange("dashboard")}
            >
              📊 Dashboard Giảng Viên
            </button>
          )}
        </div>

        <div className="divider-vert" />

        <div className="account-switcher-clean">
          <div className="account-chip">
            <span className="account-avatar">{activeAccount.avatar}</span>
            <div>
              <div className="account-name">{activeAccount.name}</div>
              <div className="account-meta">
                {activeAccount.code} · {activeAccount.role === "teacher" ? "Giảng viên" : "Sinh viên"}
              </div>
            </div>
          </div>
          <button className="logout-btn" onClick={onLogout}>
            Đăng xuất
          </button>
        </div>
      </div>
    </header>
  );
}
