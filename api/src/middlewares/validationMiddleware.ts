import { Context, Next } from 'hono';
import { z } from 'zod';

// バリデーションミドルウェア
export function validateBody<T extends z.ZodType>(schema: T) {
  return async (c: Context, next: Next) => {
    try {
      const body = await c.req.json();
      const validatedData = schema.parse(body);
      c.set('validatedBody', validatedData);
      await next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        c.status(400 as any);
        return c.json({
          error: {
            code: 'VALIDATION_FAILED',
            message: error.errors.map(e => e.message).join(', ')
          }
        });
      }
      
      // JSONパースエラーなど
      c.status(400 as any);
      return c.json({
        error: {
          code: 'INVALID_REQUEST',
          message: 'Request body is invalid JSON'
        }
      });
    }
  };
}

// クエリパラメータのバリデーション
export function validateQuery<T extends z.ZodType>(schema: T) {
  return async (c: Context, next: Next) => {
    try {
      const query = c.req.query();
      const validatedData = schema.parse(query);
      c.set('validatedQuery', validatedData);
      await next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        c.status(400 as any);
        return c.json({
          error: {
            code: 'VALIDATION_FAILED',
            message: error.errors.map(e => e.message).join(', ')
          }
        });
      }
      
      // その他のエラー
      c.status(400 as any);
      return c.json({
        error: {
          code: 'INVALID_REQUEST',
          message: 'Invalid query parameters'
        }
      });
    }
  };
}

// 共通のバリデーションスキーマ
export const paginationSchema = z.object({
  page: z.coerce.number().positive().optional().default(1),
  per_page: z.coerce.number().positive().optional().default(20)
});

export const idSchema = z.object({
  id: z.string().uuid()
});

export const dateRangeSchema = z.object({
  from_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  to_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()
});
