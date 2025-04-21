import apiClient from '@/lib/axios';
import { Favorite, FavoriteListResponse } from '@/lib/types';

export const favoriteService = {
  /**
   * お気に入り一覧を取得
   * @param page ページ番号
   * @param perPage 1ページあたりの件数
   */
  async getFavorites(
    page: number = 1,
    perPage: number = 20
  ): Promise<FavoriteListResponse> {
    const params = {
      page,
      per_page: perPage,
    };
    
    const response = await apiClient.get<FavoriteListResponse>('/favorites', { params });
    return response.data;
  },
  
  /**
   * お気に入りに追加
   * @param phraseId フレーズID
   */
  async addFavorite(phraseId: string): Promise<Favorite> {
    const response = await apiClient.post<Favorite>('/favorites', {
      phrase_id: phraseId,
    });
    return response.data;
  },
  
  /**
   * お気に入りから削除
   * @param favoriteId お気に入りID
   */
  async removeFavorite(favoriteId: string): Promise<void> {
    await apiClient.delete(`/favorites/${favoriteId}`);
  },
  
  /**
   * 特定のフレーズがお気に入りに登録されているか確認
   * @param phraseId フレーズID
   * @param favorites お気に入りリスト
   */
  isFavorite(phraseId: string, favorites: Favorite[]): boolean {
    return favorites.some(favorite => favorite.phrase_id === phraseId);
  },
  
  /**
   * 特定のフレーズのお気に入りIDを取得
   * @param phraseId フレーズID
   * @param favorites お気に入りリスト
   */
  getFavoriteId(phraseId: string, favorites: Favorite[]): string | null {
    const favorite = favorites.find(fav => fav.phrase_id === phraseId);
    return favorite ? favorite.id : null;
  }
};
