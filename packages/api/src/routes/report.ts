/**
 * 月度报告路由
 */

import { Hono } from 'hono';
import { authMiddleware, getUserId } from '../middleware/auth';
import { getUserStats, getReportList, getReportDetail, generateMonthlyReport } from '../services/report';
import type { ApiErrorResponse } from '../types/auth';

const router = new Hono();

router.get('/stats', authMiddleware, async (c) => {
  try {
    const userId = getUserId(c);
    const stats = await getUserStats(userId);
    return c.json(stats);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return c.json<ApiErrorResponse>({ error: '获取统计失败：' + message, code: 500 }, 500);
  }
});

router.get('/list', authMiddleware, async (c) => {
  try {
    const userId = getUserId(c);
    const reports = await getReportList(userId);
    return c.json({ reports });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return c.json<ApiErrorResponse>({ error: '获取报告列表失败：' + message, code: 500 }, 500);
  }
});

router.get('/:yearMonth', authMiddleware, async (c) => {
  try {
    const userId = getUserId(c);
    const yearMonth = c.req.param('yearMonth') as string;
    const report = await getReportDetail(userId, yearMonth);

    if (!report) {
      return c.json<ApiErrorResponse>({ error: '报告不存在', code: 404 }, 404);
    }

    return c.json(report);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return c.json<ApiErrorResponse>({ error: '获取报告详情失败：' + message, code: 500 }, 500);
  }
});

router.post('/generate', authMiddleware, async (c) => {
  try {
    const userId = getUserId(c);
    const body = await c.req.json().catch(() => ({}));
    const yearMonth = body.yearMonth as string;

    if (!yearMonth || !/^\d{4}-\d{2}$/.test(yearMonth)) {
      return c.json<ApiErrorResponse>({ error: '请提供有效的年月格式 (YYYY-MM)', code: 400 }, 400);
    }

    // TODO: 付费上线后启用此检查
    // const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    // if (!user[0]?.isPremium) {
    //   return c.json<ApiErrorResponse>({ error: '请升级为付费用户', code: 403 }, 403);
    // }

    const report = await generateMonthlyReport(userId, yearMonth);
    return c.json(report);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return c.json<ApiErrorResponse>({ error: '生成报告失败：' + message, code: 500 }, 500);
  }
});

export default router;
