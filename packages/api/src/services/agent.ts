/**
 * AI Agent 服务
 * 调用 GLM-5 API 生成神兽建议
 */
import { db } from '../db/index';
import { agentContents, dailyFreeUsage } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { buildPrompt, filterCompliance, type AgentScene } from '@yiban/core';
import type { RawHexagram } from '@yiban/core';

const API_URL = 'https://api.edgefn.net/v1/chat/completions';
const MODEL = 'GLM-5';

/**
 * 检查用户是否还有免费次数
 */
async function getFreeQuota(
  userId: string,
  scene: AgentScene,
  date: string  // YYYY-MM-DD
): Promise<boolean> {
  // 检查今日是否已使用
  const usage = await db
    .select()
    .from(dailyFreeUsage)
    .where(
      and(
        eq(dailyFreeUsage.userId, userId),
        eq(dailyFreeUsage.usedDate, date),
        eq(dailyFreeUsage.scene, scene)
      )
    )
    .limit(1);

  return usage.length === 0;  // 没有记录 = 还有免费次数
}

/**
 * 记录免费使用
 */
async function recordFreeUsage(
  userId: string,
  scene: AgentScene,
  date: string
): Promise<void> {
  await db.insert(dailyFreeUsage).values({
    userId,
    usedDate: date,
    scene,
    usedAt: new Date(),
  });
}

/**
 * 检查缓存
 * 按 hexagramId + mood + scene 组合缓存，24小时有效
 */
async function getCachedContent(
  hexagramId: string,
  mood: string,
  scene: AgentScene
): Promise<{ content: string; checkinId: string } | null> {
  const cached = await db
    .select()
    .from(agentContents)
    .where(
      and(
        eq(agentContents.hexagramId, hexagramId),
        eq(agentContents.mood, mood),
        eq(agentContents.scene, scene),
        eq(agentContents.cached, true)
      )
    )
    .orderBy(agentContents.createdAt)
    .limit(1);

  if (cached.length > 0) {
    const record = cached[0];
    // 检查是否过期（24小时）
    if (record.expiresAt && record.expiresAt > new Date()) {
      return { content: record.content, checkinId: record.checkinId };
    }
  }

  return null;
}

/**
 * 写入缓存
 */
async function setCachedContent(
  checkinId: string,
  userId: string,
  hexagramId: string,
  mood: string,
  scene: AgentScene,
  content: string
): Promise<void> {
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);

  await db.insert(agentContents).values({
    checkinId,
    userId,
    hexagramId,
    mood,
    scene,
    content,
    cached: true,
    expiresAt,
  });
}

/**
 * 调用 GLM-5 API 生成内容
 */
async function callGLMAPI(
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const apiKey = process.env.AI_API_KEY || '';

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`GLM API error: ${response.status} - ${error}`);
  }

  const data = await response.json() as {
    choices: Array<{ message: { content: string } }>;
  };

  return data.choices[0]?.message?.content || '';
}

/**
 * 生成 AI 建议
 */
export async function generateAgentContent(
  checkinId: string,
  userId: string,
  scene: AgentScene,
  hexagram: RawHexagram,
  mood: string,
  meihuaData: { upperGua: string; lowerGua: string; movingLine: number },
  isPremium: boolean = false
): Promise<{
  content?: string;
  cached?: boolean;
  requiresAd?: boolean;
  message?: string;
}> {
  const today = new Date().toISOString().split('T')[0];  // YYYY-MM-DD

  // 1. 非付费用户检查免费次数（优先检查，避免缓存绕过配额）
  if (!isPremium) {
    const hasQuota = await getFreeQuota(userId, scene, today);
    if (!hasQuota) {
      return {
        requiresAd: true,
        message: '请先观看广告解锁此场景',
      };
    }
  }

  // 2. 检查缓存（按 hexagramId + mood + scene）
  const cachedResult = await getCachedContent(hexagram.id, mood, scene);
  if (cachedResult) {
    // 记录使用缓存，但不重复存储（同一缓存只关联原始打卡）
    if (cachedResult.checkinId !== checkinId) {
      // 如果是引用其他打卡记录的缓存，为当前打卡也创建一条记录（标记为非缓存）
      await db.insert(agentContents).values({
        checkinId,
        userId,
        hexagramId: hexagram.id,
        mood,
        scene,
        content: cachedResult.content,
        cached: false, // 标记为引用缓存，非新缓存
      });
    }
    return { content: cachedResult.content, cached: true, requiresAd: false };
  }

  // 3. 构建提示词
  const { system, user } = buildPrompt(hexagram, scene, mood, meihuaData);

  // 4. 调用 GLM API
  const rawContent = await callGLMAPI(system, user);

  // 5. 合规检查
  const compliance = filterCompliance(rawContent);
  if (!compliance.safe) {
    console.warn('Compliance violations:', compliance.violations);
  }
  const content = compliance.filtered;

  // 6. 记录免费使用（如果是非付费用户）
  if (!isPremium) {
    await recordFreeUsage(userId, scene, today);
  }

  // 7. 存入数据库（作为缓存）
  await setCachedContent(checkinId, userId, hexagram.id, mood, scene, content);

  return { content, cached: false, requiresAd: false };
}

/**
 * 获取指定打卡的所有 AI 内容
 */
export async function getAgentContents(checkinId: string) {
  const contents = await db
    .select()
    .from(agentContents)
    .where(eq(agentContents.checkinId, checkinId))
    .orderBy(agentContents.scene);

  return contents;
}
