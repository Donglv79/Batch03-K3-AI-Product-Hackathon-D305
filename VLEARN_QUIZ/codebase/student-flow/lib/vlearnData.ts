export type UserRole = "student" | "teacher";

export interface UserAccount {
  id: string;
  name: string;
  role: UserRole;
  avatar: string;
  code: string; // MSSV hoặc Mã Giảng Viên
  loginId: string;
  password: string;
}

export const USER_ACCOUNTS: UserAccount[] = [
  {
    id: "student-01",
    name: "Sinh Viên VinUni",
    role: "student",
    avatar: "🎓",
    code: "SV20230001",
    loginId: "sv20230001",
    password: "student123",
  },
  {
    id: "teacher-01",
    name: "Giảng Viên VinUni",
    role: "teacher",
    avatar: "👩‍🏫",
    code: "GV_COMP2010",
    loginId: "gv_comp2010",
    password: "teacher123",
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
  quizId?: string | null;
  quizAvailable?: boolean;
  hiddenFromStudent?: boolean;
  quizStatus?: string | null;
  quizVersion?: number | null;
  chunks?: {
    source_id: string;
    parent_source_id: string;
    chunk_index: number;
    text: string;
  }[];
}

export interface VLearnDay {
  id: string;
  dayTag: string;
  title: string;
  documents: VLearnDocument[];
}

export const VLEARN_CURRICULUM: VLearnDay[] = [];

export interface StudentSubmission {
  id: string;
  attemptId?: string;
  documentId?: string;
  quizId?: string;
  studentName: string;
  studentCode: string;
  submittedAt: string;
  scorePct: number;
  correctCount: number;
  totalCount: number;
  status: "Excellence" | "Good" | "Needs Review";
  weakTopics: string[];
  teacherComment?: string;
  evaluatedAt?: string;
  evaluatedBy?: string;
}

export interface ClassWeakness {
  topic: string;
  failCount: number;
  percentage: string;
  recommendation: string;
  slideRef?: string;
}

export interface TeacherDashboardData {
  totalStudents: number;
  completedCount: number;
  averageScorePct: number;
  recentSubmissions: StudentSubmission[];
  frequentWeakness: ClassWeakness[];
}

export const INITIAL_STUDENT_SUBMISSIONS: StudentSubmission[] = [];

export const MOCK_TEACHER_DASHBOARD_DATA: TeacherDashboardData = {
  totalStudents: 0,
  completedCount: 0,
  averageScorePct: 0,
  recentSubmissions: [],
  frequentWeakness: [],
};
