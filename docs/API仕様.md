# API仕様

**ベースURL**: `https://api.polishmae.app/v1`  
**認証**: Supabase Auth (JWT)  
- Authorization: `Bearer <access_token>`
- **認証が必要なエンドポイントには `[要認証]` と記載します。**

## バージョニング
- URL パスにバージョンを含む（例：`/v1/...`）

## レスポンス形式
- Content-Type: application/json  
- 成功レスポンス: リソースまたは配列  
- エラー:
  ```json
  {
    "error": {
      "code": "INVALID_REQUEST", // 固有コード
      "message": "詳細メッセージ"
    }
  }
  ```

## エラーコード例
| コード                     | メッセージ例                          | 説明                                 |
|--------------------------|---------------------------------------|--------------------------------------|
| `INVALID_REQUEST`          | Request body is invalid JSON.         | リクエスト形式不正                   |
| `VALIDATION_FAILED`        | Email format is invalid.              | バリデーションエラー（詳細メッセージで補足） |
| `UNAUTHENTICATED`          | Access token is missing or invalid. | 認証トークン無効                     |
| `FORBIDDEN`                | User does not have permission.        | 権限不足                             |
| `NOT_FOUND`                | Resource not found.                   | リソース未検出                       |
| `EMAIL_ALREADY_EXISTS`   | Email address is already registered.  | メールアドレス重複                   |
| `INVALID_CREDENTIALS`    | Incorrect email or password.          | ログイン認証情報誤り                 |
| `INTERNAL_SERVER_ERROR`    | An unexpected error occurred.         | サーバー内部エラー                   |
| `RESOURCE_NOT_FOUND`       | Phrase not found.                     | 指定されたリソースが見つからない（NOT_FOUNDの具体例） |
| `DUPLICATE_FAVORITE`       | Phrase is already in favorites.       | 重複登録エラー（例）                 |

## HTTPステータスコード
| コード | 意味                     |
|-------|--------------------------|
| 200   | OK（成功）               |
| 201   | Created（作成成功）      |
| 204   | No Content（削除成功）   |
| 400   | Bad Request（形式不正）  |
| 401   | Unauthorized（認証失敗） |
| 403   | Forbidden（権限なし）    |
| 404   | Not Found（未検出）      |
| 409   | Conflict（リソース競合、重複など） |
| 500   | Internal Server Error    |

---

## 認証／ユーザー管理

### POST /v1/auth/signup  
新規登録  
**Request**:
```json
{ "email": "user@example.com", "password": "password123" }
```
**Response (201)**:
```json
{ 
  "user": { "id":"uuid", "email":"..." },
  "session": { "access_token":"...", "refresh_token":"..." }
}
```

### POST /v1/auth/login  
ログイン  
**Request**:
```json
{ "email": "user@example.com", "password": "password123" }
```
**Response (200)**:
```json
{ "session": { "access_token":"...", "refresh_token":"..." } }
```

### POST /v1/auth/refresh  
トークン更新  
**Request**:
```json
{ "refresh_token": "..." }
```
**Response (200)**:
```json
{ "access_token":"...", "refresh_token":"..." }
```

### POST /v1/auth/logout  
ログアウト `[要認証]`
**Response (200)**: 空
**エラー例**:
- 401 `UNAUTHENTICATED`: トークン無効

---

## フレーズ管理

### GET /v1/phrases  
フレーズ一覧取得  
**Query**:
- `category`: string (任意)  
- `page`: integer (デフォルト1)  
- `per_page`: integer (デフォルト20)  
**Response (200)**:
```json
{
  "data":[
    { "id":"uuid","polish_text":"...","japanese_text":"...","category":"cafe" }
  ],
  "meta":{ "page":1,"per_page":20,"total":100 }
}
```
**エラー例**:
- 400 `VALIDATION_FAILED`: `page`, `per_page` が数値でない等

### GET /v1/phrases/{id}  
ID指定で詳細取得  
**Response (200)**: フレーズオブジェクト
**エラー例**:
- 404 `RESOURCE_NOT_FOUND`: 指定IDのフレーズが存在しない

### POST /v1/phrases  
フレーズ作成（管理用 - curl等での実行を想定）  
**Request**:
```json
{ "polish_text":"...","japanese_text":"...","category":"greeting" }
```
**Response (201)**: 作成オブジェクト
**エラー例**:
- 400 `VALIDATION_FAILED`: 必須項目不足、型不正
- 401/403: （将来的な管理権限実装時）

### PUT /v1/phrases/{id}  
フレーズ更新（管理用 - curl等での実行を想定）  
**Request**: 更新フィールド  
**Response (200)**: 更新後オブジェクト
**エラー例**:
- 400 `VALIDATION_FAILED`: 型不正
- 404 `RESOURCE_NOT_FOUND`: 指定IDのフレーズが存在しない
- 401/403: （将来的な管理権限実装時）

### DELETE /v1/phrases/{id}  
フレーズ削除（管理用 - curl等での実行を想定）  
**Response (204)**
**エラー例**:
- 404 `RESOURCE_NOT_FOUND`: 指定IDのフレーズが存在しない
- 401/403: （将来的な管理権限実装時）

---

## クイズ

### GET /v1/quizzes  
クイズ一覧取得  
**Query**:
- `phrase_id`: uuid (任意)  
- `page`: integer (デフォルト1)  
- `per_page`: integer (デフォルト20)  
**Response (200)**:
```json
{
  "data": [
    { "id": "uuid", "phrase_id": "...", "type": "multiple_choice", "options": [{"id":"a", "text":"..."}, ...], "answer": "a" }
  ],
  "meta": { "page": 1, "per_page": 20, "total": 50 }
}
```
**エラー例**:
- 400 `VALIDATION_FAILED`: `page`, `per_page` が数値でない等
- 404 `RESOURCE_NOT_FOUND`: `phrase_id` 指定時にフレーズが存在しない

### GET /v1/quizzes/{id}  
ID指定でクイズ詳細取得  
**Response (200)**: クイズオブジェクト
**エラー例**:
- 404 `RESOURCE_NOT_FOUND`: 指定IDのクイズが存在しない

### POST /v1/quizzes  
クイズ作成（管理用 - curl等での実行を想定）  
**Request**:
```json
{ 
  "phrase_id": "uuid",
  "type": "multiple_choice", // or "yes_no"
  "options": [ {"id":"a", "text":"Option A"}, {"id":"b", "text":"Option B"} ], // 構造は type に依存
  "answer": "a" // 正解の options 内の id
}
```
**Response (201)**: 作成されたクイズオブジェクト
**エラー例**:
- 400 `VALIDATION_FAILED`: 必須項目不足、型不正、`phrase_id` が存在しない等
- 401/403: （将来的な管理権限実装時）

### PUT /v1/quizzes/{id}  
クイズ更新（管理用 - curl等での実行を想定）  
**Request**: 更新フィールド  
**Response (200)**: 更新後のクイズオブジェクト
**エラー例**:
- 400 `VALIDATION_FAILED`: 型不正
- 404 `RESOURCE_NOT_FOUND`: 指定IDのクイズが存在しない
- 401/403: （将来的な管理権限実装時）

### DELETE /v1/quizzes/{id}  
クイズ削除（管理用 - curl等での実行を想定）  
**Response (204)**
**エラー例**:
- 404 `RESOURCE_NOT_FOUND`: 指定IDのクイズが存在しない
- 401/403: （将来的な管理権限実装時）

### POST /v1/quizzes/{id}/answer  
回答チェック `[要認証]`
**Request**:
```json
{ "selected": "a" } // ユーザーが選択した options 内の id
```
**Response (200)**:
```json
{ "correct": true, "correct_answer": "a" }
```
**エラー例**:
- 400 `VALIDATION_FAILED`: `selected` が options 内の id でない
- 401 `UNAUTHENTICATED`: トークン無効
- 404 `RESOURCE_NOT_FOUND`: 指定IDのクイズが存在しない

---

## 発音練習

### POST /v1/pronunciation  
音声ファイルをアップロードしスコアを取得 `[要認証]`
**Request (multipart/form-data)**:
- `phrase_id`: uuid  
- `audio_file`: ファイル  
**Response (200)**:
```json
{ "score": 0.87 }
```
**Note**: `score` は、Google Cloud Speech-to-Text API から得られる認識結果の信頼度スコア（confidence score）を基に算出します。これは、アップロードされた音声が API によってどれだけ確信を持って `phrase_id` に対応するテキストとして認識されたかを示します。0.0 から 1.0 の間の値です。
**エラー例**:
- 400 `VALIDATION_FAILED`: `phrase_id` が不正、ファイル形式非対応等
- 401 `UNAUTHENTICATED`: トークン無効
- 404 `RESOURCE_NOT_FOUND`: 指定 `phrase_id` のフレーズが存在しない
- 500 `INTERNAL_SERVER_ERROR`: Google API 通信エラー等

---

## お気に入り

### GET /v1/favorites  
**Query**:
- `page`: integer (デフォルト1)
- `per_page`: integer (デフォルト20)
**Response (200)**:
```json
{
  "data": [{ "id":"uuid","phrase":{...} }],
  "meta": { "page": 1, "per_page": 20, "total": 15 }
}
```
**エラー例**:
- 400 `VALIDATION_FAILED`: `page`, `per_page` が数値でない等
- 401 `UNAUTHENTICATED`: トークン無効

### POST /v1/favorites  
**Request**:
```json
{ "phrase_id":"uuid" }
```
**Response (201)**: 作成オブジェクト (`{ "id":"uuid", "user_id":"...", "phrase_id":"...", "created_at":"..." }`)
**エラー例**:
- 400 `VALIDATION_FAILED`: `phrase_id` が必須
- 401 `UNAUTHENTICATED`: トークン無効
- 404 `RESOURCE_NOT_FOUND`: 指定 `phrase_id` のフレーズが存在しない
- 409 `DUPLICATE_FAVORITE`: 既にお気に入り登録済み

### DELETE /v1/favorites/{id}  
**Response (204)**
**エラー例**:
- 401 `UNAUTHENTICATED`: トークン無効
- 403 `FORBIDDEN`: 他ユーザーのお気に入りを削除しようとした場合
- 404 `RESOURCE_NOT_FOUND`: 指定IDのお気に入りが存在しない、または自分のものではない

---

## 学習ログ・統計

### GET /v1/logs  
学習ログ一覧取得  
**Query**:
- `action`: string (任意)  
- `from_date`, `to_date`: YYYY-MM-DD (任意)  
- `page`: integer (デフォルト1)
- `per_page`: integer (デフォルト20)
**Response (200)**:
```json
{
  "data": [
    { "id": "uuid", "user_id": "...", "phrase_id": "...", "quiz_id": null, "action": "study", "result": null, "created_at": "..." }
  ],
  "meta": { "page": 1, "per_page": 20, "total": 200 }
}
```
**エラー例**:
- 400 `VALIDATION_FAILED`: 日付形式不正、`page`, `per_page` が数値でない等
- 401 `UNAUTHENTICATED`: トークン無効

### GET /v1/stats  
ユーザー統計取得  
**Response (200)**:
```json
{
  "total_phrases_studied":120,
  "total_quizzes":50,
  "quiz_accuracy":0.88,
  "average_pronunciation_score":0.75
}
```
**エラー例**:
- 401 `UNAUTHENTICATED`: トークン無効
