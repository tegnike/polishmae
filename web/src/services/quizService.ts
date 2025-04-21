import apiClient from '@/lib/axios';
import { Quiz, QuizListResponse, QuizAnswerResponse } from '@/lib/types';

export const quizService = {
  /**
   * クイズ一覧を取得
   * @param phraseId 特定のフレーズに関連するクイズのみを取得（任意）
   * @param page ページ番号
   * @param perPage 1ページあたりの件数
   */
  async getQuizzes(
    phraseId?: string,
    page: number = 1,
    perPage: number = 20
  ): Promise<QuizListResponse> {
    const params: Record<string, string | number> = {
      page,
      per_page: perPage,
    };
    
    if (phraseId) {
      params.phrase_id = phraseId;
    }
    
    const response = await apiClient.get<QuizListResponse>('/quizzes', { params });
    return response.data;
  },
  
  /**
   * 特定のクイズを取得
   * @param id クイズID
   */
  async getQuiz(id: string): Promise<Quiz> {
    const response = await apiClient.get<Quiz>(`/quizzes/${id}`);
    return response.data;
  },
  
  /**
   * クイズの回答をチェック
   * @param id クイズID
   * @param selected 選択した回答のID
   */
  async checkAnswer(id: string, selected: string): Promise<QuizAnswerResponse> {
    const response = await apiClient.post<QuizAnswerResponse>(`/quizzes/${id}/answer`, {
      selected,
    });
    return response.data;
  },
  
  /**
   * ランダムなクイズを取得
   * @param count 取得するクイズの数
   */
  async getRandomQuizzes(count: number = 5): Promise<Quiz[]> {
    // APIにランダムクイズを取得するエンドポイントがない場合は、
    // クライアント側でランダム化する
    const response = await this.getQuizzes(undefined, 1, 100);
    const quizzes = response.data;
    
    // クイズをシャッフル
    const shuffled = [...quizzes].sort(() => 0.5 - Math.random());
    
    // 指定した数だけ取得
    return shuffled.slice(0, Math.min(count, shuffled.length));
  }
};
