// 基本的なレスポンス型
export interface ApiResponse<T> {
  data: T;
  meta?: {
    page: number;
    per_page: number;
    total: number;
  };
}

// エラーレスポンス型
export interface ApiError {
  error: {
    code: string;
    message: string;
  };
}

// ユーザープロファイル
export interface Profile {
  id: string;
  last_login: string | null;
}

// フレーズ
export interface Phrase {
  id: string;
  polish_text: string;
  japanese_text: string;
  category: string;
  created_at: string;
}

// クイズオプション
export interface QuizOption {
  id: string;
  text: string;
}

// クイズ
export interface Quiz {
  id: string;
  phrase_id: string;
  type: 'multiple_choice' | 'yes_no';
  options: QuizOption[];
  answer: string;
  created_at: string;
}

// お気に入り
export interface Favorite {
  id: string;
  user_id: string;
  phrase_id: string;
  created_at: string;
}

// お気に入り（フレーズ情報付き）
export interface FavoriteWithPhrase extends Omit<Favorite, 'phrase_id'> {
  phrase: Phrase;
}

// 学習ログ
export interface Log {
  id: string;
  user_id: string;
  phrase_id: string;
  quiz_id: string | null;
  action: 'study' | 'quiz' | 'pronounce';
  result: number | null;
  created_at: string;
}

// ユーザー統計
export interface UserStats {
  total_phrases_studied: number;
  total_quizzes: number;
  quiz_accuracy: number;
  average_pronunciation_score: number;
}

// 認証関連
export interface SignupRequest {
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface AuthResponse {
  user?: {
    id: string;
    email: string;
  };
  session: {
    access_token: string;
    refresh_token: string;
  };
}

// クイズ回答
export interface QuizAnswerRequest {
  selected: string;
}

export interface QuizAnswerResponse {
  correct: boolean;
  correct_answer: string;
}

// お気に入り登録
export interface FavoriteRequest {
  phrase_id: string;
}

// 発音スコア
export interface PronunciationScoreResponse {
  score: number;
}
