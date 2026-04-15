/**
 * AI Agent 服务
 * 调用 GLM-4.7 API 生成神兽建议
 */
import { db } from '../db/index';
import { agentContents, dailyFreeUsage } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { buildPrompt, filterCompliance, type AgentScene } from '@yiban/core';
import type { RawHexagram } from '@yiban/core';

const API_URL = 'https://api.edgefn.net/v1/chat/completions';
const MODEL = 'DeepSeek-V3.2';

/**
 * 检查用户是否还有免费次数
 */
async function getFreeQuota(
  userId: string,
  scene: AgentScene,
  date: string  // YYYY-MM-DD
): Promise<boolean> {
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

  return usage.length === 0;
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

// ─── Reasoning content extraction ───────────────────────────────────

/**
 * 后处理：清除推理流程残留的标记
 */
function cleanExtractedText(text: string): string {
  let c = text;

  // Strip 【回答】/【/回答】 and variant markers (model sometimes writes /回答 without brackets)
  c = c.replace(/^【回答】\s*/gm, '');
  c = c.replace(/\s*【\/回答】$/gm, '');
  c = c.replace(/\s*\/回答$/gm, '');
  c = c.replace(/\s*【\/回答】/g, '');

  // Strip reasoning prefixes
  // GLM-4.7 patterns: "草稿2（润色）：", "尝试 1（优化基调）：", "*草稿3：", etc.
  c = c.replace(/^[*\s]*(尝试\s*\d*[（(].*?[)）][：:]?\s*|草稿\d*[（(].*?[)）]?[：:]\s*|起草内容[：:]\s*|润色后?[：:]\s*|最终回答[：:]\s*|最终版本[：:]\s*|回答[：:]\s*|优化[版本]*[：:]\s*|修改后[：:]\s*)/, '');

  // Strip leading markdown markers
  c = c.replace(/^[*\-•>]+\s*/, '');

  // Strip numbered step prefixes
  c = c.replace(/^\d+[.\s]+/, '');

  // Strip trailing meta-commentary
  c = c.replace(/[，。]?字数[：:]约?\d+字.*$/, '');
  c = c.replace(/[，。]?符合.{0,10}要求.*$/, '');
  c = c.replace(/[，。]?检查.{0,10}合规.*$/, '');
  c = c.replace(/[，。]?对照约束.*$/, '');

  // Strip markdown bold
  c = c.replace(/\*\*/g, '');

  return c.trim();
}

/**
 * 从推理模型的 reasoning_content 中提取最终回答
 *
 * GLM-4.7 的推理结构较规律：
 *   1. 分析请求 + 解构人设
 *   2. 构思/头脑风暴
 *   3. 草稿1 → 点评 → 草稿2 → 点评 → 草稿3（最终）
 *   4. 有时在末尾有字数检查等元评论
 *
 * 提取策略（优先级从高到低）：
 *   1. 【回答】标记内容
 *   2. 最后一个「草稿/尝试」段落的正文
 *   3. 评分最高的叙事性段落
 *   4. 从后往前找第一个合格段落
 */
function extractFinalAnswer(reasoning: string): string {
  // Strategy 1: 【回答】...【/回答】 markers
  const markerMatch = reasoning.match(/【回答】([\s\S]+?)【\/回答】/);
  if (markerMatch) {
    return cleanExtractedText(markerMatch[1].trim());
  }

  // Strategy 2: Extract the LAST draft segment
  // GLM-4.7 patterns:
  //   "草稿2（润色）：吾乃..."
  //   "*草稿3：吾乃..."
  //   "尝试 2（优化基调和词汇）：*吾乃..."
  const draftPattern = /(?:草稿|尝试)\s*\d*[（(].*?[)）]?[：:]\s*([\s\S]+?)(?=(?:草稿|尝试)\s*\d*[（(]|字数检查|对照约束|$)/g;
  const drafts: string[] = [];
  let draftMatch;
  while ((draftMatch = draftPattern.exec(reasoning)) !== null) {
    const draftText = draftMatch[1].trim();
    if (draftText.length >= 30) {
      drafts.push(draftText);
    }
  }
  if (drafts.length > 0) {
    // Return the last draft (most refined version)
    return cleanExtractedText(drafts[drafts.length - 1]);
  }

  // Also try simpler pattern: "草稿N：" without parenthetical
  const simpleDraftPattern = /草稿\d+[：:]\s*([\s\S]+?)(?=草稿\d+[：:]|字数检查|对照约束|$)/g;
  const simpleDrafts: string[] = [];
  while ((draftMatch = simpleDraftPattern.exec(reasoning)) !== null) {
    const draftText = draftMatch[1].trim();
    if (draftText.length >= 30) {
      simpleDrafts.push(draftText);
    }
  }
  if (simpleDrafts.length > 0) {
    return cleanExtractedText(simpleDrafts[simpleDrafts.length - 1]);
  }

  // Strategy 3: Score-based segment selection (with strong position bias)
  const segments = reasoning.split(/\n\n+/);

  const candidates = segments
    .map((seg, idx) => {
      const text = seg
        .split('\n')
        .map((l: string) => l.replace(/^[\s*\-•>]+\s*/, '').trim())
        .filter((l: string) => l.length > 5)
        .join('');

      let score = 0;

      // Position: later = more likely final answer
      const pos = idx / segments.length;
      if (pos > 0.7) score += 4;
      else if (pos > 0.4) score += 1;
      else score -= 2;

      // Length sweet spot
      if (text.length >= 60 && text.length <= 300) score += 3;
      else if (text.length >= 30 && text.length <= 500) score += 1;
      else if (text.length > 500) score -= 2;
      else if (text.length < 20) score -= 4;

      // Narrative voice (strong positive)
      if (/^吾|^汝|^此|^今/.test(text)) score += 4;
      if (/[吾汝卦象]/.test(text)) score += 2;

      // Meta-commentary (strong negative)
      if (/字数检查|对照约束|检查合规|符合.*要求/.test(text)) score -= 5;
      if (/^(步骤|分析|构思|首先|其次|然后|综上|总结|以下|根据|点评)/.test(text)) score -= 4;
      if (/草稿\d|起草|润色/.test(text)) score -= 3;
      if (/^\d+\.\s/.test(text)) score -= 2;

      return { text, score };
    })
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score);

  if (candidates.length > 0 && candidates[0].score >= 3) {
    return cleanExtractedText(candidates[0].text);
  }

  // Strategy 4: From the end, find the first qualifying segment
  for (let i = segments.length - 1; i >= 0; i--) {
    const text = segments[i]
      .split('\n')
      .map((l: string) => l.replace(/^[\s*\-•>]+\s*/, '').trim())
      .filter((l: string) => l.length > 5)
      .join('');

    if (text.length >= 30 && text.length <= 500
      && !/^(步骤|分析|构思|对照|审查|验证|字数|首先|其次|点评)/.test(text)
      && !/字数检查|对照约束|检查合规/.test(text)) {
      return cleanExtractedText(text);
    }
  }

  // Strategy 5: Last substantial line
  const allLines = reasoning.split('\n');
  for (let i = allLines.length - 1; i >= 0; i--) {
    const line = allLines[i].replace(/^[\s*\-•>]+\s*/, '').trim();
    if (line.length >= 30
      && !/^\d+\.\s*\*\*/.test(line)
      && !/^(步骤|对照|审查|验证|字数|分析|点评)/.test(line)) {
      return cleanExtractedText(line);
    }
  }

  return cleanExtractedText(reasoning.trim());
}

// ─── API call ────────────────────────────────────────────────────────

/**
 * 调用 GLM API 生成内容
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
      temperature: 0.7,
      max_tokens: 2048,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`GLM API error: ${response.status} - ${error}`);
  }

  const data = await response.json() as {
    choices: Array<{ message: { content: string; reasoning_content?: string } }>;
  };

  const message = data.choices[0]?.message;

  // Standard chat model: content has the answer directly (may contain markers)
  if (message?.content) {
    return cleanExtractedText(message.content);
  }

  // Reasoning model (GLM-4.7/GLM-5): answer is in reasoning_content
  if (message?.reasoning_content) {
    console.log('[Agent] reasoning_content length:', message.reasoning_content.length);
    console.log('[Agent] reasoning_content last 200:', message.reasoning_content.slice(-200));
    const extracted = extractFinalAnswer(message.reasoning_content);
    console.log('[Agent] extracted:', extracted.slice(0, 100));
    return extracted;
  }

  return '';
}

// ─── Main generation flow ────────────────────────────────────────────

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
  const today = new Date().toISOString().split('T')[0];

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
    if (cachedResult.checkinId !== checkinId) {
      await db.insert(agentContents).values({
        checkinId,
        userId,
        hexagramId: hexagram.id,
        mood,
        scene,
        content: cachedResult.content,
        cached: false,
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
    console.warn('[Agent] Compliance violations:', compliance.violations);
  }
  const content = compliance.filtered;

  // 6. 记录免费使用
  if (!isPremium) {
    await recordFreeUsage(userId, scene, today);
  }

  // 7. 存入数据库
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
