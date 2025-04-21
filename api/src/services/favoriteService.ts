import { supabase, USE_MOCK_DB } from './supabase';
import { mockFavorites, mockPhrases } from './mockData';
import { Favorite, FavoriteWithPhrase, ApiResponse } from '../models/types';
import { getPhraseById } from './phraseService';

// お気に入り一覧の取得（ページネーション対応）
export async function getFavorites(
  userId: string,
  page: number = 1,
  perPage: number = 20
): Promise<ApiResponse<FavoriteWithPhrase[]>> {
  if (USE_MOCK_DB) {
    // モックデータを使用
    let userFavorites = mockFavorites.filter(fav => fav.user_id === userId);

    // ページネーション
    const start = (page - 1) * perPage;
    const end = start + perPage;
    const paginatedFavorites = userFavorites.slice(start, end);

    // フレーズ情報を追加
    const favoritesWithPhrase: FavoriteWithPhrase[] = await Promise.all(
      paginatedFavorites.map(async fav => {
        const phrase = mockPhrases.find(p => p.id === fav.phrase_id);
        if (!phrase) {
          throw new Error(`Phrase with id ${fav.phrase_id} not found`);
        }
        return {
          id: fav.id,
          user_id: fav.user_id,
          created_at: fav.created_at,
          phrase: phrase
        };
      })
    );

    return {
      data: favoritesWithPhrase,
      meta: {
        page,
        per_page: perPage,
        total: userFavorites.length
      }
    };
  } else {
    // Supabaseを使用
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;
    
    const { data, error, count } = await supabase
      .from('favorites')
      .select('*, phrase:phrases(*)', { count: 'exact' })
      .eq('user_id', userId)
      .range(from, to)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch favorites: ${error.message}`);
    }

    // 型変換
    const favoritesWithPhrase = data.map(item => ({
      id: item.id,
      user_id: item.user_id,
      created_at: item.created_at,
      phrase: item.phrase
    }));

    return {
      data: favoritesWithPhrase as FavoriteWithPhrase[],
      meta: {
        page,
        per_page: perPage,
        total: count || 0
      }
    };
  }
}

// お気に入りの追加
export async function addFavorite(userId: string, phraseId: string): Promise<Favorite> {
  // フレーズが存在するか確認
  const phrase = await getPhraseById(phraseId);
  if (!phrase) {
    throw new Error(`Phrase with id ${phraseId} not found`);
  }

  // 既にお気に入りに追加されているか確認
  if (USE_MOCK_DB) {
    const existingFavorite = mockFavorites.find(
      fav => fav.user_id === userId && fav.phrase_id === phraseId
    );
    if (existingFavorite) {
      throw new Error('Phrase is already in favorites');
    }

    // モックデータを使用
    const newFavorite: Favorite = {
      id: (mockFavorites.length + 1).toString(),
      user_id: userId,
      phrase_id: phraseId,
      created_at: new Date().toISOString()
    };
    mockFavorites.push(newFavorite);
    return newFavorite;
  } else {
    // 既存のお気に入りをチェック
    const { data: existingFavorite, error: checkError } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', userId)
      .eq('phrase_id', phraseId)
      .maybeSingle();

    if (checkError) {
      throw new Error(`Failed to check existing favorite: ${checkError.message}`);
    }

    if (existingFavorite) {
      throw new Error('Phrase is already in favorites');
    }

    // Supabaseを使用
    const { data, error } = await supabase
      .from('favorites')
      .insert([{ user_id: userId, phrase_id: phraseId }])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to add favorite: ${error.message}`);
    }

    return data as Favorite;
  }
}

// お気に入りの削除
export async function removeFavorite(id: string, userId: string): Promise<boolean> {
  if (USE_MOCK_DB) {
    // モックデータを使用
    const index = mockFavorites.findIndex(fav => fav.id === id && fav.user_id === userId);
    if (index === -1) {
      return false;
    }
    mockFavorites.splice(index, 1);
    return true;
  } else {
    // Supabaseを使用
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to remove favorite: ${error.message}`);
    }

    return true;
  }
}

// お気に入りの取得（ID指定）
export async function getFavoriteById(id: string): Promise<Favorite | null> {
  if (USE_MOCK_DB) {
    // モックデータを使用
    const favorite = mockFavorites.find(fav => fav.id === id);
    return favorite || null;
  } else {
    // Supabaseを使用
    const { data, error } = await supabase
      .from('favorites')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // レコードが見つからない場合
        return null;
      }
      throw new Error(`Failed to fetch favorite: ${error.message}`);
    }

    return data as Favorite;
  }
}
