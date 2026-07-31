/**
 * Contract đề xuất với Person 3 (Gemini Quiz Engine) và Person 2 (Nạp dữ liệu).
 * Student Flow chỉ ĐỌC theo shape này — khi Person 3 có endpoint thật, thay
 * QUIZZES[...] trong buildQuiz() bằng response thật cùng shape, phần render
 * (components/) không cần đổi.
 *
 * citation.chunkId dùng chung cho cả 2 kiểu nguồn đã có trong data pack:
 * "[Txx-NNN]" cho transcript, "Slide NN" cho slide — UI không phân biệt hai
 * dạng này, chỉ hiển thị nguyên văn.
 */

export type Difficulty = "remember" | "understand" | "apply";

export type Option = { id: string; text: string };

export type Citation = {
  chunkId: string;
  source: string;
  quote: string;
} | null;

export type Question = {
  id: string;
  topic: string;
  difficulty: Difficulty;
  question: string;
  options: Option[];
  correctOptionId: string;
  explanation: string;
  citation: Citation;
};

export type Quiz = {
  id: string;
  title: string;
  sourceLabel: string;
  questions: Question[];
};

export type Lecture = {
  id: string;
  dayTag: string;
  title: string;
  transcriptLabel: string;
  chunkCount: number;
  quizId: string | null;
};

export const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  remember: "Kiến thức nền tảng (Remember)",
  understand: "Hiểu bản chất (Understand)",
  apply: "Tình huống áp dụng (Apply)",
};

export const LECTURES: Lecture[] = [
  { id: "t01", dayTag: "DAY 2 (SÁNG)", title: "Xác định bài toán kinh doanh cho AI", transcriptLabel: "Transcript #01", chunkCount: 89, quizId: null },
  { id: "t02", dayTag: "DAY 2", title: "Chỉ số thành công & mức tự động hoá", transcriptLabel: "Transcript #02", chunkCount: 43, quizId: null },
  { id: "t03", dayTag: "DAY 2 (CHIỀU)", title: "Soi bài toán các nhóm · tự động hoá & ràng buộc", transcriptLabel: "Transcript #03", chunkCount: 154, quizId: null },
  { id: "t04", dayTag: "DAY 1", title: "Foundation: cách LLM hoạt động", transcriptLabel: "Transcript #04", chunkCount: 98, quizId: "quiz-day1-foundation" },
  { id: "t05", dayTag: "BUỔI CHUYÊN ĐỀ", title: "Bài toán · đánh giá · dữ liệu", transcriptLabel: "Transcript #05", chunkCount: 154, quizId: null },
  { id: "t06", dayTag: "BUỔI CHUYÊN ĐỀ", title: "Foundation: transformer & attention", transcriptLabel: "Transcript #06", chunkCount: 162, quizId: null },
];

export const QUESTION_COUNT_OPTIONS = [
  { value: 10, label: "10 Câu (Nhanh · ~8 phút)" },
  { value: 15, label: "15 Câu (Mặc định · ~12 phút)" },
  { value: 20, label: "20 Câu (Bao quát · ~16 phút)" },
  { value: 25, label: "25 Câu (Chuyên sâu · ~20 phút)" },
  { value: 30, label: "30 Câu (Rất chi tiết · ~25 phút)" },
];

export const DIFFICULTY_OPTIONS: { value: "all" | Difficulty; label: string }[] = [
  { value: "all", label: "Tất cả mức độ" },
  { value: "remember", label: DIFFICULTY_LABEL.remember },
  { value: "understand", label: DIFFICULTY_LABEL.understand },
  { value: "apply", label: DIFFICULTY_LABEL.apply },
];

export const QUIZZES: Record<string, Quiz> = {
  "quiz-day1-foundation": {
    id: "quiz-day1-foundation",
    title: "Foundation: cách LLM hoạt động",
    sourceLabel: "Day 1 — Foundation (transcript-04-clean.md)",
    questions: [
      {
        id: "q1",
        topic: "Lịch sử AI",
        difficulty: "remember",
        question: "Theo bài giảng, phép thử Turing (Turing test) dùng để kiểm tra điều gì?",
        options: [
          { id: "a", text: "Tốc độ xử lý của máy tính" },
          { id: "b", text: "Khả năng khiến người hỏi không phân biệt được đâu là máy, đâu là người khi trả lời" },
          { id: "c", text: "Độ chính xác khi giải các bài toán số học" },
          { id: "d", text: "Dung lượng bộ nhớ mà máy tính xử lý được" },
        ],
        correctOptionId: "b",
        explanation:
          "Người hỏi đặt cùng một câu hỏi cho máy và cho người ở hai phòng riêng; nếu không đoán được bên nào là máy, máy được coi là đã vượt qua Turing test.",
        citation: {
          chunkId: "T04-018",
          source: "transcript-04-clean.md",
          quote:
            "Bài đấy đơn giản: có một người tester là con người ngồi ở một phòng; bên trái là máy tính và bên phải là một người khác... Nếu người này không đoán ra được bên nào là máy, bên nào là người, tức là cái máy đấy đã vượt qua bài test thành công.",
        },
      },
      {
        id: "q2",
        topic: "Lịch sử AI",
        difficulty: "understand",
        question: "Cách tiếp cận \"symbolic AI\" (dạy máy bằng luật) chạm trần chủ yếu vì lý do gì?",
        options: [
          { id: "a", text: "Máy tính thời đó chưa có màn hình đồ hoạ" },
          { id: "b", text: "Không có nhà đầu tư nào quan tâm đến AI" },
          { id: "c", text: "Con người không thể liệt kê hết mọi luật cho một thế giới quá nhiều bối cảnh, quá phức tạp" },
          { id: "d", text: "Luật viết ra bị lỗi cú pháp thường xuyên" },
        ],
        correctOptionId: "c",
        explanation:
          "Symbolic AI làm tốt với task đủ hẹp có thể liệt kê hết luật, nhưng thế giới thực có quá nhiều bối cảnh và tổ hợp lựa chọn — con người không thể viết ra hết luật.",
        citation: {
          chunkId: "T04-025",
          source: "transcript-04-clean.md",
          quote:
            "Chạm trần là bởi vì việc đấy có thể làm rất tốt, nhưng chỉ làm tốt cho một task đủ hẹp thôi... thế giới rộng lớn hơn nhiều: quá nhiều bối cảnh, quá nhiều sự phức tạp... con người không thể nào liệt kê hết được tất cả các luật của thế giới.",
        },
      },
      {
        id: "q3",
        topic: "Lịch sử AI",
        difficulty: "understand",
        question: "Cách tiếp cận \"perceptron\" khác gì so với symbolic AI (dạy máy bằng luật)?",
        options: [
          { id: "a", text: "Perceptron dùng rất nhiều ví dụ dữ liệu để máy tự học, thay vì con người viết luật sẵn" },
          { id: "b", text: "Perceptron vẫn viết luật nhưng chi tiết và dài hơn" },
          { id: "c", text: "Perceptron không cần dữ liệu để hoạt động" },
          { id: "d", text: "Perceptron chỉ áp dụng được cho xử lý âm thanh" },
        ],
        correctOptionId: "a",
        explanation:
          "Perceptron đặt nền móng cho deep learning: thay vì viết luật, cho máy học từ rất nhiều ví dụ dữ liệu — dù thời đó phần cứng chưa đủ mạnh để hướng này thành công ngay.",
        citation: {
          chunkId: "T04-026",
          source: "transcript-04-clean.md",
          quote:
            "Sau đấy họ có cách tiếp cận thứ hai, là perceptron... thay vì viết luật ra thì sẽ dùng ví dụ. Thay vì viết luật, mình cho rất nhiều ví dụ để máy có thể học.",
        },
      },
      {
        id: "q4",
        topic: "Lịch sử AI",
        difficulty: "apply",
        question: "Hệ chuyên gia (expert system) gặp vấn đề gì khiến AI rơi vào \"mùa đông\" lần hai?",
        options: [
          { id: "a", text: "Bị cấm sử dụng vì lý do đạo đức nghiên cứu" },
          { id: "b", text: "Tri thức phải nhập bằng tay và luật phải cập nhật liên tục mỗi khi bối cảnh thay đổi" },
          { id: "c", text: "Không công ty nào chịu thử nghiệm hệ chuyên gia" },
          { id: "d", text: "Chi phí phần cứng giảm quá nhanh nên bị ngừng đầu tư" },
        ],
        correctOptionId: "b",
        explanation:
          "Expert system vẫn cần chuyên gia liệt kê luật bằng tay; khi bối cảnh đổi, cả chuỗi luật phải sửa lại — không bền, dẫn tới mùa đông AI lần hai (~1980–2010).",
        citation: {
          chunkId: "T04-029",
          source: "transcript-04-clean.md",
          quote:
            "Thứ nhất: tri thức luôn phải nhập bằng tay... Thứ hai: bối cảnh thế giới luôn thay đổi, và luật phải cập nhật lại liên tục... Điều đấy lại dẫn đến mùa đông lần hai.",
        },
      },
      {
        id: "q5",
        topic: "Deep Learning & Dữ liệu",
        difficulty: "apply",
        question:
          "Khác biệt cốt lõi giữa deep learning và machine learning truyền thống (theo ví dụ nhận diện chó/mèo) là gì?",
        options: [
          { id: "a", text: "Deep learning tự học đặc trưng từ dữ liệu thô qua mạng nhiều tầng, không cần người mô tả đặc trưng" },
          { id: "b", text: "Deep learning không cần bất kỳ dữ liệu gán nhãn nào" },
          { id: "c", text: "Machine learning truyền thống nhanh hơn deep learning trong mọi trường hợp" },
          { id: "d", text: "Deep learning chỉ dùng được cho dữ liệu dạng bảng" },
        ],
        correctOptionId: "a",
        explanation:
          "Với machine learning truyền thống, con người phải tự mô tả đặc trưng (bao nhiêu chân, hình dáng...); deep learning đưa dữ liệu thô vào và mạng nhiều tầng tự nhận diện đặc trưng.",
        citation: {
          chunkId: "T04-032",
          source: "transcript-04-clean.md",
          quote:
            "Trước khi có deep learning, với machine learning, bạn sẽ phải là người tự gán nhãn... phải viết ra những đặc trưng mô tả đấy để mô hình nhìn vào... Còn ở phía dưới, với deep learning, bạn đưa hết tất cả dữ liệu đấy vào, và máy tự động phân loại, tự học.",
        },
      },
      {
        id: "q6",
        topic: "Deep Learning & Dữ liệu",
        difficulty: "remember",
        question: "Bộ dữ liệu nền móng đầu tiên thúc đẩy cả ngành deep learning, theo bài giảng, gắn với ai?",
        options: [
          { id: "a", text: "Alan Turing" },
          { id: "b", text: "Fei-Fei Li" },
          { id: "c", text: "Một nhóm kỹ sư ẩn danh tại FPT" },
          { id: "d", text: "Một quỹ đầu tư mạo hiểm ở Thung lũng Silicon" },
        ],
        correctOptionId: "b",
        explanation:
          "Fei-Fei Li cùng cộng sự dán nhãn tay bộ dữ liệu đầu tiên (tiền thân của ImageNet) và công khai cho cộng đồng nghiên cứu — nền móng dữ liệu chất lượng cho deep learning.",
        citation: {
          chunkId: "T04-031",
          source: "transcript-04-clean.md",
          quote:
            "Nền móng đầu tiên của dữ liệu đấy là một bộ dữ liệu của bà Fei-Fei Li — bà ấy là một leader trong ngành AI... Xuất xứ là bà ấy... ngồi label bằng tay bộ dữ liệu đầu tiên... và công khai nó trên thế giới.",
        },
      },
      {
        id: "q7",
        topic: "Deep Learning & Dữ liệu",
        difficulty: "remember",
        question: "Mô hình deep learning nền tảng đầu tiên (ra đời năm 2006) được huấn luyện trên bao nhiêu tỷ tham số?",
        options: [
          { id: "a", text: "1.7 tỷ" },
          { id: "b", text: "12 tỷ" },
          { id: "c", text: "175 tỷ" },
          { id: "d", text: "Không xác định được từ tài liệu buổi học" },
        ],
        correctOptionId: "d",
        explanation:
          "Transcript chỉ nhắc mốc năm 2006 và ý tưởng deep learning, không nêu số tham số cụ thể. Đây là câu hỏi minh hoạ trường hợp AI KHÔNG có căn cứ trong nguồn — hệ thống phải báo rõ thay vì bịa số liệu (lớp ① Nguồn sự thật).",
        citation: null,
      },
    ],
  },
};

export function ungroundedIdsFor(quiz: Quiz): string[] {
  return quiz.questions.filter((q) => !q.citation).map((q) => q.id);
}

export function buildQuiz(
  lectureId: string,
  questionCount: number,
  difficulty: "all" | Difficulty
): Quiz | null {
  const lecture = LECTURES.find((l) => l.id === lectureId);
  if (!lecture || !lecture.quizId) return null;

  const base = QUIZZES[lecture.quizId];
  let questions = base.questions;
  if (difficulty !== "all") {
    const filtered = questions.filter((q) => q.difficulty === difficulty);
    if (filtered.length > 0) questions = filtered; // bộ lọc rỗng -> fallback dùng cả bộ
  }
  questions = questions.slice(0, questionCount);

  return { ...base, questions };
}

export function statusForScorePct(pct: number): { color: string; label: string } {
  if (pct >= 80) return { color: "var(--status-good)", label: "Tốt" };
  if (pct >= 60) return { color: "var(--status-warning)", label: "Khá — nên xem lại vài chỗ" };
  if (pct >= 40) return { color: "var(--status-serious)", label: "Cần ôn lại" };
  return { color: "var(--status-critical)", label: "Yếu — nên học lại buổi này" };
}

export type FeedbackEntry = {
  who: string;
  role: string;
  comment: string;
  ts: string;
};
