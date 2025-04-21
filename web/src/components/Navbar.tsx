'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';

export default function Navbar() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // クライアントサイドでの初期化処理
  useEffect(() => {
    setMounted(true);
    // ログイン状態の確認はクライアントサイドでのみ行う
    setIsLoggedIn(authService.isAuthenticated());
  }, []);
  
  const handleLogout = async () => {
    try {
      await authService.logout();
      router.push('/login');
    } catch (error) {
      console.error('ログアウトエラー:', error);
    }
  };
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  return (
    <nav className="bg-blue-800 text-white shadow-md">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between">
          <div className="flex space-x-4">
            {/* ロゴ */}
            <div>
              <Link href="/" className="flex items-center py-5 px-2 text-white">
                <span className="font-bold text-xl">PolishMae</span>
              </Link>
            </div>
            
            {/* メインナビゲーション - デスクトップ */}
            <div className="hidden md:flex items-center space-x-1">
              <Link href="/phrases" className="py-5 px-3 hover:text-blue-200">
                フレーズ
              </Link>
              <Link href="/quizzes" className="py-5 px-3 hover:text-blue-200">
                クイズ
              </Link>
              <Link href="/pronunciation" className="py-5 px-3 hover:text-blue-200">
                発音練習
              </Link>
              {mounted && isLoggedIn && (
                <Link href="/favorites" className="py-5 px-3 hover:text-blue-200">
                  お気に入り
                </Link>
              )}
              {mounted && isLoggedIn && (
                <Link href="/stats" className="py-5 px-3 hover:text-blue-200">
                  学習状況
                </Link>
              )}
            </div>
          </div>
          
          {/* ログインボタン - デスクトップ */}
          <div className="hidden md:flex items-center space-x-3">
            
            {/* 認証ボタン */}
            {mounted && (isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="py-2 px-3 bg-blue-900 hover:bg-blue-950 text-white rounded transition duration-300"
              >
                ログアウト
              </button>
            ) : (
              <>
                <Link
                  href="/login"
                  className="py-2 px-3 bg-blue-900 hover:bg-blue-950 text-white rounded transition duration-300"
                >
                  ログイン
                </Link>
                <Link
                  href="/signup"
                  className="py-2 px-3 bg-gray-800 hover:bg-gray-700 text-blue-300 rounded transition duration-300"
                >
                  新規登録
                </Link>
              </>
            ))}
          </div>
          
          {/* モバイルメニューボタン */}
          <div className="md:hidden flex items-center">
            
            <button onClick={toggleMenu} className="mobile-menu-button">
              <svg
                className="w-6 h-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* モバイルメニュー */}
      <div className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'}`}>
        <Link href="/phrases" className="block py-2 px-4 text-sm hover:bg-blue-900">
          フレーズ
        </Link>
        <Link href="/quizzes" className="block py-2 px-4 text-sm hover:bg-blue-900">
          クイズ
        </Link>
        <Link href="/pronunciation" className="block py-2 px-4 text-sm hover:bg-blue-900">
          発音練習
        </Link>
        {mounted && isLoggedIn && (
          <Link href="/favorites" className="block py-2 px-4 text-sm hover:bg-blue-900">
            お気に入り
          </Link>
        )}
        {mounted && isLoggedIn && (
          <Link href="/stats" className="block py-2 px-4 text-sm hover:bg-blue-900">
            学習状況
          </Link>
        )}
        
        {/* 認証ボタン - モバイル */}
        {mounted && (
          <div className="py-2 px-4 border-t border-blue-900">
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="block w-full text-left py-2 px-3 bg-blue-900 hover:bg-blue-950 text-white rounded transition duration-300"
              >
                ログアウト
              </button>
            ) : (
              <>
                <Link
                  href="/login"
                  className="block w-full text-left py-2 px-3 bg-blue-900 hover:bg-blue-950 text-white rounded transition duration-300 mb-2"
                >
                  ログイン
                </Link>
                <Link
                  href="/signup"
                  className="block w-full text-left py-2 px-3 bg-gray-800 hover:bg-gray-700 text-blue-300 rounded transition duration-300"
                >
                  新規登録
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
