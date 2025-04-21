import { serve } from '@hono/node-server';
import app from './routes';
import dotenv from 'dotenv';

// 環境変数の読み込み
dotenv.config();

// ポート設定
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;

// サーバー起動
console.log(`Starting server on port ${PORT}...`);
serve({
  fetch: app.fetch,
  port: PORT
});

console.log(`Server running at http://localhost:${PORT}/`);
console.log(`API Documentation available at http://localhost:${PORT}/v1`);
console.log('Press Ctrl+C to stop the server');

// 環境情報
console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`Database: ${process.env.USE_MOCK_DB === 'false' ? 'Supabase' : 'Mock'}`);
