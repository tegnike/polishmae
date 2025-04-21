import { Context, Next } from 'hono';
import { validateToken } from '../services/authService';

// 認証ミドルウェア
export async function authMiddleware(c: Context, next: Next) {
  try {
    // Authorizationヘッダーからトークンを取得
    const authHeader = c.req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      c.status(401 as any);
      return c.json({
        error: {
          code: 'UNAUTHENTICATED',
          message: 'Access token is missing or invalid'
        }
      });
    }

    const token = authHeader.split(' ')[1];
    
    // トークンを検証し、ユーザーIDを取得
    const userId = await validateToken(token);
    
    // ユーザーIDをコンテキストに設定
    c.set('userId', userId);
    
    // 次のミドルウェアまたはハンドラーに進む
    await next();
  } catch (error) {
    // トークンが無効な場合
    c.status(401 as any);
    return c.json({
      error: {
        code: 'UNAUTHENTICATED',
        message: 'Access token is missing or invalid'
      }
    });
  }
}
