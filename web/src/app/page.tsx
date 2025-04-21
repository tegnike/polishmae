import Link from 'next/link';

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto">
      <section className="text-center py-12">
        <h1 className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-4">PolishMae</h1>
        <p className="text-xl text-gray-700 dark:text-gray-300 mb-8">ポーランド語の会話力向上のための学習アプリ</p>
        
        <div className="flex justify-center space-x-4">
          <Link
            href="/phrases"
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300"
          >
            フレーズを学ぶ
          </Link>
          <Link
            href="/quizzes"
            className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-300"
          >
            クイズに挑戦
          </Link>
        </div>
      </section>
      
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8">
        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">フレーズ学習</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            カテゴリ別にポーランド語のフレーズを学びましょう。音声再生機能で正確な発音を確認できます。
          </p>
          <Link
            href="/phrases"
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
          >
            フレーズ一覧を見る →
          </Link>
        </div>
        
        <div className="dark:bg-gray-800 bg-gray-50 p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">クイズ形式の確認</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            学習したフレーズの理解度を確認するためのクイズに挑戦しましょう。
          </p>
          <Link
            href="/quizzes"
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
          >
            クイズに挑戦する →
          </Link>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">発音練習</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            音声認識技術を使って、あなたの発音を評価します。正確なポーランド語の発音を身につけましょう。
          </p>
          <Link
            href="/pronunciation"
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
          >
            発音練習を始める →
          </Link>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">お気に入り機能</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            学習中のフレーズをお気に入りに追加して、効率的に復習できます。
          </p>
          <Link
            href="/favorites"
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
          >
            お気に入りを見る →
          </Link>
        </div>
      </section>
      
      <section className="bg-blue-50 dark:bg-blue-900 p-6 rounded-lg shadow-md my-8">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">使い方</h2>
        <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300">
          <li>「フレーズ」ページでポーランド語のフレーズを学びます。</li>
          <li>音声ボタンをクリックして、正確な発音を聞きます。</li>
          <li>「クイズ」ページで理解度を確認します。</li>
          <li>「発音練習」ページで自分の発音を評価してもらいます。</li>
          <li>復習したいフレーズは「お気に入り」に追加しておきましょう。</li>
        </ol>
      </section>
    </div>
  );
}
