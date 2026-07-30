"use client";

import { MOCK_TEACHER_DASHBOARD_DATA, StudentSubmission } from "@/lib/vlearnData";
import { useState } from "react";

type Props = {
  activeDocumentTitle: string;
  onOpenQuizForReview?: () => void;
};

export default function TeacherDashboard({ activeDocumentTitle }: Props) {
  const [submissions] = useState<StudentSubmission[]>(
    MOCK_TEACHER_DASHBOARD_DATA.recentSubmissions
  );
  const data = MOCK_TEACHER_DASHBOARD_DATA;
  const completionPct = data.totalStudents
    ? (data.completedCount / data.totalStudents) * 100
    : 0;

  return (
    <div className="teacher-dashboard-container">
      {/* Header Dashboard Banner */}
      <div className="dashboard-banner">
        <div className="banner-left">
          <span className="badge-dash">DÀNH CHO GIẢNG VIÊN</span>
          <h1>📊 Báo Cáo & Thống Kê Tiến Độ Bài Học</h1>
          <p className="subtitle">
            Phân tích kết quả làm bài Quiz AI từ tài liệu: <strong>{activeDocumentTitle}</strong>
          </p>
        </div>
        <div className="banner-actions">
          <button className="btn-export-excel">📥 Xuất Bảng Điểm (Excel)</button>
        </div>
      </div>

      {/* KPI Cards Overview */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon icon-blue">👥</div>
          <div className="kpi-details">
            <span className="kpi-label">Sinh viên đã nộp bài</span>
            <div className="kpi-value-row">
              <span className="kpi-value">{data.completedCount}</span>
              <span className="kpi-total">/{data.totalStudents} SV</span>
            </div>
            <div className="kpi-bar">
              <div
                className="kpi-fill"
                style={{ width: `${completionPct}%` }}
              />
            </div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon icon-green">🎯</div>
          <div className="kpi-details">
            <span className="kpi-label">Điểm trung bình cả lớp</span>
            <div className="kpi-value-row">
              <span className="kpi-value">{data.averageScorePct}%</span>
              <span className="kpi-status-text">Khá giỏi</span>
            </div>
            <span className="kpi-subtext">Cao hơn 8% so với bài học trước</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon icon-orange">⚠️</div>
          <div className="kpi-details">
            <span className="kpi-label">Số SV cần hỗ trợ ôn tập</span>
            <div className="kpi-value-row">
              <span className="kpi-value text-warning">
                {submissions.filter((s) => s.status === "Needs Review").length}
              </span>
              <span className="kpi-total">Sinh viên</span>
            </div>
            <span className="kpi-subtext">Cần giải thích lại JSON Schema</span>
          </div>
        </div>
      </div>

      {/* Section 2: Top Class Knowledge Gaps */}
      <div className="dash-card">
        <div className="dash-card-header">
          <h2>🧭 Bản Đồ Lỗ Hổng Kiến Thức Của Cả Lớp (Top Class Gaps)</h2>
          <span className="dash-pill">Cập nhật tự động từ AI</span>
        </div>
        <div className="weakness-grid">
          {data.frequentWeakness.map((item, idx) => (
            <div className="weakness-card" key={idx}>
              <div className="weakness-top">
                <span className="weakness-title">⚠️ {item.topic}</span>
                <span className="weakness-pct">{item.percentage} học viên sai</span>
              </div>
              <p className="weakness-recommendation">
                💡 <strong>Khuyến nghị Giảng viên:</strong> {item.recommendation}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Section 3: Submissions Table */}
      <div className="dash-card">
        <div className="dash-card-header">
          <h2>📋 Danh Sách Kết Quả Sinh Viên Vừa Nộp Bài</h2>
          <div className="table-search-box">
            <input type="text" placeholder="🔍 Tìm kiếm sinh viên, MSSV..." className="input-search" />
          </div>
        </div>

        <div className="table-responsive">
          <table className="teacher-table">
            <thead>
              <tr>
                <th>Sinh viên</th>
                <th>Mã SV</th>
                <th>Thời gian nộp</th>
                <th>Số câu đúng</th>
                <th>Tỷ lệ (%)</th>
                <th>Trạng thái hiểu bài</th>
                <th>Chủ đề chưa vững</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((sub) => (
                <tr key={sub.id}>
                  <td className="font-semibold">{sub.studentName}</td>
                  <td className="text-muted">{sub.studentCode}</td>
                  <td className="text-muted">{sub.submittedAt}</td>
                  <td>
                    <strong>{sub.correctCount}</strong>/{sub.totalCount}
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
                    {sub.weakTopics.length > 0 ? (
                      <div className="weak-topic-tags">
                        {sub.weakTopics.map((t, i) => (
                          <span key={i} className="weak-tag">
                            {t}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-good">✓ Không có lỗ hổng</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
