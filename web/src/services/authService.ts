import apiClient from '@/lib/axios';
import { AuthResponse } from '@/lib/types';

export const authService = {
  /**
   * ユーザー登録
   * @param email メールアドレス
   * @param password パスワード
   */
  async signup(email: string, password: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/signup', {
      email,
      password,
    });
    
    // トークンをローカルストレージに保存
    if (response.data.session) {
      localStorage.setItem('access_token', response.data.session.access_token);
      localStorage.setItem('refresh_token', response.data.session.refresh_token);
    }
    
    return response.data;
  },
  
  /**
   * ログイン
   * @param email メールアドレス
   * @param password パスワード
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', {
      email,
      password,
    });
    
    // トークンをローカルストレージに保存
    if (response.data.session) {
      localStorage.setItem('access_token', response.data.session.access_token);
      localStorage.setItem('refresh_token', response.data.session.refresh_token);
    }
    
    return response.data;
  },
  
  /**
   * トークン更新
   * @param refreshToken リフレッシュトークン
   */
  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/refresh', {
      refresh_token: refreshToken,
    });
    
    // 新しいトークンをローカルストレージに保存
    if (response.data.session) {
      localStorage.setItem('access_token', response.data.session.access_token);
      localStorage.setItem('refresh_token', response.data.session.refresh_token);
    }
    
    return response.data;
  },
  
  /**
   * ログアウト
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      // ローカルストレージからトークンを削除
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  },
  
  /**
   * 認証状態の確認
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  },
  
  /**
   * アクセストークンの取得
   */
  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  },
  
  /**
   * リフレッシュトークンの取得
   */
  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }
};
