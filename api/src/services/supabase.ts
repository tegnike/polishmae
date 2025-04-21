import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// 環境変数の読み込み
dotenv.config();

// 環境変数からSupabaseの接続情報を取得
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// 環境変数が設定されていない場合はエラーを投げる
if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL and Key must be set in environment variables');
}

// Supabaseクライアントの作成
export const supabase = createClient(supabaseUrl, supabaseKey);

// DBがモックの場合は、実際のSupabaseクライアントの代わりにモックデータを使用
// 本番環境では、このフラグをfalseに設定する
export const USE_MOCK_DB = true;
