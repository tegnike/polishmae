import { Context, Next } from 'hono';

// エラーハンドリングミドルウェア
export async function errorMiddleware(c: Context, next: Next) {
  try {
    // 次のミドルウェアまたはハンドラーを実行
    await next();
  } catch (error) {
    console.error('Error:', error);

    // エラーの種類に応じてレスポンスを返す
    if (error instanceof Error) {
      const message = error.message;

      // エラーメッセージに基づいてエラーコードとステータスコードを決定
      let code = 'INTERNAL_SERVER_ERROR';
      let status: 400 | 401 | 403 | 404 | 409 | 500 = 500;

      if (message.includes('not found') || message.includes('does not exist')) {
        code = 'RESOURCE_NOT_FOUND';
        status = 404;
      } else if (message.includes('already in favorites')) {
        code = 'DUPLICATE_FAVORITE';
        status = 409;
      } else if (message.includes('already registered')) {
        code = 'EMAIL_ALREADY_EXISTS';
        status = 409;
      } else if (message.includes('Incorrect email or password')) {
        code = 'INVALID_CREDENTIALS';
        status = 401;
      } else if (message.includes('Invalid token') || message.includes('Token expired')) {
        code = 'UNAUTHENTICATED';
        status = 401;
      } else if (message.includes('validation')) {
        code = 'VALIDATION_FAILED';
        status = 400;
      }

      c.status(status as any);
      return c.json({
        error: {
          code,
          message
        }
      });
    }

    // 未知のエラー
    c.status(500 as any);
    return c.json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred'
      }
    });
  }
}
