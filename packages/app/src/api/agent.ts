/**
 * AI Agent API 客户端
 */
import { post, get } from "./client";
import type { AgentScene } from "@yiban/core";

export interface GenerateResponse {
	content?: string;
	cached?: boolean;
	beastName?: string;
	scene: AgentScene;
	requiresAd?: boolean;
	message?: string;
}

export interface AgentContent {
	id: string;
	scene: AgentScene;
	content: string;
	cached: boolean;
	createdAt: string;
}

export interface ContentsResponse {
	contents: AgentContent[];
}

export const agentApi = {
	/**
	 * 生成 AI 建议
	 * @param checkinId - 打卡记录ID
	 * @param scene - 场景类型
	 */
	generate: (checkinId: string, scene: AgentScene) =>
		post<GenerateResponse>(
			"/api/agent/generate",
			{ checkinId, scene },
			true,
			30000,
		),

	/**
	 * 获取指定打卡的所有 AI 内容
	 * @param checkinId - 打卡记录ID
	 */
	getContents: (checkinId: string) =>
		get<ContentsResponse>(`/api/agent/contents/${checkinId}`, true),
};
