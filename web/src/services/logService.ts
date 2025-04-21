import apiClient from '@/lib/axios';
import { Log, LogListResponse, Stats } from '@/lib/types';

export const logService = {
  /**
   * 学習ログ一覧を取得
   * @param action アクションでフィルタリング（任意）
   * @param fromDate 開始日（任意）
   * @param toDate 終了日（任意）
   * @param page ページ番号
   * @param perPage 1ページあたりの件数
   */
  async getLogs(
    action?: string,
    fromDate?: string,
    toDate?: string,
    page: number = 1,
    perPage: number = 20
  ): Promise<LogListResponse> {
    const params: Record<string, string | number> = {
      page,
      per_page: perPage,
    };
    
    if (action) {
      params.action = action;
    }
    
    if (fromDate) {
      params.from_date = fromDate;
    }
    
    if (toDate) {
      params.to_date = toDate;
    }
    
    const response = await apiClient.get<LogListResponse>('/logs', { params });
    return response.data;
  },
  
  /**
   * 学習統計を取得
   */
  async getStats(): Promise<Stats> {
    const response = await apiClient.get<Stats>('/stats');
    return response.data;
  },
  
  /**
   * 学習ログを記録（クライアント側で自動的に記録する場合に使用）
   * @param phraseId フレーズID
   * @param action アクション（study/quiz/pronounce）
   * @param quizId クイズID（任意）
   * @param result 結果（任意）
   */
  async createLog(
    phraseId: string,
    action: 'study' | 'quiz' | 'pronounce',
    quizId?: string,
    result?: number
  ): Promise<Log> {
    const data: Record<string, string | number | null> = {
      phrase_id: phraseId,
      action,
      quiz_id: quizId || null,
      result: result !== undefined ? result : null,
    };
    
    const response = await apiClient.post<Log>('/logs', data);
    return response.data;
  },
  
  /**
   * 日付をYYYY-MM-DD形式に変換
   * @param date 日付オブジェクト
   */
  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },
  
  /**
   * 過去N日間の日付範囲を取得
   * @param days 日数
   */
  getDateRange(days: number): { fromDate: string; toDate: string } {
    const toDate = new Date();
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);
    
    return {
      fromDate: this.formatDate(fromDate),
      toDate: this.formatDate(toDate),
    };
  }
};
