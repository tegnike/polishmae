'use client';

import { useState, useEffect } from 'react';
import { Quiz, Phrase } from '@/lib/types';
import { quizService } from '@/services/quizService';
import { phraseService } from '@/services/phraseService';
import { logService } from '@/services/logService';
import QuizCard from '@/components/QuizCard';

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [phrases, setPhrases] = useState<Record<string, Phrase>>({});
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  
  // クイズとフレーズの取得
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // ランダムなクイズを取得
        const quizzesData = await quizService.getRandomQuizzes(10);
        setQuizzes(quizzesData);
        
        // 関連するフレーズを取得
        const phraseIds = quizzesData.map(quiz => quiz.phrase_id);
        const uniquePhraseIds = [...new Set(phraseIds)];
        
        const phrasesData: Record<string, Phrase> = {};
        for (const phraseId of uniquePhraseIds) {
          const phrase = await phraseService.getPhrase(phraseId);
          phrasesData[phraseId] = phrase;
        }
        
        setPhrases(phrasesData);
        setIsLoading(false);
      } catch (err) {
        console.error('データ取得エラー:', err);
        setError('クイズの取得中にエラーが発生しました。後でもう一度お試しください。');
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // 回答処理
  const handleAnswer = async (quizId: string, selected: string, isCorrect: boolean) => {
    try {
      // スコアの更新
      setScore(prev => ({
        correct: prev.correct + (isCorrect ? 1 : 0),
        total: prev.total + 1,
      }));
      
      // 学習ログの記録
      const quiz = quizzes.find(q => q.id === quizId);
      if (quiz) {
        await logService.createLog(
          quiz.phrase_id,
          'quiz',
          quizId,
          isCorrect ? 1 : 0
        );
      }
    } catch (err) {
      console.error('ログ記録エラー:', err);
    }
  };
  
  // 次のクイズに進む
  const handleNextQuiz = () => {
    if (currentQuizIndex < quizzes.length - 1) {
      setCurrentQuizIndex(currentQuizIndex + 1);
    } else {
      // 全問終了
      setCurrentQuizIndex(0);
      // 新しいクイズセットを取得
      fetchNewQuizzes();
    }
  };
  
  // 新しいクイズセットを取得
  const fetchNewQuizzes = async () => {
    try {
      setIsLoading(true);
      
      // ランダムなクイズを取得
      const quizzesData = await quizService.getRandomQuizzes(10);
      setQuizzes(quizzesData);
      
      // 関連するフレーズを取得
      const phraseIds = quizzesData.map(quiz => quiz.phrase_id);
      const uniquePhraseIds = [...new Set(phraseIds)];
      
      const phrasesData: Record<string, Phrase> = {};
      for (const phraseId of uniquePhraseIds) {
        const phrase = await phraseService.getPhrase(phraseId);
        phrasesData[phraseId] = phrase;
      }
      
      setPhrases(phrasesData);
      setIsLoading(false);
    } catch (err) {
      console.error('データ取得エラー:', err);
      setError('クイズの取得中にエラーが発生しました。後でもう一度お試しください。');
      setIsLoading(false);
    }
  };
  
  // 現在のクイズとフレーズ
  const currentQuiz = quizzes[currentQuizIndex];
  const currentPhrase = currentQuiz ? phrases[currentQuiz.phrase_id] : null;
  
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">クイズ</h1>
      
      {/* スコア表示 */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-6">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-gray-700 dark:text-gray-300">スコア: </span>
            <span className="font-bold text-blue-600 dark:text-blue-400">{score.correct}</span>
            <span className="text-gray-700 dark:text-gray-300"> / {score.total}</span>
          </div>
          
          <div>
            <span className="text-gray-700 dark:text-gray-300">正答率: </span>
            <span className="font-bold text-blue-600 dark:text-blue-400">
              {score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0}%
            </span>
          </div>
          
          <div>
            <span className="text-gray-700 dark:text-gray-300">問題: </span>
            <span className="font-bold text-blue-600 dark:text-blue-400">{currentQuizIndex + 1}</span>
            <span className="text-gray-700 dark:text-gray-300"> / {quizzes.length}</span>
          </div>
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
          {/* クイズカード */}
          {currentQuiz && currentPhrase ? (
            <QuizCard
              quiz={currentQuiz}
              phrase={currentPhrase}
              onAnswer={(quizId, selected, isCorrect) => {
                handleAnswer(quizId, selected, isCorrect);
                // 回答後に次のクイズに進むためのタイマーを設定
                setTimeout(() => {
                  handleNextQuiz();
                }, 2000); // 2秒後に次のクイズへ
              }}
            />
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">クイズがありません。</p>
              <button
                onClick={fetchNewQuizzes}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                クイズを取得する
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
