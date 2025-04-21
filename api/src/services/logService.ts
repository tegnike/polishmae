import { supabase, USE_MOCK_DB } from './supabase';
import { mockLogs, mockUserStats } from './mockData';
import { Log, ApiResponse, UserStats } from '../models/types';

// 学習ログの取得（ページネーション、フィルタ対応）
export async function getLogs(
  userId: string,
  page: number = 1,
  perPage: number = 20,
  action?: string,
  fromDate?: string,
  toDate?: string
): Promise<ApiResponse<Log[]>> {
  if (USE_MOCK_DB) {
    // モックデータを使用
    let filteredLogs = mockLogs.filter(log => log.user_id === userId);

    // アクションフィルタ
    if (action) {
      filteredLogs = filteredLogs.filter(log => log.action === action);
    }

    // 日付フィルタ
    if (fromDate) {
      const fromTimestamp = new Date(fromDate).getTime();
      filteredLogs = filteredLogs.filter(log => new Date(log.created_at).getTime() >= fromTimestamp);
    }

    if (toDate) {
      const toTimestamp = new Date(toDate).getTime() + 86400000; // 終了日の終わりまで（+1日）
      filteredLogs = filteredLogs.filter(log => new Date(log.created_at).getTime() <= toTimestamp);
    }

    // ページネーション
    const start = (page - 1) * perPage;
    const end = start + perPage;
    const paginatedLogs = filteredLogs.slice(start, end);

    return {
      data: paginatedLogs,
      meta: {
        page,
        per_page: perPage,
        total: filteredLogs.length
      }
    };
  } else {
    // Supabaseを使用
    let query = supabase
      .from('logs')
      .select('*', { count: 'exact' })
      .eq('user_id', userId);

    // アクションフィルタ
    if (action) {
      query = query.eq('action', action);
    }

    // 日付フィルタ
    if (fromDate) {
      query = query.gte('created_at', fromDate);
    }

    if (toDate) {
      // 終了日の終わりまで
      const nextDay = new Date(toDate);
      nextDay.setDate(nextDay.getDate() + 1);
      query = query.lt('created_at', nextDay.toISOString().split('T')[0]);
    }

    // ページネーション
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;
    
    const { data, error, count } = await query
      .range(from, to)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch logs: ${error.message}`);
    }

    return {
      data: data as Log[],
      meta: {
        page,
        per_page: perPage,
        total: count || 0
      }
    };
  }
}

// 学習ログの追加
export async function addLog(log: Omit<Log, 'id' | 'created_at'>): Promise<Log> {
  if (USE_MOCK_DB) {
    // モックデータを使用
    const newLog: Log = {
      id: (mockLogs.length + 1).toString(),
      ...log,
      created_at: new Date().toISOString()
    };
    mockLogs.push(newLog);
    return newLog;
  } else {
    // Supabaseを使用
    const { data, error } = await supabase
      .from('logs')
      .insert([log])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to add log: ${error.message}`);
    }

    return data as Log;
  }
}

// ユーザー統計の取得
export async function getUserStats(userId: string): Promise<UserStats> {
  if (USE_MOCK_DB) {
    // モックデータを使用
    return mockUserStats;
  } else {
    // Supabaseを使用
    // 実際のアプリケーションでは、以下のようなSQLクエリを実行して統計を計算します
    
    // 学習したフレーズの総数
    const { count: totalPhrasesStudied, error: phraseError } = await supabase
      .from('logs')
      .select('phrase_id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('action', 'study');

    if (phraseError) {
      throw new Error(`Failed to fetch phrase stats: ${phraseError.message}`);
    }

    // クイズの総数
    const { count: totalQuizzes, error: quizCountError } = await supabase
      .from('logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('action', 'quiz');

    if (quizCountError) {
      throw new Error(`Failed to fetch quiz count: ${quizCountError.message}`);
    }

    // クイズの正解率
    const { data: quizResults, error: quizResultsError } = await supabase
      .from('logs')
      .select('result')
      .eq('user_id', userId)
      .eq('action', 'quiz')
      .not('result', 'is', null);

    if (quizResultsError) {
      throw new Error(`Failed to fetch quiz results: ${quizResultsError.message}`);
    }

    let quizAccuracy = 0;
    if (quizResults.length > 0) {
      const correctCount = quizResults.filter(r => r.result === 1).length;
      quizAccuracy = correctCount / quizResults.length;
    }

    // 発音スコアの平均
    const { data: pronunciationScores, error: pronunciationError } = await supabase
      .from('logs')
      .select('result')
      .eq('user_id', userId)
      .eq('action', 'pronounce')
      .not('result', 'is', null);

    if (pronunciationError) {
      throw new Error(`Failed to fetch pronunciation scores: ${pronunciationError.message}`);
    }

    let averagePronunciationScore = 0;
    if (pronunciationScores.length > 0) {
      const totalScore = pronunciationScores.reduce((sum, item) => sum + (item.result || 0), 0);
      averagePronunciationScore = totalScore / pronunciationScores.length;
    }

    return {
      total_phrases_studied: totalPhrasesStudied || 0,
      total_quizzes: totalQuizzes || 0,
      quiz_accuracy: quizAccuracy,
      average_pronunciation_score: averagePronunciationScore
    };
  }
}
