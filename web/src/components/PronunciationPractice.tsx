'use client';

import { useState, useEffect, useRef } from 'react';
import { Phrase } from '@/lib/types';
import { phraseService } from '@/services/phraseService';
import { pronunciationService } from '@/services/pronunciationService';
import { SpeechRecognition } from '@/lib/speechTypes';

interface PronunciationPracticeProps {
  phrase: Phrase;
  onScoreUpdate: (phraseId: string, score: number) => void;
}

export default function PronunciationPractice({ phrase, onScoreUpdate }: PronunciationPracticeProps) {
  const [isListening, setIsListening] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [score, setScore] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  // コンポーネントのクリーンアップ
  useEffect(() => {
    return () => {
      // 音声認識を停止
      if (recognitionRef.current) {
        pronunciationService.stopSpeechRecognition(recognitionRef.current);
      }
      
      // 録音を停止
      if (mediaRecorderRef.current && streamRef.current) {
        if (mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);
  
  // お手本の音声再生
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
  
  // 音声認識開始
  const handleStartListening = () => {
    setErrorMessage(null);
    setRecognizedText('');
    setScore(null);
    setIsListening(true);
    
    recognitionRef.current = pronunciationService.startSpeechRecognition(
      (text) => {
        setRecognizedText(text);
      },
      (error) => {
        setErrorMessage(`音声認識エラー: ${error}`);
        setIsListening(false);
      }
    );
    
    // 一定時間後に自動的に停止
    setTimeout(() => {
      if (recognitionRef.current) {
        pronunciationService.stopSpeechRecognition(recognitionRef.current);
        setIsListening(false);
      }
    }, 5000);
  };
  
  // 音声認識停止
  const handleStopListening = () => {
    if (recognitionRef.current) {
      pronunciationService.stopSpeechRecognition(recognitionRef.current);
      setIsListening(false);
    }
  };
  
  // 録音開始
  const handleStartRecording = async () => {
    try {
      setErrorMessage(null);
      setRecognizedText('');
      setScore(null);
      
      const { mediaRecorder, stream } = await pronunciationService.startRecording();
      mediaRecorderRef.current = mediaRecorder;
      streamRef.current = stream;
      
      setIsRecording(true);
      
      // 録音開始
      mediaRecorderRef.current.start();
      
      // 一定時間後に自動的に停止
      setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          handleStopRecording();
        }
      }, 5000);
    } catch (error) {
      console.error('録音開始エラー:', error);
      setErrorMessage('マイクへのアクセスが拒否されました');
    }
  };
  
  // 録音停止
  const handleStopRecording = async () => {
    if (!mediaRecorderRef.current || !streamRef.current) return;
    
    try {
      const audioBlob = await pronunciationService.stopRecording(
        mediaRecorderRef.current,
        streamRef.current
      );
      
      setIsRecording(false);
      
      // 録音データをAPIに送信して発音スコアを取得
      const response = await pronunciationService.getPronunciationScore(phrase.id, audioBlob);
      const newScore = response.score;
      
      setScore(newScore);
      onScoreUpdate(phrase.id, newScore);
    } catch (error) {
      console.error('録音停止エラー:', error);
      setErrorMessage('録音データの処理中にエラーが発生しました');
      setIsRecording(false);
    }
  };
  
  // スコアに基づくフィードバック
  const getFeedback = (score: number) => {
    if (score >= 0.8) return '素晴らしい発音です！';
    if (score >= 0.6) return '良い発音です。もう少し練習しましょう。';
    if (score >= 0.4) return 'まあまあの発音です。もっと練習が必要です。';
    return '発音に改善の余地があります。もっと練習しましょう。';
  };
  
  return (
    <div className="bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-gray-100">発音練習</h3>
          
          {/* 音声再生ボタン */}
          <button
            onClick={handlePlayAudio}
            disabled={isPlaying}
            className={`p-2 rounded-full ${
              isPlaying ? 'bg-gray-700 text-gray-400' : 'bg-blue-900 text-blue-300 hover:bg-blue-800'
            }`}
            aria-label="お手本の発音を聞く"
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
          <p className="text-gray-400 mt-1">{phrase.japanese_text}</p>
        </div>
        
        <div className="space-y-4 mb-6">
          <div className="flex space-x-2">
            {/* 音声認識ボタン */}
            <button
              onClick={isListening ? handleStopListening : handleStartListening}
              className={`flex-1 py-2 px-4 rounded-md ${
                isListening
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
              disabled={isRecording}
            >
              {isListening ? '音声認識停止' : '音声認識開始'}
            </button>
            
            {/* 録音ボタン */}
            <button
              onClick={isRecording ? handleStopRecording : handleStartRecording}
              className={`flex-1 py-2 px-4 rounded-md ${
                isRecording
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
              disabled={isListening}
            >
              {isRecording ? '録音停止' : '録音開始'}
            </button>
          </div>
          
          {/* 認識テキスト表示 */}
          {recognizedText && (
            <div className="p-3 bg-gray-700 rounded-md">
              <p className="font-medium">認識されたテキスト:</p>
              <p className="text-gray-200">{recognizedText}</p>
            </div>
          )}
          
          {/* スコア表示 */}
          {score !== null && (
            <div className="p-3 bg-blue-900 rounded-md">
              <p className="font-medium">発音スコア:</p>
              <div className="flex items-center mt-1">
                <div className="w-full bg-gray-600 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: `${score * 100}%` }}
                  ></div>
                </div>
                <span className="ml-2 text-gray-200">{Math.round(score * 100)}%</span>
              </div>
              <p className="text-gray-200 mt-2">{getFeedback(score)}</p>
            </div>
          )}
          
          {/* エラーメッセージ */}
          {errorMessage && (
            <div className="p-3 bg-red-900 text-red-300 rounded-md">
              {errorMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
