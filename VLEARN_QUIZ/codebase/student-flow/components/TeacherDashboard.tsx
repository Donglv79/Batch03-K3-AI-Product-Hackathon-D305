"use client";

import { StudentSubmission } from "@/lib/vlearnData";
import { useMemo, useState } from "react";

type Props = {
  activeDocumentTitle: string;
  submissions: StudentSubmission[];
  onOpenQuizForReview?: () => void;
};

function csvCell(value: string | number): string {
  let text = String(value);
  if (/^[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

export default function TeacherDashboard({
  activeDocumentTitle,
  submissions,
  onOpenQuizForReview,
}: Props) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLocaleLowerCase("vi");

  const filteredSubmissions = useMemo(() => {
    if (!normalizedQuery) return submissions;
    return submissions.filter((submission) =>
      [submission.studentName, submission.studentCode, ...submission.weakTopics]
        .join(" ")
        .toLocaleLowerCase("vi")
        .includes(normalizedQuery)
    );
  }, [normalizedQuery, submissions]);

  const frequentWeakness = useMemo(() => {
    const counts = new Map<string, number>();
    submissions.forEach((submission) => {
      new Set(submission.weakTopics).forEach((topic) => {
        counts.set(topic, (counts.get(topic) || 0) + 1);
      });
    });
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([topic, failCount]) => ({
        topic,
        failCount,
        percentage: submissions.length
          ? Math.round((failCount / submissions.length) * 100)
          : 0,
      }));
  }, [submissions]);

  const averageScorePct = submissions.length
    ? Math.round(
        submissions.reduce((total, submission) => total + submission.scorePct, 0) /
          submissions.length
      )
    : 0;
  const needsReviewCount = submissions.filter(
    (submission) => submission.status === "Needs Review"
  ).length;

  function exportCsv() {
    if (!submissions.length) return;
    const rows = [
      ["Sinh viên", "Mã SV", "Thời gian nộp", "Số câu đúng", "Tổng câu", "Tỷ lệ (%)", "Trạng thái", "Chủ đề chưa vững"],
      ...submissions.map((submission) => [
        submission.studentName,
        submission.studentCode,
        submission.submittedAt,
        submission.correctCount,
        submission.totalCount,
        submission.scorePct,
        submission.status,
        submission.weakTopics.join("; "),
      ]),
    ];
    const csv = `\uFEFF${rows.map((row) => row.map(csvCell).join(",")).join("\r\n")}`;
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `vlearn-ket-qua-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="teacher-dashboard-container">
      <div className="dashboard-banner">
        <div className="banner-left">
          <span className="badge-dash">DÀNH CHO GIẢNG VIÊN · DỮ LIỆU PHIÊN DEMO</span>
          <h1>📊 Báo Cáo & Thống Kê Tiến Độ Bài Học</h1>
          <p className="subtitle">
            Kết quả phát sinh trong phiên trình duyệt này, chưa phải dữ liệu lớp thật · tài liệu:{" "}
            <strong>{activeDocumentTitle}</strong>
          </p>
        </div>
        <div className="banner-actions">
          <button
            className="btn-export-excel"
            onClick={exportCsv}
            disabled={!submissions.length}
            title={submissions.length ? "Tải file CSV mở bằng Excel" : "Chưa có lượt nộp để xuất"}
          >
            📥 Xuất bảng điểm CSV
          </button>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon icon-blue">📝</div>
          <div className="kpi-details">
            <span className="kpi-label">Lượt nộp trong phiên</span>
            <div className="kpi-value-row"><span className="kpi-value">{submissions.length}</span></div>
            <span className="kpi-subtext">Không lưu sau khi tải lại trang</span>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon icon-green">🎯</div>
          <div className="kpi-details">
            <span className="kpi-label">Điểm trung bình</span>
            <div className="kpi-value-row"><span className="kpi-value">{averageScorePct}%</span></div>
            <span className="kpi-subtext">Tính từ các lượt nộp trong phiên</span>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon icon-orange">⚠️</div>
          <div className="kpi-details">
            <span className="kpi-label">Lượt cần hỗ trợ ôn tập</span>
            <div className="kpi-value-row"><span className="kpi-value text-warning">{needsReviewCount}</span></div>
            <span className="kpi-subtext">Điểm dưới 50%</span>
          </div>
        </div>
      </div>

      <div className="dash-card">
        <div className="dash-card-header">
          <h2>🧭 Bản Đồ Lỗ Hổng Kiến Thức Trong Phiên</h2>
          <span className="dash-pill">Tính từ câu trả lời sai</span>
        </div>
        {frequentWeakness.length ? (
          <div className="weakness-grid">
            {frequentWeakness.map((item) => (
              <div className="weakness-card" key={item.topic}>
                <div className="weakness-top">
                  <span className="weakness-title">⚠️ {item.topic}</span>
                  <span className="weakness-pct">{item.percentage}% lượt nộp sai</span>
                </div>
                <p className="weakness-recommendation">
                  {item.failCount} lượt cần ôn lại chủ đề này.
                </p>
                <button
                  className="btn-review-topic"
                  onClick={onOpenQuizForReview}
                  disabled={!onOpenQuizForReview}
                >
                  Mở quiz để giảng lại
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="dashboard-empty">Chưa có câu sai để tổng hợp lỗ hổng kiến thức.</div>
        )}
      </div>

      <div className="dash-card">
        <div className="dash-card-header">
          <h2>📋 Danh Sách Lượt Nộp</h2>
          <div className="table-search-box">
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm sinh viên, MSSV, chủ đề..."
              className="input-search"
              aria-label="Tìm trong danh sách lượt nộp"
            />
          </div>
        </div>

        {filteredSubmissions.length ? (
          <div className="table-responsive">
            <table className="teacher-table">
              <thead><tr><th>Sinh viên</th><th>Mã SV</th><th>Thời gian nộp</th><th>Số câu đúng</th><th>Tỷ lệ</th><th>Trạng thái</th><th>Chủ đề chưa vững</th></tr></thead>
              <tbody>
                {filteredSubmissions.map((submission) => (
                  <tr key={submission.id}>
                    <td className="font-semibold">{submission.studentName}</td>
                    <td className="text-muted">{submission.studentCode}</td>
                    <td className="text-muted">{submission.submittedAt}</td>
                    <td><strong>{submission.correctCount}</strong>/{submission.totalCount}</td>
                    <td><span className={`score-badge ${submission.scorePct >= 80 ? "score-high" : submission.scorePct >= 50 ? "score-mid" : "score-low"}`}>{submission.scorePct}%</span></td>
                    <td><span className={`tag-status ${submission.status === "Excellence" ? "tag-excellence" : submission.status === "Good" ? "tag-good" : "tag-review"}`}>{submission.status === "Excellence" ? "Nắm rất vững" : submission.status === "Good" ? "Đạt yêu cầu" : "Cần xem lại"}</span></td>
                    <td>{submission.weakTopics.length ? <div className="weak-topic-tags">{submission.weakTopics.map((topic) => <span className="weak-tag" key={topic}>{topic}</span>)}</div> : <span className="text-good">✓ Không có lỗ hổng</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="dashboard-empty">
            {submissions.length ? "Không tìm thấy lượt nộp phù hợp." : "Chưa có lượt nộp. Hãy làm và nộp một quiz bằng tài khoản học viên."}
          </div>
        )}
      </div>
    </div>
  );
}
