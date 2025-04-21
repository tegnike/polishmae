'use client';

import { useState } from 'react';
import { Phrase, Favorite } from '@/lib/types';
import { phraseService } from '@/services/phraseService';
import { favoriteService } from '@/services/favoriteService';
import { authService } from '@/services/authService';

interface PhraseCardProps {
  phrase: Phrase;
  favorites: Favorite[];
  onToggleFavorite: (phraseId: string, isFavorite: boolean) => void;
}

export default function PhraseCard({ phrase, favorites, onToggleFavorite }: PhraseCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const isAuthenticated = authService.isAuthenticated();
  const isFavorite = favoriteService.isFavorite(phrase.id, favorites);
  
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
  
  // お気に入り切り替え
  const handleToggleFavorite = async () => {
    if (!isAuthenticated) return;
    
    try {
      onToggleFavorite(phrase.id, !isFavorite);
    } catch (error) {
      console.error('お気に入り操作エラー:', error);
    }
  };
  
  return (
    <div className="bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-100">{phrase.polish_text}</h3>
            <p className="text-gray-400 mt-1">{phrase.japanese_text}</p>
          </div>
          
          <div className="flex space-x-2">
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
            
            {/* お気に入りボタン（認証済みの場合のみ表示） */}
            {isAuthenticated && (
              <button
                onClick={handleToggleFavorite}
                className={`p-2 rounded-full ${
                  isFavorite
                    ? 'bg-yellow-900 text-yellow-300 hover:bg-yellow-800'
                    : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                }`}
                aria-label={isFavorite ? 'お気に入りから削除' : 'お気に入りに追加'}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill={isFavorite ? 'currentColor' : 'none'}
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
        
        <div className="flex justify-between items-center mt-4">
          <span className="inline-block bg-blue-900 text-blue-300 text-xs px-2 py-1 rounded-full">
            {phrase.category}
          </span>
        </div>
      </div>
    </div>
  );
}
