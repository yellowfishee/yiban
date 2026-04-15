/**
 * 卦象路由
 */

import { Hono } from 'hono';
import { hexagrams } from '@yiban/core';
import type { ApiErrorResponse } from '../types/auth';
import type { HexagramListResponse, HexagramDetailResponse } from '../types/api';

const router = new Hono();

/**
 * GET /api/hexagrams - 获取所有卦象
 */
router.get('/', async (c) => {
  return c.json<HexagramListResponse>({
    hexagrams,
  });
});

/**
 * GET /api/hexagram/:id - 获取单个卦象详情
 */
router.get('/:id', async (c) => {
  const id = c.req.param('id');
  const hexagram = hexagrams.find((h) => h.id === id);

  if (!hexagram) {
    return c.json<ApiErrorResponse>(
      {
        error: '卦象不存在',
        code: 404,
      },
      404
    );
  }

  return c.json<HexagramDetailResponse>({
    hexagram,
  });
});

export default router;
