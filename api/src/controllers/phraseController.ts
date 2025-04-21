import { Context } from 'hono';
import { z } from 'zod';
import { 
  getPhrases, 
  getPhraseById, 
  createPhrase, 
  updatePhrase, 
  deletePhrase 
} from '../services/phraseService';
import { paginationSchema } from '../middlewares/validationMiddleware';

// バリデーションスキーマ
const phraseQuerySchema = paginationSchema.extend({
  category: z.string().optional()
});

const phraseCreateSchema = z.object({
  polish_text: z.string().min(1),
  japanese_text: z.string().min(1),
  category: z.string().min(1)
});

const phraseUpdateSchema = z.object({
  polish_text: z.string().min(1).optional(),
  japanese_text: z.string().min(1).optional(),
  category: z.string().min(1).optional()
}).refine(data => Object.keys(data).length > 0, {
  message: "At least one field must be provided for update"
});

// フレーズ一覧取得
export async function getPhrasesHandler(c: Context) {
  const { page, per_page, category } = c.get('validatedQuery');
  const result = await getPhrases(page, per_page, category);
  return c.json(result);
}

// フレーズ詳細取得
export async function getPhraseByIdHandler(c: Context) {
  const id = c.req.param('id');
  const phrase = await getPhraseById(id);
  
  if (!phrase) {
    c.status(404 as any);
    return c.json({
      error: {
        code: 'RESOURCE_NOT_FOUND',
        message: 'Phrase not found'
      }
    });
  }
  
  return c.json(phrase);
}

// フレーズ作成
export async function createPhraseHandler(c: Context) {
  const phraseData = c.get('validatedBody');
  const newPhrase = await createPhrase(phraseData);
  c.status(201 as any);
  return c.json(newPhrase);
}

// フレーズ更新
export async function updatePhraseHandler(c: Context) {
  const id = c.req.param('id');
  const updates = c.get('validatedBody');
  
  const updatedPhrase = await updatePhrase(id, updates);
  
  if (!updatedPhrase) {
    c.status(404 as any);
    return c.json({
      error: {
        code: 'RESOURCE_NOT_FOUND',
        message: 'Phrase not found'
      }
    });
  }
  
  return c.json(updatedPhrase);
}

// フレーズ削除
export async function deletePhraseHandler(c: Context) {
  const id = c.req.param('id');
  const success = await deletePhrase(id);
  
  if (!success) {
    c.status(404 as any);
    return c.json({
      error: {
        code: 'RESOURCE_NOT_FOUND',
        message: 'Phrase not found'
      }
    });
  }
  
  c.status(204 as any);
  return c.body(null);
}

export const phraseValidators = {
  query: phraseQuerySchema,
  create: phraseCreateSchema,
  update: phraseUpdateSchema
};
