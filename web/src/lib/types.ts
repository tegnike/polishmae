// ユーザー関連の型
export interface User {
  id: string;
  email: string;
}

export interface Session {
  access_token: string;
  refresh_token: string;
}

export interface AuthResponse {
  user?: User;
  session: Session;
}

// フレーズ関連の型
export interface Phrase {
  id: string;
  polish_text: string;
  japanese_text: string;
  category: string;
  created_at?: string;
}

export interface PhraseListResponse {
  data: Phrase[];
  meta: {
    page: number;
    per_page: number;
    total: number;
  };
}

// クイズ関連の型
export interface QuizOption {
  id: string;
  text: string;
}

export interface Quiz {
  id: string;
  phrase_id: string;
  type: 'multiple_choice' | 'yes_no';
  options: QuizOption[];
  answer: string;
}

export interface QuizListResponse {
  data: Quiz[];
  meta: {
    page: number;
    per_page: number;
    total: number;
  };
}

export interface QuizAnswerResponse {
  correct: boolean;
  correct_answer: string;
}

// 発音練習関連の型
export interface PronunciationResponse {
  score: number;
}

// お気に入り関連の型
export interface Favorite {
  id: string;
  user_id: string;
  phrase_id: string;
  phrase?: Phrase;
  created_at?: string;
}

export interface FavoriteListResponse {
  data: Favorite[];
  meta: {
    page: number;
    per_page: number;
    total: number;
  };
}

// 学習ログ関連の型
export interface Log {
  id: string;
  user_id: string;
  phrase_id: string;
  quiz_id: string | null;
  action: 'study' | 'quiz' | 'pronounce';
  result: number | null;
  created_at: string;
}

export interface LogListResponse {
  data: Log[];
  meta: {
    page: number;
    per_page: number;
    total: number;
  };
}

// 統計関連の型
export interface Stats {
  total_phrases_studied: number;
  total_quizzes: number;
  quiz_accuracy: number;
  average_pronunciation_score: number;
}

// APIエラーレスポンスの型
export interface ApiError {
  error: {
    code: string;
    message: string;
  };
}
