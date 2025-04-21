'use client';

import { useState, useEffect } from 'react';
import { Phrase } from '@/lib/types';
import { phraseService } from '@/services/phraseService';
import { logService } from '@/services/logService';
import PronunciationPractice from '@/components/PronunciationPractice';

export default function PronunciationPage() {
  const [phrases, setPhrases] = useState<Phrase[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
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
        
        setIsLoading(false);
      } catch (err) {
        console.error('データ取得エラー:', err);
        setError('データの取得中にエラーが発生しました。後でもう一度お試しください。');
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [selectedCategory]);
  
  // カテゴリ選択の処理
  const handleCategoryChange = (category: string | null) => {
    setSelectedCategory(category);
    setCurrentPhraseIndex(0);
  };
  
  // 次のフレーズに進む
  const handleNextPhrase = () => {
    if (currentPhraseIndex < phrases.length - 1) {
      setCurrentPhraseIndex(currentPhraseIndex + 1);
    } else {
      // 最初のフレーズに戻る
      setCurrentPhraseIndex(0);
    }
  };
  
  // 前のフレーズに戻る
  const handlePreviousPhrase = () => {
    if (currentPhraseIndex > 0) {
      setCurrentPhraseIndex(currentPhraseIndex - 1);
    } else {
      // 最後のフレーズに移動
      setCurrentPhraseIndex(phrases.length - 1);
    }
  };
  
  // 発音スコアの更新
  const handleScoreUpdate = async (phraseId: string, score: number) => {
    try {
      // 学習ログの記録
      await logService.createLog(phraseId, 'pronounce', undefined, score);
    } catch (err) {
      console.error('ログ記録エラー:', err);
    }
  };
  
  // 現在のフレーズ
  const currentPhrase = phrases[currentPhraseIndex];
  
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">発音練習</h1>
      
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
          {/* フレーズナビゲーション */}
          {phrases.length > 0 && (
            <div className="flex justify-between items-center mb-6">
              <button
                onClick={handlePreviousPhrase}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                前のフレーズ
              </button>
              
              <div className="text-center">
                <span className="text-gray-700 dark:text-gray-300">フレーズ: </span>
                <span className="font-bold text-blue-600 dark:text-blue-400">{currentPhraseIndex + 1}</span>
                <span className="text-gray-700 dark:text-gray-300"> / {phrases.length}</span>
              </div>
              
              <button
                onClick={handleNextPhrase}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                次のフレーズ
              </button>
            </div>
          )}
          
          {/* 発音練習コンポーネント */}
          {currentPhrase ? (
            <PronunciationPractice
              phrase={currentPhrase}
              onScoreUpdate={handleScoreUpdate}
            />
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
