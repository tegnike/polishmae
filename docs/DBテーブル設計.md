# DBテーブル設計 (Supabase)

### profiles
| カラム名       | 型           | 属性                   | 説明                     |
|---------------|-------------|------------------------|--------------------------|
| id            | uuid        | PK, FK → auth.users(id) ON DELETE CASCADE | ユーザーID (Authと連携) |
| last_login    | timestamp   |                        | 最終ログイン日時         |

### phrases
| カラム名       | 型           | 属性                   | 説明                       |
|---------------|-------------|------------------------|----------------------------|
| id            | uuid        | PK, DEFAULT gen_random_uuid() | フレーズID                 |
| polish_text   | text        | NOT NULL               | ポーランド語テキスト       |
| japanese_text | text        | NOT NULL               | 日本語対訳                 |
| category      | text        | NOT NULL               | カテゴリ名（例: cafe）    |
| created_at    | timestamp   | DEFAULT now()          | 作成日時                   |

### quizzes
| カラム名       | 型           | 属性                   | 説明                                  |
|---------------|-------------|------------------------|---------------------------------------|
| id            | uuid        | PK, DEFAULT gen_random_uuid() | クイズID                              |
| phrase_id     | uuid        | FK → phrases(id) ON DELETE CASCADE ON UPDATE CASCADE | 対象フレーズ                          |
| type          | text        | NOT NULL               | "multiple_choice" / "yes_no"      |
| options       | jsonb       | NOT NULL               | 選択肢 JSON 配列 (例: `[{"id":"a", "text":"..."}, {"id":"b", "text":"..."}]`) |
| answer        | text        | NOT NULL               | 正解の options 内の id                |
| created_at    | timestamp   | DEFAULT now()          | 作成日時                              |

### favorites
| カラム名       | 型           | 属性                   | 説明               |
|---------------|-------------|------------------------|--------------------|
| id            | uuid        | PK, DEFAULT gen_random_uuid() | お気に入りID       |
| user_id       | uuid        | FK → auth.users(id) ON DELETE CASCADE ON UPDATE CASCADE | ユーザーID (Auth)  |
| phrase_id     | uuid        | FK → phrases(id) ON DELETE CASCADE ON UPDATE CASCADE | フレーズID         |
| created_at    | timestamp   | DEFAULT now()          | 登録日時           |

### logs
| カラム名       | 型           | 属性                   | 説明                               |
|---------------|-------------|------------------------|------------------------------------|
| id            | uuid        | PK, DEFAULT gen_random_uuid() | ログID                              |
| user_id       | uuid        | FK → auth.users(id) ON DELETE CASCADE ON UPDATE CASCADE | ユーザーID (Auth)                   |
| phrase_id     | uuid        | FK → phrases(id) ON DELETE CASCADE ON UPDATE CASCADE | 関連フレーズID                      |
| quiz_id       | uuid        | FK → quizzes(id) ON DELETE SET NULL ON UPDATE CASCADE, NULLABLE | クイズ回答ログ（該当時）           |
| action        | text        | NOT NULL               | "study" / "quiz" / "pronounce"|
| result        | numeric     |                        | クイズ正否 (`1`/`0`) or 発音スコア (`0.0`〜`1.0`) |
| created_at    | timestamp   | DEFAULT now()          | 記録日時                            |
