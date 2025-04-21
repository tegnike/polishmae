'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/services/authService';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 新規登録処理
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 入力チェック
    if (!email || !password || !confirmPassword) {
      setError('すべての項目を入力してください。');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('パスワードが一致しません。');
      return;
    }
    
    if (password.length < 8) {
      setError('パスワードは8文字以上で入力してください。');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      await authService.signup(email, password);
      
      // 登録成功後はホームページにリダイレクト
      router.push('/');
    } catch (err: unknown) {
      console.error('新規登録エラー:', err);
      
      // エラーメッセージの設定
      if (err && typeof err === 'object' && 'response' in err && 
          err.response && typeof err.response === 'object' && 
          'data' in err.response && err.response.data && 
          typeof err.response.data === 'object' && 'error' in err.response.data && 
          err.response.data.error && typeof err.response.data.error === 'object' && 
          'code' in err.response.data.error && 
          err.response.data.error.code === 'EMAIL_ALREADY_EXISTS') {
        setError('このメールアドレスは既に登録されています。');
      } else {
        setError('新規登録中にエラーが発生しました。後でもう一度お試しください。');
      }
      
      setIsLoading(false);
    }
  };
  
  // デモ用登録（APIがモックの場合に使用）
  const handleDemoSignup = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // ローカルストレージにダミートークンを保存
      localStorage.setItem('access_token', 'demo_access_token');
      localStorage.setItem('refresh_token', 'demo_refresh_token');
      
      // ホームページにリダイレクト
      router.push('/');
    } catch (err) {
      console.error('デモ登録エラー:', err);
      setError('登録中にエラーが発生しました。');
      setIsLoading(false);
    }
  };
  
  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6 text-center">新規登録</h1>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        {/* エラーメッセージ */}
        {error && (
          <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSignup} className="space-y-4">
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
              placeholder="8文字以上"
              disabled={isLoading}
            />
          </div>
          
          <div>
            <label htmlFor="confirmPassword" className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
              パスワード（確認）
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
              placeholder="パスワードを再入力"
              disabled={isLoading}
            />
          </div>
          
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? '登録中...' : '登録する'}
          </button>
        </form>
        
        <div className="mt-6">
          <button
            onClick={handleDemoSignup}
            className="w-full py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
            disabled={isLoading}
          >
            デモユーザーとして登録
          </button>
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            既にアカウントをお持ちの場合は
            <Link href="/login" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 ml-1">
              ログイン
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
