import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { errorMiddleware } from './middlewares/errorMiddleware';
import { authMiddleware } from './middlewares/authMiddleware';
import { validateBody, validateQuery } from './middlewares/validationMiddleware';

// コントローラー
import * as authController from './controllers/authController';
import * as phraseController from './controllers/phraseController';
import * as quizController from './controllers/quizController';
import * as favoriteController from './controllers/favoriteController';
import * as logController from './controllers/logController';
import * as pronunciationController from './controllers/pronunciationController';

// アプリケーションの作成
const app = new Hono();

// グローバルミドルウェア
app.use('*', cors());
app.use('*', errorMiddleware);

// ルートエンドポイント
app.get('/', (c) => c.json({ message: 'PolishMae API Server' }));

// 認証ルート
app.post('/v1/auth/signup', validateBody(authController.authValidators.signup), authController.signupHandler);
app.post('/v1/auth/login', validateBody(authController.authValidators.login), authController.loginHandler);
app.post('/v1/auth/refresh', validateBody(authController.authValidators.refreshToken), authController.refreshTokenHandler);
app.post('/v1/auth/logout', authMiddleware, authController.logoutHandler);

// フレーズルート
app.get('/v1/phrases', validateQuery(phraseController.phraseValidators.query), phraseController.getPhrasesHandler);
app.get('/v1/phrases/:id', phraseController.getPhraseByIdHandler);
app.post('/v1/phrases', validateBody(phraseController.phraseValidators.create), phraseController.createPhraseHandler);
app.put('/v1/phrases/:id', validateBody(phraseController.phraseValidators.update), phraseController.updatePhraseHandler);
app.delete('/v1/phrases/:id', phraseController.deletePhraseHandler);

// クイズルート
app.get('/v1/quizzes', validateQuery(quizController.quizValidators.query), quizController.getQuizzesHandler);
app.get('/v1/quizzes/:id', quizController.getQuizByIdHandler);
app.post('/v1/quizzes', validateBody(quizController.quizValidators.create), quizController.createQuizHandler);
app.put('/v1/quizzes/:id', validateBody(quizController.quizValidators.update), quizController.updateQuizHandler);
app.delete('/v1/quizzes/:id', quizController.deleteQuizHandler);
app.post('/v1/quizzes/:id/answer', authMiddleware, validateBody(quizController.quizValidators.answer), quizController.checkQuizAnswerHandler);

// お気に入りルート
app.get('/v1/favorites', authMiddleware, validateQuery(favoriteController.favoriteValidators.query), favoriteController.getFavoritesHandler);
app.post('/v1/favorites', authMiddleware, validateBody(favoriteController.favoriteValidators.create), favoriteController.addFavoriteHandler);
app.delete('/v1/favorites/:id', authMiddleware, favoriteController.removeFavoriteHandler);

// 学習ログルート
app.get('/v1/logs', authMiddleware, validateQuery(logController.logValidators.query), logController.getLogsHandler);

// 統計ルート
app.get('/v1/stats', authMiddleware, logController.getUserStatsHandler);

// 発音ルート
app.post('/v1/pronunciation', authMiddleware, pronunciationController.calculatePronunciationScoreHandler);

export default app;
