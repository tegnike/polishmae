import { Context } from 'hono';
import { z } from 'zod';
import { 
  getFavorites, 
  addFavorite, 
  removeFavorite,
  getFavoriteById
} from '../services/favoriteService';
import { paginationSchema } from '../middlewares/validationMiddleware';

// バリデーションスキーマ
const favoriteQuerySchema = paginationSchema;

const favoriteCreateSchema = z.object({
  phrase_id: z.string().uuid()
});

// お気に入り一覧取得
export async function getFavoritesHandler(c: Context) {
  const userId = c.get('userId');
  const { page, per_page } = c.get('validatedQuery');
  const result = await getFavorites(userId, page, per_page);
  return c.json(result);
}

// お気に入り追加
export async function addFavoriteHandler(c: Context) {
  const userId = c.get('userId');
  const { phrase_id } = c.get('validatedBody');
  
  try {
    const newFavorite = await addFavorite(userId, phrase_id);
    c.status(201 as any);
    return c.json(newFavorite);
  } catch (error) {
    if (error instanceof Error && error.message.includes('already in favorites')) {
      c.status(409 as any);
      return c.json({
        error: {
          code: 'DUPLICATE_FAVORITE',
          message: 'Phrase is already in favorites'
        }
      });
    }
    throw error;
  }
}

// お気に入り削除
export async function removeFavoriteHandler(c: Context) {
  const id = c.req.param('id');
  const userId = c.get('userId');
  
  // お気に入りが存在するか確認
  const favorite = await getFavoriteById(id);
  if (!favorite) {
    c.status(404 as any);
    return c.json({
      error: {
        code: 'RESOURCE_NOT_FOUND',
        message: 'Favorite not found'
      }
    });
  }
  
  // 自分のお気に入りかどうか確認
  if (favorite.user_id !== userId) {
    c.status(403 as any);
    return c.json({
      error: {
        code: 'FORBIDDEN',
        message: 'You do not have permission to delete this favorite'
      }
    });
  }
  
  const success = await removeFavorite(id, userId);
  
  if (!success) {
    c.status(404 as any);
    return c.json({
      error: {
        code: 'RESOURCE_NOT_FOUND',
        message: 'Favorite not found'
      }
    });
  }
  
  c.status(204 as any);
  return c.body(null);
}

export const favoriteValidators = {
  query: favoriteQuerySchema,
  create: favoriteCreateSchema
};
