import { Difficulty, Quiz } from "@/lib/mockQuiz";

export type Role2Chunk = {
  source_id: string;
  parent_source_id: string;
  chunk_index: number;
  text: string;
};

export type Role2Document = {
  schema_version: string;
  document_id: string;
  title: string;
  source_type: "transcript" | "pdf" | "text";
  original_filename: string;
  status: string;
  created_at: string;
  statistics: {
    total_chunks: number;
    total_characters: number;
  };
  chunks: Role2Chunk[];
  file_url?: string;
};

export type SavedCurriculumDocument = {
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
  quizStatus?: string | null;
  quizVersion?: number | null;
  chunks?: Role2Chunk[];
};

export type LibraryDay = {
  id: string;
  dayTag: string;
  title: string;
  documents: SavedCurriculumDocument[];
};

export type Role3Question = {
  question_id: string;
  type: string;
  topic: string;
  difficulty: "easy" | "medium" | "hard";
  question: string;
  options: { id: string; text: string }[];
  correct_option_id: string;
  explanation: string;
  citation: {
    source_id: string;
    parent_source_id: string;
    quote: string;
  };
  citation_status: string;
};

export type Role3Quiz = {
  schema_version: string;
  document_id: string;
  quiz_id: string;
  status: "draft" | "published" | "ready" | string;
  created_at: string;
  model: string;
  config: {
    num_questions: number;
    question_type: string;
    difficulty: string;
  };
  questions: Role3Question[];
  warnings: string[];
  trace_path?: string;
  version?: number;
  published_at?: string | null;
  history?: Array<{
    quiz_id: string;
    version: number;
    status: string;
    created_at: string;
    published_at?: string | null;
  }>;
};

export type QuizAttemptRecord = {
  attempt_id: string;
  document_id: string;
  quiz_id: string;
  student_name: string;
  student_code: string;
  score_pct: number;
  correct_count: number;
  total_count: number;
  answers: Record<string, string>;
  submitted_at: string;
  weak_topics?: string[];
  teacher_comment?: string;
  status?: "Excellence" | "Good" | "Needs Review";
  reviewed_at?: string;
  reviewed_by?: string;
};

const DIFFICULTY_MAP: Record<Role3Question["difficulty"], Difficulty> = {
  easy: "remember",
  medium: "understand",
  hard: "apply",
};

export function adaptGeneratedQuiz(response: Role3Quiz, document: Role2Document): Quiz {
  return {
    id: response.quiz_id,
    title: document.title || response.document_id,
    sourceLabel: `${document.source_type.toUpperCase()} — ${document.original_filename}`,
    questions: response.questions.map((question) => ({
      id: question.question_id,
      topic: question.topic,
      difficulty: DIFFICULTY_MAP[question.difficulty],
      question: question.question,
      options: question.options.map((option) => ({
        id: option.id.toLowerCase(),
        text: option.text,
      })),
      correctOptionId: question.correct_option_id.toLowerCase(),
      explanation: question.explanation,
      citation: question.citation
        ? {
            chunkId: question.citation.source_id,
            source: question.citation.parent_source_id,
            quote: question.citation.quote,
          }
        : null,
    })),
  };
}

function getApiBase(): string {
  return process.env.NEXT_PUBLIC_ROLE2_API_BASE || "http://127.0.0.1:8000";
}

export function resolveRole2Url(path?: string | null): string | undefined {
  if (!path) return undefined;
  if (/^https?:\/\//i.test(path)) return path;
  return `${getApiBase()}${path.startsWith("/") ? path : `/${path}`}`;
}

export async function fetchLibrary(): Promise<LibraryDay[]> {
  const res = await fetch(`${getApiBase()}/api/library`, { cache: "no-store" });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to load library");
  }

  let hiddenMap: Record<string, boolean> = {};
  if (typeof window !== "undefined") {
    try {
      hiddenMap = JSON.parse(window.localStorage.getItem("vlearn_hidden_docs") || "{}");
    } catch (e) {
      console.warn("Failed to read hidden docs map", e);
    }
  }

  return ((data.items || []) as LibraryDay[]).map((day) => ({
    ...day,
    documents: day.documents.map((doc) => ({
      ...doc,
      fileUrl: resolveRole2Url(doc.fileUrl),
      hiddenFromStudent: !!hiddenMap[doc.id],
    })),
  }));
}

export async function fetchSavedQuiz(
  documentId: string,
  options?: { includeDraft?: boolean }
): Promise<Role3Quiz | null> {
  const url = new URL(`${getApiBase()}/api/quizzes/${documentId}.json`);
  if (options?.includeDraft) {
    url.searchParams.set("includeDraft", "1");
  }
  const res = await fetch(url.toString(), { cache: "no-store" });
  if (res.status === 404) {
    return null;
  }
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to load quiz");
  }
  return data as Role3Quiz;
}

export async function publishSavedQuiz(documentId: string): Promise<Role3Quiz> {
  const res = await fetch(`${getApiBase()}/api/quizzes/${documentId}/publish`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to publish quiz");
  }
  return data as Role3Quiz;
}

export async function saveQuizDraft(documentId: string, quiz: Role3Quiz): Promise<Role3Quiz> {
  const res = await fetch(`${getApiBase()}/api/quizzes/${documentId}.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(quiz),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to save quiz draft");
  }
  return data as Role3Quiz;
}

export async function fetchQuizAttempts(documentId?: string): Promise<QuizAttemptRecord[]> {
  const url = new URL(`${getApiBase()}/api/quiz-attempts`);
  if (documentId) {
    url.searchParams.set("document_id", documentId);
  }
  const res = await fetch(url.toString(), { cache: "no-store" });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to load quiz attempts");
  }
  return (data.items || []) as QuizAttemptRecord[];
}

export async function saveQuizAttempt(record: QuizAttemptRecord): Promise<QuizAttemptRecord> {
  const res = await fetch(`${getApiBase()}/api/quiz-attempts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(record),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to save quiz attempt");
  }
  return data as QuizAttemptRecord;
}

export async function saveQuizReview(record: Pick<QuizAttemptRecord, "attempt_id" | "document_id" | "teacher_comment" | "status" | "reviewed_by">): Promise<QuizAttemptRecord> {
  const res = await fetch(`${getApiBase()}/api/quiz-reviews`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(record),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to save quiz review");
  }
  return data as QuizAttemptRecord;
}

export async function uploadRole2Document(params: {
  files: File[];
  title: string;
  documentId: string;
  sourcePrefix: string;
}): Promise<Role2Document> {
  const formData = new FormData();
  formData.append("mode", "upload");
  formData.append("source_type", "pdf");
  formData.append("title", params.title);
  formData.append("document_id", params.documentId);
  formData.append("source_prefix", params.sourcePrefix);
  params.files.forEach((file) => formData.append("file", file));

  const res = await fetch(`${getApiBase()}/api/ingest`, {
    method: "POST",
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Upload failed");
  }
  return data as Role2Document;
}

export async function generateRole3Quiz(params: {
  document: Role2Document;
  numQuestions: number;
  difficulty: "all" | Difficulty;
}): Promise<Role3Quiz> {
  const res = await fetch(`${getApiBase()}/api/generate-quiz`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      document: params.document,
      config: {
        num_questions: params.numQuestions,
        question_type: "single_choice",
        difficulty: params.difficulty,
      },
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Quiz generation failed");
  }
  return data as Role3Quiz;
}
