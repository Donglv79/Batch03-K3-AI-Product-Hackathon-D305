export type UserRole = "student" | "teacher";

export interface UserAccount {
  id: string;
  name: string;
  role: UserRole;
  avatar: string;
  code: string; // MSSV hoặc Mã Giảng Viên
}

export const USER_ACCOUNTS: UserAccount[] = [
  {
    id: "student-01",
    name: "Sinh Viên VinUni",
    role: "student",
    avatar: "🎓",
    code: "SV20230001",
  },
  {
    id: "teacher-01",
    name: "Giảng Viên VinUni",
    role: "teacher",
    avatar: "👩‍🏫",
    code: "GV_COMP2010",
  },
];

export interface VLearnDocument {
  id: string;
  title: string;
  pages: number;
  status: "PUBLISHED" | "STUDYING" | "DRAFT";
  filename: string;
  fileUrl?: string;
  fileType?: string;
  hasExplanation?: boolean;
  uploadedAt?: string;
}

export interface VLearnDay {
  id: string;
  dayTag: string;
  title: string;
  documents: VLearnDocument[];
}

// Khởi tạo danh sách bài học trống hoàn toàn để người dùng nạp từ đầu
export const VLEARN_CURRICULUM: VLearnDay[] = [];

export interface StudentSubmission {
  id: string;
  studentName: string;
  studentCode: string;
  submittedAt: string;
  scorePct: number;
  correctCount: number;
  totalCount: number;
  status: "Excellence" | "Good" | "Needs Review";
  weakTopics: string[];
}

export interface ClassWeakness {
  topic: string;
  failCount: number;
  percentage: string;
  recommendation: string;
}

export interface TeacherDashboardData {
  totalStudents: number;
  completedCount: number;
  averageScorePct: number;
  recentSubmissions: StudentSubmission[];
  frequentWeakness: ClassWeakness[];
}

export const MOCK_TEACHER_DASHBOARD_DATA: TeacherDashboardData = {
  totalStudents: 0,
  completedCount: 0,
  averageScorePct: 0,
  recentSubmissions: [],
  frequentWeakness: [],
};
