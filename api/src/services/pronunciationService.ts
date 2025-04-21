import { supabase, USE_MOCK_DB } from './supabase';
import { PronunciationScoreResponse } from '../models/types';
import { getPhraseById } from './phraseService';

// 発音スコアの計算
export async function calculatePronunciationScore(
  phraseId: string,
  audioBuffer: Buffer
): Promise<PronunciationScoreResponse> {
  // フレーズが存在するか確認
  const phrase = await getPhraseById(phraseId);
  if (!phrase) {
    throw new Error(`Phrase with id ${phraseId} not found`);
  }

  if (USE_MOCK_DB) {
    // モックデータを使用
    // 実際の音声認識は行わず、ランダムなスコアを返す
    const randomScore = Math.random() * 0.5 + 0.5; // 0.5〜1.0のランダムな値
    return {
      score: parseFloat(randomScore.toFixed(2))
    };
  } else {
    // 実際のアプリケーションでは、Google Cloud Speech-to-Text APIなどを使用して
    // 音声をテキストに変換し、正解のフレーズとの類似度を計算します
    
    // ここではモック実装として、ランダムなスコアを返します
    // 本番実装では、以下のようなステップを踏みます：
    // 1. 音声ファイルをGoogle Cloud Speech-to-Text APIに送信
    // 2. 認識結果のテキストを取得
    // 3. 正解のフレーズ（phrase.polish_text）との類似度を計算
    // 4. 類似度をスコアとして返す
    
    const randomScore = Math.random() * 0.5 + 0.5; // 0.5〜1.0のランダムな値
    return {
      score: parseFloat(randomScore.toFixed(2))
    };
  }
}

// 音声ファイルのアップロード（Supabase Storageを使用する場合）
export async function uploadAudioFile(
  userId: string,
  phraseId: string,
  audioBuffer: Buffer
): Promise<string> {
  if (USE_MOCK_DB) {
    // モックデータを使用
    // 実際のアップロードは行わず、ダミーのURLを返す
    return `mock-audio-url-${userId}-${phraseId}-${Date.now()}.mp3`;
  } else {
    // Supabase Storageを使用
    const filePath = `audio/${userId}/${phraseId}/${Date.now()}.mp3`;
    
    const { data, error } = await supabase.storage
      .from('pronunciation')
      .upload(filePath, audioBuffer, {
        contentType: 'audio/mp3'
      });

    if (error) {
      throw new Error(`Failed to upload audio file: ${error.message}`);
    }

    // アップロードされたファイルの公開URLを取得
    const { data: urlData } = supabase.storage
      .from('pronunciation')
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  }
}
