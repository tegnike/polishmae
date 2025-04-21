import { Context } from 'hono';
import { z } from 'zod';
import { signup, login, refreshToken, logout } from '../services/authService';

// バリデーションスキーマ
const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

const refreshTokenSchema = z.object({
  refresh_token: z.string()
});

// 新規登録
export async function signupHandler(c: Context) {
  const { email, password } = c.get('validatedBody');
  const result = await signup(email, password);
  c.status(201 as any);
  return c.json(result);
}

// ログイン
export async function loginHandler(c: Context) {
  const { email, password } = c.get('validatedBody');
  const result = await login(email, password);
  return c.json(result);
}

// トークンリフレッシュ
export async function refreshTokenHandler(c: Context) {
  const { refresh_token } = c.get('validatedBody');
  const result = await refreshToken(refresh_token);
  return c.json(result);
}

// ログアウト
export async function logoutHandler(c: Context) {
  const authHeader = c.req.header('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    await logout(token);
  }
  return c.json({});
}

export const authValidators = {
  signup: signupSchema,
  login: loginSchema,
  refreshToken: refreshTokenSchema
};
