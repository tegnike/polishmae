import { Context } from 'hono';
import { z } from 'zod';
import { getLogs, getUserStats } from '../services/logService';
import { paginationSchema, dateRangeSchema } from '../middlewares/validationMiddleware';

// バリデーションスキーマ
const logQuerySchema = paginationSchema.extend({
  ...dateRangeSchema.shape,
  action: z.enum(['study', 'quiz', 'pronounce']).optional()
});

// 学習ログ一覧取得
export async function getLogsHandler(c: Context) {
  const userId = c.get('userId');
  const { page, per_page, from_date, to_date, action } = c.get('validatedQuery');
  
  const result = await getLogs(
    userId,
    page,
    per_page,
    action,
    from_date,
    to_date
  );
  
  return c.json(result);
}

// ユーザー統計取得
export async function getUserStatsHandler(c: Context) {
  const userId = c.get('userId');
  const stats = await getUserStats(userId);
  return c.json(stats);
}

export const logValidators = {
  query: logQuerySchema
};
