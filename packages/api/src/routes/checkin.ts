/**
 * 打卡路由
 */

import { Hono } from 'hono';
import { authMiddleware, getUserId } from '../middleware/auth';
import { getTodayCheckin, createCheckin } from '../services/checkin';
import type { ApiErrorResponse } from '../types/auth';
import type { CheckinResponse, TodayCheckinResponse } from '../types/api';

const router = new Hono();

/**
 * POST /api/checkin - 打卡领养
 */
router.post('/', authMiddleware, async (c) => {
  try {
    const userId = getUserId(c);
    const body = await c.req.json().catch(() => ({}));
    const mood = body.mood as string | undefined;

    const result = await createCheckin(userId, mood);

    return c.json<CheckinResponse>({
      checkin: result.checkin,
      collectionAdded: result.collectionAdded,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    if (message === 'ALREADY_CHECKED_IN') {
      return c.json<ApiErrorResponse>(
        {
          error: '今日已打卡，请明日再来',
          code: 400,
        },
        400
      );
    }

    if (message === 'HEXAGRAM_NOT_FOUND') {
      return c.json<ApiErrorResponse>(
        {
          error: '卦象数据异常，请重试',
          code: 500,
        },
        500
      );
    }

    return c.json<ApiErrorResponse>(
      {
        error: '打卡失败：' + message,
        code: 500,
      },
      500
    );
  }
});

/**
 * GET /api/checkin/today - 获取今日打卡状态
 */
router.get('/today', authMiddleware, async (c) => {
  try {
    const userId = getUserId(c);
    const checkin = await getTodayCheckin(userId);

    return c.json<TodayCheckinResponse>({
      hasCheckedIn: checkin !== null,
      checkin,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return c.json<ApiErrorResponse>(
      {
        error: '查询失败：' + message,
        code: 500,
      },
      500
    );
  }
});

export default router;
