'use client';

import { useState, useEffect } from 'react';
import { Phrase, Favorite } from '@/lib/types';
import { phraseService } from '@/services/phraseService';
import { favoriteService } from '@/services/favoriteService';
import { authService } from '@/services/authService';
import PhraseCard from '@/components/PhraseCard';

export default function PhrasesPage() {
  const [phrases, setPhrases] = useState<Phrase[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const isAuthenticated = authService.isAuthenticated();
  
  // フレーズとカテゴリの取得
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // フレーズの取得
        const phrasesResponse = await phraseService.getPhrases(selectedCategory || undefined);
        setPhrases(phrasesResponse.data);
        
        // カテゴリの取得
        const categoriesData = await phraseService.getCategories();
        setCategories(categoriesData);
        
        // 認証済みの場合はお気に入りも取得
        if (isAuthenticated) {
          const favoritesResponse = await favoriteService.getFavorites();
          setFavorites(favoritesResponse.data);
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('データ取得エラー:', err);
        setError('データの取得中にエラーが発生しました。後でもう一度お試しください。');
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [selectedCategory, isAuthenticated]);
  
  // カテゴリ選択の処理
  const handleCategoryChange = (category: string | null) => {
    setSelectedCategory(category);
  };
  
  // お気に入り切り替えの処理
  const handleToggleFavorite = async (phraseId: string, isFavorite: boolean) => {
    try {
      if (isFavorite) {
        // お気に入りに追加
        const newFavorite = await favoriteService.addFavorite(phraseId);
        setFavorites([...favorites, newFavorite]);
      } else {
        // お気に入りから削除
        const favoriteId = favoriteService.getFavoriteId(phraseId, favorites);
        if (favoriteId) {
          await favoriteService.removeFavorite(favoriteId);
          setFavorites(favorites.filter(fav => fav.id !== favoriteId));
        }
      }
    } catch (err) {
      console.error('お気に入り操作エラー:', err);
      setError('お気に入りの操作中にエラーが発生しました。');
    }
  };
  
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">フレーズ一覧</h1>
      
      {/* カテゴリフィルター */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleCategoryChange(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              selectedCategory === null
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            すべて
          </button>
          
          {categories.map(category => (
            <button
              key={category}
              onClick={() => handleCategoryChange(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
      
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
          {/* フレーズリスト */}
          {phrases.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {phrases.map(phrase => (
                <PhraseCard
                  key={phrase.id}
                  phrase={phrase}
                  favorites={favorites}
                  onToggleFavorite={handleToggleFavorite}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">
                {selectedCategory
                  ? `「${selectedCategory}」カテゴリのフレーズはありません。`
                  : 'フレーズがありません。'}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
