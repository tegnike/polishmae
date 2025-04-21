import { supabase, USE_MOCK_DB } from './supabase';
import { mockUsers, mockSessions } from './mockData';
import { AuthResponse } from '../models/types';
import crypto from 'crypto';

// ユーザー登録
export async function signup(email: string, password: string): Promise<AuthResponse> {
  if (USE_MOCK_DB) {
    // モックデータを使用
    // 既存ユーザーチェック
    const existingUser = mockUsers.find(user => user.email === email);
    if (existingUser) {
      throw new Error('Email address is already registered');
    }

    // 新規ユーザー作成
    const userId = `user-${mockUsers.length + 1}`;
    mockUsers.push({
      id: userId,
      email
    });

    // セッション作成
    const accessToken = generateMockToken();
    const refreshToken = generateMockToken();
    mockSessions[accessToken] = {
      user_id: userId,
      expires_at: new Date(Date.now() + 3600 * 1000).toISOString()
    };

    return {
      user: {
        id: userId,
        email
      },
      session: {
        access_token: accessToken,
        refresh_token: refreshToken
      }
    };
  } else {
    // Supabaseを使用
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user || !data.session) {
      throw new Error('Failed to create user');
    }

    return {
      user: {
        id: data.user.id,
        email: data.user.email || ''
      },
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token
      }
    };
  }
}

// ログイン
export async function login(email: string, password: string): Promise<AuthResponse> {
  if (USE_MOCK_DB) {
    // モックデータを使用
    const user = mockUsers.find(user => user.email === email);
    if (!user) {
      throw new Error('Incorrect email or password');
    }

    // 実際のパスワードチェックはモックでは省略

    // セッション作成
    const accessToken = generateMockToken();
    const refreshToken = generateMockToken();
    mockSessions[accessToken] = {
      user_id: user.id,
      expires_at: new Date(Date.now() + 3600 * 1000).toISOString()
    };

    return {
      session: {
        access_token: accessToken,
        refresh_token: refreshToken
      }
    };
  } else {
    // Supabaseを使用
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.session) {
      throw new Error('Failed to login');
    }

    return {
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token
      }
    };
  }
}

// トークンリフレッシュ
export async function refreshToken(refreshToken: string): Promise<AuthResponse> {
  if (USE_MOCK_DB) {
    // モックデータを使用
    // 実際のリフレッシュトークン検証はモックでは省略
    
    // 新しいセッション作成
    const accessToken = generateMockToken();
    const newRefreshToken = generateMockToken();
    
    // ユーザーIDはダミー
    const userId = 'user-1';
    mockSessions[accessToken] = {
      user_id: userId,
      expires_at: new Date(Date.now() + 3600 * 1000).toISOString()
    };

    return {
      session: {
        access_token: accessToken,
        refresh_token: newRefreshToken
      }
    };
  } else {
    // Supabaseを使用
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.session) {
      throw new Error('Failed to refresh token');
    }

    return {
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token
      }
    };
  }
}

// ログアウト
export async function logout(accessToken: string): Promise<void> {
  if (USE_MOCK_DB) {
    // モックデータを使用
    delete mockSessions[accessToken];
  } else {
    // Supabaseを使用
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
  }
}

// トークン検証
export async function validateToken(accessToken: string): Promise<string> {
  if (USE_MOCK_DB) {
    // モックデータを使用
    const session = mockSessions[accessToken];
    if (!session) {
      throw new Error('Invalid token');
    }

    // 有効期限チェック
    if (new Date(session.expires_at) < new Date()) {
      throw new Error('Token expired');
    }

    return session.user_id;
  } else {
    // Supabaseを使用
    const { data, error } = await supabase.auth.getUser(accessToken);
    
    if (error) {
      throw new Error('Invalid token');
    }

    if (!data.user) {
      throw new Error('User not found');
    }

    return data.user.id;
  }
}

// モック用のランダムトークン生成
function generateMockToken(): string {
  return crypto.randomBytes(32).toString('hex');
}
