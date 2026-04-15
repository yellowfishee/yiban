/**
 * 用户路由
 */

import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { authMiddleware, getUserId } from '../middleware/auth';
import { db } from '../db/index';
import { users, checkins, collections } from '../db/schema';
import type { ApiErrorResponse } from '../types/auth';
import type { UserProfileResponse } from '../types/api';

const router = new Hono();

/**
 * GET /api/user/profile - 获取用户资料
 */
router.get('/profile', authMiddleware, async (c) => {
  try {
    const userId = getUserId(c);

    // 查询用户信息
    const userRecords = await db.select().from(users).where(eq(users.id, userId)).limit(1);

    if (userRecords.length === 0) {
      return c.json<ApiErrorResponse>(
        {
          error: '用户不存在',
          code: 404,
        },
        404
      );
    }

    const user = userRecords[0];

    // 查询统计数据
    const [checkinCount, collectionCount] = await Promise.all([
      db.select().from(checkins).where(eq(checkins.userId, userId)),
      db.select().from(collections).where(eq(collections.userId, userId)),
    ]);

    return c.json<UserProfileResponse>({
      user: {
        id: user.id,
        nickname: user.nickname,
        avatar: user.avatar,
        isPremium: user.isPremium,
        createdAt: user.createdAt.toISOString(),
      },
      stats: {
        totalCheckins: checkinCount.length,
        totalCollections: collectionCount.length,
      },
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
