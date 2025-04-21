import { Context } from 'hono';
import { z } from 'zod';
import { calculatePronunciationScore, uploadAudioFile } from '../services/pronunciationService';
import { getPhraseById } from '../services/phraseService';
import { addLog } from '../services/logService';

// バリデーションスキーマ
const pronunciationSchema = z.object({
  phrase_id: z.string().uuid()
});

// 発音スコア計算
export async function calculatePronunciationScoreHandler(c: Context) {
  const userId = c.get('userId');
  
  // マルチパートフォームデータの処理
  const data = await c.req.formData();
  const phraseId = data.get('phrase_id')?.toString();
  const audioFile = data.get('audio_file');
  
  if (!phraseId) {
    c.status(400 as any);
    return c.json({
      error: {
        code: 'VALIDATION_FAILED',
        message: 'phrase_id is required'
      }
    });
  }
  
  // フレーズが存在するか確認
  const phrase = await getPhraseById(phraseId);
  if (!phrase) {
    c.status(404 as any);
    return c.json({
      error: {
        code: 'RESOURCE_NOT_FOUND',
        message: 'Phrase not found'
      }
    });
  }
  
  if (!audioFile || !(audioFile instanceof File)) {
    c.status(400 as any);
    return c.json({
      error: {
        code: 'VALIDATION_FAILED',
        message: 'audio_file is required and must be a file'
      }
    });
  }
  
  // 音声ファイルをバッファに変換
  const arrayBuffer = await audioFile.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  
  // 音声ファイルをアップロード（必要な場合）
  const audioUrl = await uploadAudioFile(userId, phraseId, buffer);
  
  // 発音スコアを計算
  const result = await calculatePronunciationScore(phraseId, buffer);
  
  // 学習ログを記録
  await addLog({
    user_id: userId,
    phrase_id: phraseId,
    quiz_id: null,
    action: 'pronounce',
    result: result.score
  });
  
  return c.json(result);
}

export const pronunciationValidators = {
  pronunciation: pronunciationSchema
};
