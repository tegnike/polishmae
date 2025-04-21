import axios from 'axios';

// APIクライアントの基本設定
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// リクエストインターセプター（認証トークンの追加など）
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// レスポンスインターセプター（エラーハンドリングなど）
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // APIエラーハンドリング
    const originalRequest = error.config;
    
    // 認証エラー（401）の場合、リフレッシュトークンを使用して再認証を試みる
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          throw new Error('リフレッシュトークンがありません');
        }
        
        const response = await axios.post(
          `${apiClient.defaults.baseURL}/auth/refresh`,
          { refresh_token: refreshToken }
        );
        
        const { access_token, refresh_token } = response.data;
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('refresh_token', refresh_token);
        
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // リフレッシュトークンが無効な場合はログアウト
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
