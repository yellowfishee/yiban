/**
 * 收藏路由
 */

import { Hono } from 'hono';
import { eq, and } from 'drizzle-orm';
import { authMiddleware, getUserId } from '../middleware/auth';
import { db } from '../db/index';
import { collections } from '../db/schema';
import { hexagrams } from '@yiban/core';
import type { ApiErrorResponse } from '../types/auth';
import type { CollectionListResponse, CollectionRecord } from '../types/api';

const router = new Hono();

/**
 * GET /api/collection - 获取收藏列表
 */
router.get('/', authMiddleware, async (c) => {
  try {
    const userId = getUserId(c);

    // 查询收藏记录
    const records = await db
      .select()
      .from(collections)
      .where(eq(collections.userId, userId))
      .orderBy(collections.adoptedAt);

    // 构造响应
    const collectionsList: CollectionRecord[] = records
      .map((record) => {
        const hexagram = hexagrams.find((h) => h.id === record.hexagramId);
        if (!hexagram) return null;

        return {
          id: record.id,
          hexagramId: record.hexagramId,
          hexagram: hexagram as any, // RawHexagram 类型兼容
          adoptedAt: record.adoptedAt.toISOString(),
        };
      })
      .filter((item): item is CollectionRecord => item !== null);

    return c.json<CollectionListResponse>({
      collections: collectionsList,
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
 * DELETE /api/collection/:hexagramId - 移除收藏
 */
router.delete('/:hexagramId', authMiddleware, async (c) => {
  try {
    const userId = getUserId(c);
    const hexagramId = c.req.param('hexagramId');

    if (!hexagramId) {
      return c.json<ApiErrorResponse>(
        { error: '缺少卦象ID', code: 400 },
        400
      );
    }

    await db.delete(collections).where(
      and(
        eq(collections.userId, userId),
        eq(collections.hexagramId, hexagramId)
      )
    );

    return c.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return c.json<ApiErrorResponse>(
      {
        error: '删除失败：' + message,
        code: 500,
      },
      500
    );
  }
});

export default router;
