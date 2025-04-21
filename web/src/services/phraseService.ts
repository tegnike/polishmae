import apiClient from '@/lib/axios';
import { Phrase, PhraseListResponse } from '@/lib/types';

export const phraseService = {
  /**
   * フレーズ一覧を取得
   * @param category カテゴリでフィルタリング（任意）
   * @param page ページ番号
   * @param perPage 1ページあたりの件数
   */
  async getPhrases(
    category?: string,
    page: number = 1,
    perPage: number = 20
  ): Promise<PhraseListResponse> {
    const params: Record<string, string | number> = {
      page,
      per_page: perPage,
    };
    
    if (category) {
      params.category = category;
    }
    
    const response = await apiClient.get<PhraseListResponse>('/phrases', { params });
    return response.data;
  },
  
  /**
   * 特定のフレーズを取得
   * @param id フレーズID
   */
  async getPhrase(id: string): Promise<Phrase> {
    const response = await apiClient.get<Phrase>(`/phrases/${id}`);
    return response.data;
  },
  
  /**
   * フレーズの音声を再生
   * @param polishText ポーランド語テキスト
   */
  playPhraseAudio(polishText: string): void {
    // Web Speech APIを使用して音声合成
    if ('speechSynthesis' in window) {
      // 音声合成の設定
      const utterance = new SpeechSynthesisUtterance(polishText);
      utterance.lang = 'pl-PL'; // ポーランド語
      utterance.rate = 0.9; // 少し遅めに設定
      
      // 音声合成の実行
      window.speechSynthesis.speak(utterance);
    } else {
      console.error('このブラウザは音声合成をサポートしていません');
    }
  },
  
  /**
   * カテゴリ一覧を取得（ユニークなカテゴリのリスト）
   */
  async getCategories(): Promise<string[]> {
    // 実際のAPIにカテゴリ一覧を取得するエンドポイントがない場合は、
    // フレーズ一覧から重複を除いたカテゴリリストを作成
    const response = await this.getPhrases(undefined, 1, 100);
    const categories = response.data.map(phrase => phrase.category);
    return [...new Set(categories)]; // 重複を除去
  }
};
