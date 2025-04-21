import apiClient from '@/lib/axios';
import { PronunciationResponse } from '@/lib/types';
import { SpeechRecognition, SpeechRecognitionEvent } from '@/lib/speechTypes';

export const pronunciationService = {
  /**
   * 音声認識を開始
   * @param onResult 認識結果を受け取るコールバック
   * @param onError エラーを受け取るコールバック
   * @returns 音声認識オブジェクト
   */
  startSpeechRecognition(
    onResult: (text: string) => void,
    onError: (error: string) => void
  ): SpeechRecognition | null {
    // Web Speech APIがサポートされているか確認
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      onError('このブラウザは音声認識をサポートしていません');
      return null;
    }
    
    // SpeechRecognitionオブジェクトの作成
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognitionAPI();
    
    // 設定
    recognition.lang = 'pl-PL'; // ポーランド語
    recognition.interimResults = true; // 中間結果も取得
    recognition.continuous = false; // 連続認識しない
    
    // イベントハンドラの設定
    recognition.onresult = (event: Event) => {
      const speechEvent = event as SpeechRecognitionEvent;
      if (speechEvent.results && speechEvent.results.length > 0) {
        const result = speechEvent.results[0][0].transcript;
        onResult(result);
      }
    };
    
    recognition.onerror = (event) => {
      if ('error' in event) {
        onError((event as { error: string }).error);
      } else {
        onError('不明なエラー');
      }
    };
    
    // 音声認識開始
    recognition.start();
    
    return recognition;
  },
  
  /**
   * 音声認識を停止
   * @param recognition 音声認識オブジェクト
   */
  stopSpeechRecognition(recognition: SpeechRecognition): void {
    if (recognition) {
      recognition.stop();
    }
  },
  
  /**
   * 発音スコアを取得
   * @param phraseId フレーズID
   * @param audioBlob 音声データ
   */
  async getPronunciationScore(
    phraseId: string,
    audioBlob: Blob
  ): Promise<PronunciationResponse> {
    // FormDataの作成
    const formData = new FormData();
    formData.append('phrase_id', phraseId);
    formData.append('audio_file', audioBlob, 'recording.webm');
    
    // APIリクエスト
    const response = await apiClient.post<PronunciationResponse>(
      '/pronunciation',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    
    return response.data;
  },
  
  /**
   * 音声録音を開始
   * @returns MediaRecorderオブジェクトとストリームのPromise
   */
  async startRecording(): Promise<{ mediaRecorder: MediaRecorder; stream: MediaStream }> {
    try {
      // マイクへのアクセス許可を取得
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // MediaRecorderの作成
      const mediaRecorder = new MediaRecorder(stream);
      
      return { mediaRecorder, stream };
    } catch (error) {
      console.error('マイクへのアクセスが拒否されました:', error);
      throw error;
    }
  },
  
  /**
   * 音声録音を停止して録音データを取得
   * @param mediaRecorder MediaRecorderオブジェクト
   * @param stream MediaStreamオブジェクト
   * @returns 録音データのPromise
   */
  stopRecording(
    mediaRecorder: MediaRecorder,
    stream: MediaStream
  ): Promise<Blob> {
    return new Promise((resolve) => {
      const chunks: BlobPart[] = [];
      
      // データが利用可能になったときのイベントハンドラ
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      // 録音が停止したときのイベントハンドラ
      mediaRecorder.onstop = () => {
        // ストリームのトラックを停止
        stream.getTracks().forEach(track => track.stop());
        
        // Blobの作成
        const blob = new Blob(chunks, { type: 'audio/webm' });
        resolve(blob);
      };
      
      // 録音中でなければ何もしない
      if (mediaRecorder.state !== 'recording') {
        resolve(new Blob([]));
        return;
      }
      
      // 録音停止
      mediaRecorder.stop();
    });
  }
};
