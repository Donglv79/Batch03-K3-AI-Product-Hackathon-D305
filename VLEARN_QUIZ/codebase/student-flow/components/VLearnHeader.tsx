"use client";

import { UserAccount, USER_ACCOUNTS } from "@/lib/vlearnData";

type Props = {
  currentDocumentTitle: string;
  activeAccount: UserAccount;
  onSwitchAccount: (account: UserAccount) => void;
  activeTab: "reader" | "quiz" | "dashboard";
  onTabChange: (tab: "reader" | "quiz" | "dashboard") => void;
  zoomLevel: number;
  onZoomChange: (delta: number) => void;
};

export default function VLearnHeader({
  currentDocumentTitle,
  activeAccount,
  onSwitchAccount,
  activeTab,
  onTabChange,
  zoomLevel,
  onZoomChange,
}: Props) {
  return (
    <header className="vlearn-header">
      <div className="vlearn-header-left">
        <button className="vlearn-brand" onClick={() => onTabChange("reader")}>
          <span className="vlearn-logo" aria-hidden="true">V</span>
          <span className="vlearn-brand-text">VLearn</span>
        </button>
        <div className="vlearn-doc-info" title={currentDocumentTitle}>
          <span className="doc-context-label">Đang học</span>
          <span className="doc-title-text">{currentDocumentTitle}</span>
        </div>
      </div>

      <nav className="nav-tabs" aria-label="Điều hướng chính">
        <button
          className={`tab-btn ${activeTab === "reader" ? "active" : ""}`}
          onClick={() => onTabChange("reader")}
        >
          Tài liệu
        </button>
        <button
          className={`tab-btn ${activeTab === "quiz" ? "active" : ""}`}
          onClick={() => onTabChange("quiz")}
        >
          Quiz
        </button>
        {activeAccount.role === "teacher" && (
          <button
            className={`tab-btn ${activeTab === "dashboard" ? "active" : ""}`}
            onClick={() => onTabChange("dashboard")}
          >
            Tổng quan lớp
          </button>
        )}
      </nav>

      <div className="vlearn-header-right">
        {activeTab === "reader" && (
          <div className="zoom-controls" aria-label="Thu phóng tài liệu">
            <button onClick={() => onZoomChange(-10)} aria-label="Thu nhỏ">−</button>
            <span className="zoom-val">{zoomLevel}%</span>
            <button onClick={() => onZoomChange(10)} aria-label="Phóng to">+</button>
          </div>
        )}
        <select
          className="role-select-clean"
          aria-label="Chọn tài khoản demo"
          value={activeAccount.id}
          onChange={(event) => {
            const selected = USER_ACCOUNTS.find((account) => account.id === event.target.value);
            if (selected) onSwitchAccount(selected);
          }}
        >
          {USER_ACCOUNTS.map((account) => (
            <option key={account.id} value={account.id}>
              {account.name} · {account.role === "teacher" ? "Giảng viên" : "Sinh viên"}
            </option>
          ))}
        </select>
      </div>
    </header>
  );
}
