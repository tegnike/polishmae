import { Context } from 'hono';
import { z } from 'zod';
import { 
  getQuizzes, 
  getQuizById, 
  createQuiz, 
  updateQuiz, 
  deleteQuiz,
  checkQuizAnswer
} from '../services/quizService';
import { paginationSchema } from '../middlewares/validationMiddleware';
import { addLog } from '../services/logService';

// バリデーションスキーマ
const quizQuerySchema = paginationSchema.extend({
  phrase_id: z.string().uuid().optional()
});

const quizOptionSchema = z.object({
  id: z.string(),
  text: z.string()
});

const quizCreateSchema = z.object({
  phrase_id: z.string().uuid(),
  type: z.enum(['multiple_choice', 'yes_no']),
  options: z.array(quizOptionSchema),
  answer: z.string()
}).refine(data => {
  // 選択肢の中に正解が含まれているか確認
  return data.options.some(option => option.id === data.answer);
}, {
  message: "Answer must be one of the option ids",
  path: ["answer"]
});

const quizUpdateSchema = z.object({
  phrase_id: z.string().uuid().optional(),
  type: z.enum(['multiple_choice', 'yes_no']).optional(),
  options: z.array(quizOptionSchema).optional(),
  answer: z.string().optional()
}).refine(data => {
  // 選択肢と正解が両方更新される場合、正解が選択肢に含まれているか確認
  if (data.options && data.answer) {
    return data.options.some(option => option.id === data.answer);
  }
  return true;
}, {
  message: "Answer must be one of the option ids",
  path: ["answer"]
});

const quizAnswerSchema = z.object({
  selected: z.string()
});

// クイズ一覧取得
export async function getQuizzesHandler(c: Context) {
  const { page, per_page, phrase_id } = c.get('validatedQuery');
  const result = await getQuizzes(page, per_page, phrase_id);
  return c.json(result);
}

// クイズ詳細取得
export async function getQuizByIdHandler(c: Context) {
  const id = c.req.param('id');
  const quiz = await getQuizById(id);
  
  if (!quiz) {
    c.status(404 as any);
    return c.json({
      error: {
        code: 'RESOURCE_NOT_FOUND',
        message: 'Quiz not found'
      }
    });
  }
  
  return c.json(quiz);
}

// クイズ作成
export async function createQuizHandler(c: Context) {
  const quizData = c.get('validatedBody');
  const newQuiz = await createQuiz(quizData);
  c.status(201 as any);
  return c.json(newQuiz);
}

// クイズ更新
export async function updateQuizHandler(c: Context) {
  const id = c.req.param('id');
  const updates = c.get('validatedBody');
  
  const updatedQuiz = await updateQuiz(id, updates);
  
  if (!updatedQuiz) {
    c.status(404 as any);
    return c.json({
      error: {
        code: 'RESOURCE_NOT_FOUND',
        message: 'Quiz not found'
      }
    });
  }
  
  return c.json(updatedQuiz);
}

// クイズ削除
export async function deleteQuizHandler(c: Context) {
  const id = c.req.param('id');
  const success = await deleteQuiz(id);
  
  if (!success) {
    c.status(404 as any);
    return c.json({
      error: {
        code: 'RESOURCE_NOT_FOUND',
        message: 'Quiz not found'
      }
    });
  }
  
  c.status(204 as any);
  return c.body(null);
}

// クイズ回答チェック
export async function checkQuizAnswerHandler(c: Context) {
  const id = c.req.param('id');
  const { selected } = c.get('validatedBody');
  const userId = c.get('userId');
  
  // クイズが存在するか確認
  const quiz = await getQuizById(id);
  if (!quiz) {
    c.status(404 as any);
    return c.json({
      error: {
        code: 'RESOURCE_NOT_FOUND',
        message: 'Quiz not found'
      }
    });
  }
  
  // 回答をチェック
  const result = await checkQuizAnswer(id, selected);
  
  // 学習ログを記録
  await addLog({
    user_id: userId,
    phrase_id: quiz.phrase_id,
    quiz_id: id,
    action: 'quiz',
    result: result.correct ? 1 : 0
  });
  
  return c.json(result);
}

export const quizValidators = {
  query: quizQuerySchema,
  create: quizCreateSchema,
  update: quizUpdateSchema,
  answer: quizAnswerSchema
};
