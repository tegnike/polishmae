import { Phrase, Quiz, Favorite, Log, UserStats } from '../models/types';

// モックフレーズデータ
export const mockPhrases: Phrase[] = [
  {
    id: '1',
    polish_text: 'Dzień dobry',
    japanese_text: 'こんにちは',
    category: 'greeting',
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    polish_text: 'Do widzenia',
    japanese_text: 'さようなら',
    category: 'greeting',
    created_at: new Date().toISOString()
  },
  {
    id: '3',
    polish_text: 'Proszę',
    japanese_text: 'お願いします',
    category: 'greeting',
    created_at: new Date().toISOString()
  },
  {
    id: '4',
    polish_text: 'Dziękuję',
    japanese_text: 'ありがとう',
    category: 'greeting',
    created_at: new Date().toISOString()
  },
  {
    id: '5',
    polish_text: 'Przepraszam',
    japanese_text: 'すみません',
    category: 'greeting',
    created_at: new Date().toISOString()
  },
  {
    id: '6',
    polish_text: 'Jak się masz?',
    japanese_text: 'お元気ですか？',
    category: 'greeting',
    created_at: new Date().toISOString()
  },
  {
    id: '7',
    polish_text: 'Poproszę kawę',
    japanese_text: 'コーヒーをください',
    category: 'cafe',
    created_at: new Date().toISOString()
  },
  {
    id: '8',
    polish_text: 'Poproszę herbatę',
    japanese_text: 'お茶をください',
    category: 'cafe',
    created_at: new Date().toISOString()
  },
  {
    id: '9',
    polish_text: 'Ile to kosztuje?',
    japanese_text: 'いくらですか？',
    category: 'shopping',
    created_at: new Date().toISOString()
  },
  {
    id: '10',
    polish_text: 'Gdzie jest toaleta?',
    japanese_text: 'トイレはどこですか？',
    category: 'general',
    created_at: new Date().toISOString()
  }
];

// モッククイズデータ
export const mockQuizzes: Quiz[] = [
  {
    id: '1',
    phrase_id: '1',
    type: 'multiple_choice',
    options: [
      { id: 'a', text: 'こんにちは' },
      { id: 'b', text: 'さようなら' },
      { id: 'c', text: 'ありがとう' },
      { id: 'd', text: 'すみません' }
    ],
    answer: 'a',
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    phrase_id: '2',
    type: 'multiple_choice',
    options: [
      { id: 'a', text: 'こんにちは' },
      { id: 'b', text: 'さようなら' },
      { id: 'c', text: 'ありがとう' },
      { id: 'd', text: 'すみません' }
    ],
    answer: 'b',
    created_at: new Date().toISOString()
  },
  {
    id: '3',
    phrase_id: '4',
    type: 'multiple_choice',
    options: [
      { id: 'a', text: 'こんにちは' },
      { id: 'b', text: 'さようなら' },
      { id: 'c', text: 'ありがとう' },
      { id: 'd', text: 'すみません' }
    ],
    answer: 'c',
    created_at: new Date().toISOString()
  },
  {
    id: '4',
    phrase_id: '5',
    type: 'multiple_choice',
    options: [
      { id: 'a', text: 'こんにちは' },
      { id: 'b', text: 'さようなら' },
      { id: 'c', text: 'ありがとう' },
      { id: 'd', text: 'すみません' }
    ],
    answer: 'd',
    created_at: new Date().toISOString()
  },
  {
    id: '5',
    phrase_id: '7',
    type: 'yes_no',
    options: [
      { id: 'yes', text: 'はい' },
      { id: 'no', text: 'いいえ' }
    ],
    answer: 'yes',
    created_at: new Date().toISOString()
  }
];

// モックお気に入りデータ
export const mockFavorites: Favorite[] = [
  {
    id: '1',
    user_id: 'user-1',
    phrase_id: '1',
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    user_id: 'user-1',
    phrase_id: '4',
    created_at: new Date().toISOString()
  },
  {
    id: '3',
    user_id: 'user-1',
    phrase_id: '7',
    created_at: new Date().toISOString()
  }
];

// モック学習ログデータ
export const mockLogs: Log[] = [
  {
    id: '1',
    user_id: 'user-1',
    phrase_id: '1',
    quiz_id: null,
    action: 'study',
    result: null,
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    user_id: 'user-1',
    phrase_id: '1',
    quiz_id: '1',
    action: 'quiz',
    result: 1,
    created_at: new Date().toISOString()
  },
  {
    id: '3',
    user_id: 'user-1',
    phrase_id: '2',
    quiz_id: '2',
    action: 'quiz',
    result: 0,
    created_at: new Date().toISOString()
  },
  {
    id: '4',
    user_id: 'user-1',
    phrase_id: '1',
    quiz_id: null,
    action: 'pronounce',
    result: 0.85,
    created_at: new Date().toISOString()
  }
];

// モックユーザー統計データ
export const mockUserStats: UserStats = {
  total_phrases_studied: 5,
  total_quizzes: 3,
  quiz_accuracy: 0.67,
  average_pronunciation_score: 0.85
};

// モックユーザーデータ
export const mockUsers = [
  {
    id: 'user-1',
    email: 'test@example.com'
  }
];

// モックセッションデータ
export const mockSessions = {
  'valid-access-token': {
    user_id: 'user-1',
    expires_at: new Date(Date.now() + 3600 * 1000).toISOString()
  }
};
