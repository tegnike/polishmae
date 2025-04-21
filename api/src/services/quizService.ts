import { supabase, USE_MOCK_DB } from './supabase';
import { mockQuizzes } from './mockData';
import { Quiz, ApiResponse, QuizAnswerResponse } from '../models/types';
import { getPhraseById } from './phraseService';

// クイズの取得（ページネーション、フレーズIDフィルタ対応）
export async function getQuizzes(
  page: number = 1,
  perPage: number = 20,
  phraseId?: string
): Promise<ApiResponse<Quiz[]>> {
  if (USE_MOCK_DB) {
    // モックデータを使用
    let filteredQuizzes = phraseId
      ? mockQuizzes.filter(quiz => quiz.phrase_id === phraseId)
      : mockQuizzes;

    // ページネーション
    const start = (page - 1) * perPage;
    const end = start + perPage;
    const paginatedQuizzes = filteredQuizzes.slice(start, end);

    return {
      data: paginatedQuizzes,
      meta: {
        page,
        per_page: perPage,
        total: filteredQuizzes.length
      }
    };
  } else {
    // Supabaseを使用
    let query = supabase.from('quizzes').select('*', { count: 'exact' });

    // フレーズIDフィルタが指定されている場合
    if (phraseId) {
      query = query.eq('phrase_id', phraseId);
    }

    // ページネーション
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;
    
    const { data, error, count } = await query
      .range(from, to)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch quizzes: ${error.message}`);
    }

    return {
      data: data as Quiz[],
      meta: {
        page,
        per_page: perPage,
        total: count || 0
      }
    };
  }
}

// IDによるクイズの取得
export async function getQuizById(id: string): Promise<Quiz | null> {
  if (USE_MOCK_DB) {
    // モックデータを使用
    const quiz = mockQuizzes.find(q => q.id === id);
    return quiz || null;
  } else {
    // Supabaseを使用
    const { data, error } = await supabase
      .from('quizzes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // レコードが見つからない場合
        return null;
      }
      throw new Error(`Failed to fetch quiz: ${error.message}`);
    }

    return data as Quiz;
  }
}

// クイズの作成
export async function createQuiz(quiz: Omit<Quiz, 'id' | 'created_at'>): Promise<Quiz> {
  // フレーズが存在するか確認
  const phrase = await getPhraseById(quiz.phrase_id);
  if (!phrase) {
    throw new Error(`Phrase with id ${quiz.phrase_id} not found`);
  }

  if (USE_MOCK_DB) {
    // モックデータを使用
    const newQuiz: Quiz = {
      id: (mockQuizzes.length + 1).toString(),
      ...quiz,
      created_at: new Date().toISOString()
    };
    mockQuizzes.push(newQuiz);
    return newQuiz;
  } else {
    // Supabaseを使用
    const { data, error } = await supabase
      .from('quizzes')
      .insert([quiz])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create quiz: ${error.message}`);
    }

    return data as Quiz;
  }
}

// クイズの更新
export async function updateQuiz(
  id: string,
  updates: Partial<Omit<Quiz, 'id' | 'created_at'>>
): Promise<Quiz | null> {
  // フレーズIDが更新される場合、そのフレーズが存在するか確認
  if (updates.phrase_id) {
    const phrase = await getPhraseById(updates.phrase_id);
    if (!phrase) {
      throw new Error(`Phrase with id ${updates.phrase_id} not found`);
    }
  }

  if (USE_MOCK_DB) {
    // モックデータを使用
    const index = mockQuizzes.findIndex(q => q.id === id);
    if (index === -1) {
      return null;
    }

    const updatedQuiz = {
      ...mockQuizzes[index],
      ...updates
    };
    mockQuizzes[index] = updatedQuiz;
    return updatedQuiz;
  } else {
    // Supabaseを使用
    const { data, error } = await supabase
      .from('quizzes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update quiz: ${error.message}`);
    }

    return data as Quiz;
  }
}

// クイズの削除
export async function deleteQuiz(id: string): Promise<boolean> {
  if (USE_MOCK_DB) {
    // モックデータを使用
    const index = mockQuizzes.findIndex(q => q.id === id);
    if (index === -1) {
      return false;
    }
    mockQuizzes.splice(index, 1);
    return true;
  } else {
    // Supabaseを使用
    const { error } = await supabase
      .from('quizzes')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete quiz: ${error.message}`);
    }

    return true;
  }
}

// クイズの回答チェック
export async function checkQuizAnswer(id: string, selected: string): Promise<QuizAnswerResponse> {
  const quiz = await getQuizById(id);
  if (!quiz) {
    throw new Error(`Quiz with id ${id} not found`);
  }

  // 選択肢が存在するか確認
  const optionExists = quiz.options.some(option => option.id === selected);
  if (!optionExists) {
    throw new Error(`Option with id ${selected} not found in quiz ${id}`);
  }

  // 正解かどうかチェック
  const isCorrect = quiz.answer === selected;

  return {
    correct: isCorrect,
    correct_answer: quiz.answer
  };
}
