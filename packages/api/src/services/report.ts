/**
 * 月度报告服务
 */
import { db } from '../db/index';
import { checkins, agentContents, monthlyReports, users } from '../db/schema';
import { eq, and, gte, lte, sql, desc } from 'drizzle-orm';
import { hexagrams } from '@yiban/core';
import { generateAgentContent } from './agent';

function findHexagramById(id: string) {
  return hexagrams.find((h) => h.id === id);
}

function getMonthRange(yearMonth: string): { start: Date; end: Date } {
  const [year, month] = yearMonth.split('-').map(Number);
  const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
  const end = new Date(Date.UTC(year, month, 1, 0, 0, 0));
  return { start, end };
}

export async function getUserStats(userId: string): Promise<{
  totalCheckins: number;
  monthCheckins: number;
  maxConsecutive: number;
  currentConsecutive: number;
}> {
  const allCheckins = await db
    .select({ createdAt: checkins.createdAt })
    .from(checkins)
    .where(eq(checkins.userId, userId))
    .orderBy(checkins.createdAt);

  const totalCheckins = allCheckins.length;

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const monthStart = new Date(Date.UTC(year, month, 1, 0, 0, 0));
  const monthEnd = new Date(Date.UTC(year, month + 1, 1, 0, 0, 0));

  const monthCheckins = allCheckins.filter((c) => {
    const t = c.createdAt.getTime();
    return t >= monthStart.getTime() && t < monthEnd.getTime();
  }).length;

  const dates = allCheckins.map((c) => {
    const d = new Date(c.createdAt.getTime() + 8 * 60 * 60 * 1000);
    return d.toISOString().split('T')[0];
  });

  const uniqueDates = [...new Set(dates)].sort();

  let maxConsecutive = 0;
  let currentConsecutive = 0;

  if (uniqueDates.length > 0) {
    let streak = 1;
    for (let i = 1; i < uniqueDates.length; i++) {
      const prev = new Date(uniqueDates[i - 1]);
      const curr = new Date(uniqueDates[i]);
      const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        streak++;
      } else {
        maxConsecutive = Math.max(maxConsecutive, streak);
        streak = 1;
      }
    }
    maxConsecutive = Math.max(maxConsecutive, streak);

    const today = new Date();
    const todayUTC8 = new Date(today.getTime() + 8 * 60 * 60 * 1000);
    const todayStr = todayUTC8.toISOString().split('T')[0];
    const yesterdayUTC8 = new Date(todayUTC8.getTime() - 24 * 60 * 60 * 1000);
    const yesterdayStr = yesterdayUTC8.toISOString().split('T')[0];

    if (uniqueDates.includes(todayStr) || uniqueDates.includes(yesterdayStr)) {
      let consecutiveStreak = 0;
      const lastDate = uniqueDates.includes(todayStr) ? todayStr : yesterdayStr;
      const lastDateObj = new Date(lastDate);

      for (let i = uniqueDates.length - 1; i >= 0; i--) {
        const expectedDate = new Date(lastDateObj.getTime() - consecutiveStreak * 24 * 60 * 60 * 1000);
        const expectedStr = expectedDate.toISOString().split('T')[0];

        if (uniqueDates[i] === expectedStr) {
          consecutiveStreak++;
        } else {
          break;
        }
      }
      currentConsecutive = consecutiveStreak;
    }
  }

  return {
    totalCheckins,
    monthCheckins,
    maxConsecutive,
    currentConsecutive,
  };
}

export async function getMonthSummary(
  userId: string,
  yearMonth: string
): Promise<{
  checkinDays: number;
  consecutiveDays: number;
  checkinRate: number;
  hexagramDistribution: Record<string, number>;
  topScenes: string[];
}> {
  const { start, end } = getMonthRange(yearMonth);

  const monthCheckins = await db
    .select()
    .from(checkins)
    .where(
      and(
        eq(checkins.userId, userId),
        gte(checkins.createdAt, start),
        lte(checkins.createdAt, end)
      )
    );

  const checkinDays = monthCheckins.length;

  const dates = monthCheckins.map((c) => {
    const d = new Date(c.createdAt.getTime() + 8 * 60 * 60 * 1000);
    return d.toISOString().split('T')[0];
  });
  const uniqueDates = [...new Set(dates)].sort();

  let consecutiveDays = 0;
  if (uniqueDates.length > 0) {
    let streak = 1;
    for (let i = 1; i < uniqueDates.length; i++) {
      const prev = new Date(uniqueDates[i - 1]);
      const curr = new Date(uniqueDates[i]);
      const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        streak++;
      } else {
        break;
      }
    }
    consecutiveDays = streak;
  }

  const [year, month] = yearMonth.split('-').map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();
  const checkinRate = Math.round((uniqueDates.length / daysInMonth) * 100);

  const hexagramDistribution: Record<string, number> = {};
  for (const checkin of monthCheckins) {
    hexagramDistribution[checkin.hexagramId] = (hexagramDistribution[checkin.hexagramId] || 0) + 1;
  }

  const checkinIds = monthCheckins.map((c) => c.id);
  let topScenes: string[] = [];

  if (checkinIds.length > 0) {
    const scenes = await db
      .select({ scene: agentContents.scene })
      .from(agentContents)
      .where(sql`${agentContents.checkinId} IN ${checkinIds}`);

    const sceneCounts: Record<string, number> = {};
    for (const s of scenes) {
      sceneCounts[s.scene] = (sceneCounts[s.scene] || 0) + 1;
    }
    topScenes = Object.entries(sceneCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([scene]) => scene);
  }

  return {
    checkinDays,
    consecutiveDays,
    checkinRate,
    hexagramDistribution,
    topScenes,
  };
}

export async function generateMonthlyReport(
  userId: string,
  yearMonth: string
): Promise<{
  id: string;
  yearMonth: string;
  summaryData: {
    checkinDays: number;
    consecutiveDays: number;
    checkinRate: number;
    hexagramDistribution: Record<string, number>;
    topScenes: string[];
  };
  storyContent: string;
}> {
  const existing = await db
    .select()
    .from(monthlyReports)
    .where(
      and(
        eq(monthlyReports.userId, userId),
        eq(monthlyReports.yearMonth, yearMonth)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    return {
      id: existing[0].id,
      yearMonth: existing[0].yearMonth,
      summaryData: existing[0].summaryData,
      storyContent: existing[0].storyContent || '',
    };
  }

  const summaryData = await getMonthSummary(userId, yearMonth);

  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  const nickname = user[0]?.nickname || '道友';

  const hexagramNames = Object.entries(summaryData.hexagramDistribution)
    .map(([id, count]) => {
      const hex = findHexagramById(id);
      return hex ? `${hex.name}(${count}次)` : id;
    })
    .slice(0, 5)
    .join('、');

  const sceneNameMap: Record<string, string> = {
    suitable_for: '宜忌',
    advice: '建议',
    companionship: '陪伴',
  };
  const topSceneNames = summaryData.topScenes
    .map((s) => sceneNameMap[s] || s)
    .join('、');

  const customPrompt = `你是用户的专属神兽伙伴，用温暖、古风、鼓励的语气，为用户撰写本月的相伴故事。

用户本月数据：
- 打卡天数：${summaryData.checkinDays}天
- 连续打卡：${summaryData.consecutiveDays}天
- 遇到的卦象：${hexagramNames || '无'}
- 常问的话题：${topSceneNames || '无'}

用户昵称：${nickname}

请写一段150-200字的月度相伴故事，包含以下元素：
1. 回顾用户本月的成长历程
2. 提及用户遇到的卦象（如有）
3. 给予鼓励和祝福
4. 使用古风语言，以"吾"自称，"汝"称呼用户`;

  const systemPrompt = '你是一位温暖的神兽伙伴，擅长用古风语言讲述故事，给人鼓励和力量。';

  const result = await generateAgentContent(
    `report-${yearMonth}`,
    userId,
    'companionship',
    { id: 'monthly-report', name: '月度报告', upper: '坤', lower: '乾', text: '' } as any,
    'report',
    { upperGua: '坤', lowerGua: '乾', movingLine: 1 },
    true,
    { customPrompt, systemPrompt }
  );

  const storyContent = result.content || '';

  const [report] = await db
    .insert(monthlyReports)
    .values({
      userId,
      yearMonth,
      summaryData,
      storyContent,
    })
    .returning();

  return {
    id: report.id,
    yearMonth: report.yearMonth,
    summaryData: report.summaryData,
    storyContent: report.storyContent || '',
  };
}

export async function getReportList(userId: string): Promise<
  Array<{
    id: string;
    yearMonth: string;
    checkinDays: number;
    createdAt: Date;
  }>
> {
  const reports = await db
    .select({
      id: monthlyReports.id,
      yearMonth: monthlyReports.yearMonth,
      summaryData: monthlyReports.summaryData,
      createdAt: monthlyReports.createdAt,
    })
    .from(monthlyReports)
    .where(eq(monthlyReports.userId, userId))
    .orderBy(desc(monthlyReports.yearMonth));

  return reports.map((r) => ({
    id: r.id,
    yearMonth: r.yearMonth,
    checkinDays: r.summaryData.checkinDays,
    createdAt: r.createdAt,
  }));
}

export async function getReportDetail(
  userId: string,
  yearMonth: string
): Promise<{
  id: string;
  yearMonth: string;
  summaryData: {
    checkinDays: number;
    consecutiveDays: number;
    checkinRate: number;
    hexagramDistribution: Record<string, number>;
    topScenes: string[];
  };
  storyContent: string;
  createdAt: Date;
} | null> {
  const reports = await db
    .select()
    .from(monthlyReports)
    .where(
      and(
        eq(monthlyReports.userId, userId),
        eq(monthlyReports.yearMonth, yearMonth)
      )
    )
    .limit(1);

  if (reports.length === 0) {
    return null;
  }

  const report = reports[0];
  return {
    id: report.id,
    yearMonth: report.yearMonth,
    summaryData: report.summaryData,
    storyContent: report.storyContent || '',
    createdAt: report.createdAt,
  };
}
