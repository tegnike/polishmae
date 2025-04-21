'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/services/authService';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // ログイン処理
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('メールアドレスとパスワードを入力してください。');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      await authService.login(email, password);
      
      // ログイン成功後はホームページにリダイレクト
      router.push('/');
    } catch (err: unknown) {
      console.error('ログインエラー:', err);
      
      // エラーメッセージの設定
      if (err && typeof err === 'object' && 'response' in err && 
          err.response && typeof err.response === 'object' && 
          'data' in err.response && err.response.data && 
          typeof err.response.data === 'object' && 'error' in err.response.data && 
          err.response.data.error && typeof err.response.data.error === 'object' && 
          'code' in err.response.data.error && 
          err.response.data.error.code === 'INVALID_CREDENTIALS') {
        setError('メールアドレスまたはパスワードが正しくありません。');
      } else {
        setError('ログイン中にエラーが発生しました。後でもう一度お試しください。');
      }
      
      setIsLoading(false);
    }
  };
  
  // デモ用ログイン（APIがモックの場合に使用）
  const handleDemoLogin = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // ローカルストレージにダミートークンを保存
      localStorage.setItem('access_token', 'demo_access_token');
      localStorage.setItem('refresh_token', 'demo_refresh_token');
      
      // ホームページにリダイレクト
      router.push('/');
    } catch (err) {
      console.error('デモログインエラー:', err);
      setError('ログイン中にエラーが発生しました。');
      setIsLoading(false);
    }
  };
  
  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6 text-center">ログイン</h1>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        {/* エラーメッセージ */}
        {error && (
          <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
              メールアドレス
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
              placeholder="example@example.com"
              disabled={isLoading}
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
              パスワード
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
              placeholder="********"
              disabled={isLoading}
            />
          </div>
          
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? 'ログイン中...' : 'ログイン'}
          </button>
        </form>
        
        <div className="mt-6">
          <button
            onClick={handleDemoLogin}
            className="w-full py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
            disabled={isLoading}
          >
            デモユーザーとしてログイン
          </button>
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            アカウントをお持ちでない場合は
            <Link href="/signup" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 ml-1">
              新規登録
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
