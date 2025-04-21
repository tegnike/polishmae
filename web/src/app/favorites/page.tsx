'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Favorite } from '@/lib/types';
import { favoriteService } from '@/services/favoriteService';
import { authService } from '@/services/authService';
import PhraseCard from '@/components/PhraseCard';

export default function FavoritesPage() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const isAuthenticated = authService.isAuthenticated();
  
  // 認証チェックと初期データ取得
  useEffect(() => {
    // 未認証の場合はログインページにリダイレクト
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // お気に入りの取得
        const favoritesResponse = await favoriteService.getFavorites();
        setFavorites(favoritesResponse.data);
        
        setIsLoading(false);
      } catch (err) {
        console.error('データ取得エラー:', err);
        setError('お気に入りの取得中にエラーが発生しました。後でもう一度お試しください。');
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [isAuthenticated, router]);
  
  // お気に入り切り替えの処理
  const handleToggleFavorite = async (phraseId: string, isFavorite: boolean) => {
    try {
      if (!isFavorite) {
        // お気に入りから削除
        const favoriteId = favoriteService.getFavoriteId(phraseId, favorites);
        if (favoriteId) {
          await favoriteService.removeFavorite(favoriteId);
          setFavorites(favorites.filter(fav => fav.id !== favoriteId));
        }
      }
      // このページではお気に入りに追加する操作は不要（すでにお気に入りのものだけを表示しているため）
    } catch (err) {
      console.error('お気に入り操作エラー:', err);
      setError('お気に入りの操作中にエラーが発生しました。');
    }
  };
  
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">お気に入り</h1>
      
      {/* エラーメッセージ */}
      {error && (
        <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      
      {/* ローディング表示 */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {/* お気に入りリスト */}
          {favorites.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map(favorite => (
                favorite.phrase && (
                  <PhraseCard
                    key={favorite.id}
                    phrase={favorite.phrase}
                    favorites={favorites}
                    onToggleFavorite={handleToggleFavorite}
                  />
                )
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <p className="text-gray-600 dark:text-gray-400 mb-4">お気に入りに登録されたフレーズはありません。</p>
              <button
                onClick={() => router.push('/phrases')}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                フレーズ一覧へ
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
