import { supabase, USE_MOCK_DB } from './supabase';
import { mockPhrases } from './mockData';
import { Phrase, ApiResponse } from '../models/types';

// フレーズの取得（ページネーション、カテゴリフィルタ対応）
export async function getPhrases(
  page: number = 1,
  perPage: number = 20,
  category?: string
): Promise<ApiResponse<Phrase[]>> {
  if (USE_MOCK_DB) {
    // モックデータを使用
    let filteredPhrases = category
      ? mockPhrases.filter(phrase => phrase.category === category)
      : mockPhrases;

    // ページネーション
    const start = (page - 1) * perPage;
    const end = start + perPage;
    const paginatedPhrases = filteredPhrases.slice(start, end);

    return {
      data: paginatedPhrases,
      meta: {
        page,
        per_page: perPage,
        total: filteredPhrases.length
      }
    };
  } else {
    // Supabaseを使用
    let query = supabase.from('phrases').select('*', { count: 'exact' });

    // カテゴリフィルタが指定されている場合
    if (category) {
      query = query.eq('category', category);
    }

    // ページネーション
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;
    
    const { data, error, count } = await query
      .range(from, to)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch phrases: ${error.message}`);
    }

    return {
      data: data as Phrase[],
      meta: {
        page,
        per_page: perPage,
        total: count || 0
      }
    };
  }
}

// IDによるフレーズの取得
export async function getPhraseById(id: string): Promise<Phrase | null> {
  if (USE_MOCK_DB) {
    // モックデータを使用
    const phrase = mockPhrases.find(p => p.id === id);
    return phrase || null;
  } else {
    // Supabaseを使用
    const { data, error } = await supabase
      .from('phrases')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // レコードが見つからない場合
        return null;
      }
      throw new Error(`Failed to fetch phrase: ${error.message}`);
    }

    return data as Phrase;
  }
}

// フレーズの作成
export async function createPhrase(phrase: Omit<Phrase, 'id' | 'created_at'>): Promise<Phrase> {
  if (USE_MOCK_DB) {
    // モックデータを使用
    const newPhrase: Phrase = {
      id: (mockPhrases.length + 1).toString(),
      ...phrase,
      created_at: new Date().toISOString()
    };
    mockPhrases.push(newPhrase);
    return newPhrase;
  } else {
    // Supabaseを使用
    const { data, error } = await supabase
      .from('phrases')
      .insert([phrase])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create phrase: ${error.message}`);
    }

    return data as Phrase;
  }
}

// フレーズの更新
export async function updatePhrase(
  id: string,
  updates: Partial<Omit<Phrase, 'id' | 'created_at'>>
): Promise<Phrase | null> {
  if (USE_MOCK_DB) {
    // モックデータを使用
    const index = mockPhrases.findIndex(p => p.id === id);
    if (index === -1) {
      return null;
    }

    const updatedPhrase = {
      ...mockPhrases[index],
      ...updates
    };
    mockPhrases[index] = updatedPhrase;
    return updatedPhrase;
  } else {
    // Supabaseを使用
    const { data, error } = await supabase
      .from('phrases')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update phrase: ${error.message}`);
    }

    return data as Phrase;
  }
}

// フレーズの削除
export async function deletePhrase(id: string): Promise<boolean> {
  if (USE_MOCK_DB) {
    // モックデータを使用
    const index = mockPhrases.findIndex(p => p.id === id);
    if (index === -1) {
      return false;
    }
    mockPhrases.splice(index, 1);
    return true;
  } else {
    // Supabaseを使用
    const { error } = await supabase
      .from('phrases')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete phrase: ${error.message}`);
    }

    return true;
  }
}
