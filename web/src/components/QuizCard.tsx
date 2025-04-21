'use client';

import { useState } from 'react';
import { Quiz, Phrase } from '@/lib/types';
import { phraseService } from '@/services/phraseService';
import { quizService } from '@/services/quizService';

interface QuizCardProps {
  quiz: Quiz;
  phrase: Phrase;
  onAnswer: (quizId: string, selected: string, isCorrect: boolean) => void;
}

export default function QuizCard({ quiz, phrase, onAnswer }: QuizCardProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // 音声再生
  const handlePlayAudio = () => {
    if (isPlaying) return;
    
    setIsPlaying(true);
    phraseService.playPhraseAudio(phrase.polish_text);
    
    // 音声合成のイベントリスナー
    const utterance = new SpeechSynthesisUtterance(phrase.polish_text);
    utterance.lang = 'pl-PL';
    utterance.onend = () => {
      setIsPlaying(false);
    };
    
    window.speechSynthesis.speak(utterance);
  };
  
  // 選択肢を選択
  const handleSelectOption = (optionId: string) => {
    if (isAnswered) return;
    
    setSelectedOption(optionId);
  };
  
  // 回答を確認
  const handleCheckAnswer = async () => {
    if (!selectedOption || isAnswered) return;
    
    try {
      const response = await quizService.checkAnswer(quiz.id, selectedOption);
      const correct = response.correct;
      
      setIsCorrect(correct);
      setIsAnswered(true);
      
      // 親コンポーネントに結果を通知
      onAnswer(quiz.id, selectedOption, correct);
    } catch (error) {
      console.error('回答チェックエラー:', error);
    }
  };
  
  // クイズをリセット
  const handleReset = () => {
    setSelectedOption(null);
    setIsAnswered(false);
    setIsCorrect(false);
  };
  
  return (
    <div className="bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-gray-100">
            {quiz.type === 'multiple_choice' ? '次の日本語訳として正しいものを選んでください' : 'この文は正しいですか？'}
          </h3>
          
          {/* 音声再生ボタン */}
          <button
            onClick={handlePlayAudio}
            disabled={isPlaying}
            className={`p-2 rounded-full ${
              isPlaying ? 'bg-gray-700 text-gray-400' : 'bg-blue-900 text-blue-300 hover:bg-blue-800'
            }`}
            aria-label="発音を聞く"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
              />
            </svg>
          </button>
        </div>
        
        <div className="mb-6">
          <p className="text-xl font-medium text-gray-200">{phrase.polish_text}</p>
        </div>
        
        <div className="space-y-3 mb-6">
          {quiz.options.map((option) => (
            <button
              key={option.id}
              onClick={() => handleSelectOption(option.id)}
              className={`w-full text-left p-3 rounded-md border ${
                !isAnswered
                  ? selectedOption === option.id
                    ? 'border-blue-500 bg-blue-900 border-blue-400'
                    : 'border-gray-600 hover:border-blue-500'
                  : isAnswered && option.id === quiz.answer
                  ? 'border-green-500 bg-green-900 border-green-400'
                  : isAnswered && selectedOption === option.id && selectedOption !== quiz.answer
                  ? 'border-red-500 bg-red-900 border-red-400'
                  : 'border-gray-600'
              }`}
              disabled={isAnswered}
            >
              {option.text}
            </button>
          ))}
        </div>
        
        <div className="flex justify-between">
          {!isAnswered ? (
            <button
              onClick={handleCheckAnswer}
              disabled={!selectedOption}
              className={`px-4 py-2 rounded-md ${
                selectedOption
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              回答する
            </button>
          ) : (
            <>
              <div className="flex items-center">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    isCorrect ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
                  }`}
                >
                  {isCorrect ? '正解！' : '不正解'}
                </span>
              </div>
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-gray-700 text-gray-200 rounded-md hover:bg-gray-600"
              >
                次の問題
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
