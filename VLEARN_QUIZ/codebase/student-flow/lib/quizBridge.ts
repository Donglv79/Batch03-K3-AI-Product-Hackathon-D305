import { conciseExplanation, Difficulty, Quiz } from "@/lib/mockQuiz";

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
  status: string;
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
      explanation: conciseExplanation(question.explanation),
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

