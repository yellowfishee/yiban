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

/**
 * PUT /api/user/profile - 更新用户资料
 */
router.put('/profile', authMiddleware, async (c) => {
  try {
    const userId = getUserId(c);
    const body = await c.req.json<{ nickname?: string; avatar?: string }>();

    // 验证参数
    if (!body.nickname && !body.avatar) {
      return c.json<ApiErrorResponse>(
        {
          error: '至少需要提供 nickname 或 avatar',
          code: 400,
        },
        400
      );
    }

    // 构建更新数据
    const updateData: Record<string, any> = {};
    if (body.nickname) {
      if (body.nickname.length < 2 || body.nickname.length > 20) {
        return c.json<ApiErrorResponse>(
          {
            error: '昵称长度需要在 2-20 个字符之间',
            code: 400,
          },
          400
        );
      }
      updateData.nickname = body.nickname;
    }
    if (body.avatar) {
      updateData.avatar = body.avatar;
    }

    // 更新用户
    const updated = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning();

    if (updated.length === 0) {
      return c.json<ApiErrorResponse>(
        {
          error: '用户不存在',
          code: 404,
        },
        404
      );
    }

    const user = updated[0];

    return c.json({
      user: {
        id: user.id,
        nickname: user.nickname,
        avatar: user.avatar,
        isPremium: user.isPremium,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return c.json<ApiErrorResponse>(
      {
        error: '更新失败：' + message,
        code: 500,
      },
      500
    );
  }
});

export default router;
