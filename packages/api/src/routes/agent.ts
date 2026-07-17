/**
 * AI Agent 路由
 */

import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { authMiddleware, getUserId } from "../middleware/auth";
import { generateAgentContent, getAgentContents } from "../services/agent";
import { getCheckinById } from "../services/checkin";
import { db } from "../db/index";
import { users } from "../db/schema";
import type { ApiErrorResponse } from "../types/auth";
import type {
	AgentGenerateResponse,
	AgentContentsResponse,
	AgentScene,
} from "../types/api";

const router = new Hono();

/**
 * POST /api/agent/generate - 生成 AI 建议
 */
router.post("/generate", authMiddleware, async (c) => {
	try {
		const userId = getUserId(c);
		const body = await c.req.json().catch(() => ({}));
		const { checkinId, scene } = body as {
			checkinId: string;
			scene: AgentScene;
		};

		if (!checkinId || !scene) {
			return c.json<ApiErrorResponse>(
				{
					error: "缺少必要参数：checkinId, scene",
					code: 400,
				},
				400,
			);
		}

		// 获取打卡记录
		const checkin = await getCheckinById(checkinId);
		if (!checkin) {
			return c.json<ApiErrorResponse>(
				{
					error: "打卡记录不存在",
					code: 404,
				},
				404,
			);
		}

		// 验证用户权限
		if (checkin.userId !== userId) {
			return c.json<ApiErrorResponse>(
				{
					error: "无权访问该打卡记录",
					code: 403,
				},
				403,
			);
		}

		const user = await db.query.users.findFirst({
			where: eq(users.id, userId),
			columns: { isPremium: true },
		});
		if (!user) {
			return c.json<ApiErrorResponse>(
				{
					error: "用户不存在",
					code: 404,
				},
				404,
			);
		}

		// 直接使用 checkin 中已有的卦象数据（避免重复查找）
		const hexagram = checkin.hexagram;
		if (!hexagram) {
			return c.json<ApiErrorResponse>(
				{
					error: "卦象数据不存在",
					code: 500,
				},
				500,
			);
		}

		// 生成 AI 内容
		const result = await generateAgentContent(
			checkinId,
			userId,
			scene,
			hexagram,
			checkin.mood,
			checkin.meihuaData,
			user.isPremium,
		);

		// 检查是否需要广告
		if (result.requiresAd) {
			return c.json<AgentGenerateResponse>({
				requiresAd: true,
				message: result.message,
				scene,
			});
		}

		return c.json<AgentGenerateResponse>({
			content: result.content,
			cached: result.cached,
			beastName: hexagram.symbol,
			scene,
		});
	} catch (error) {
		const message = error instanceof Error ? error.message : "Unknown error";
		console.error("Agent generate error:", error);

		return c.json<ApiErrorResponse>(
			{
				error: "生成失败：" + message,
				code: 500,
			},
			500,
		);
	}
});

/**
 * GET /api/agent/contents/:checkinId - 获取指定打卡的所有 AI 内容
 */
router.get("/contents/:checkinId", authMiddleware, async (c) => {
	try {
		const userId = getUserId(c);
		const checkinIdParam = c.req.param("checkinId");

		// 验证打卡记录归属
		if (!checkinIdParam) {
			return c.json<ApiErrorResponse>(
				{
					error: "缺少打卡ID",
					code: 400,
				},
				400,
			);
		}

		const checkinId: string = checkinIdParam;
		const checkin = await getCheckinById(checkinId);
		if (!checkin) {
			return c.json<ApiErrorResponse>(
				{
					error: "打卡记录不存在",
					code: 404,
				},
				404,
			);
		}

		if (checkin.userId !== userId) {
			return c.json<ApiErrorResponse>(
				{
					error: "无权访问该打卡记录",
					code: 403,
				},
				403,
			);
		}

		const contents = await getAgentContents(checkinId);

		return c.json<AgentContentsResponse>({
			contents: contents.map((item) => ({
				id: item.id,
				scene: item.scene as AgentScene,
				content: item.content,
				cached: item.cached ?? false,
				createdAt: item.createdAt.toISOString(),
			})),
		});
	} catch (error) {
		const message = error instanceof Error ? error.message : "Unknown error";
		return c.json<ApiErrorResponse>(
			{
				error: "查询失败：" + message,
				code: 500,
			},
			500,
		);
	}
});

export default router;
