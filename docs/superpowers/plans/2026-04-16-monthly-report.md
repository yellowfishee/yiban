# 月度报告 + 打卡统计实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现月度报告功能和打卡统计展示，所有用户暂时可用，预留付费检查接口。

**Architecture:** 后端新增 report 路由和服务，前端新增报告页面，设置页添加统计展示和报告入口。

**Tech Stack:** Taro 3.6 + Hono + Drizzle + GLM-5 API

---

## 文件结构

| 文件 | 操作 | 职责 |
|------|------|------|
| `packages/api/src/db/schema.ts` | 修改 | 添加 monthly_reports 表 |
| `packages/api/src/routes/report.ts` | 新增 | 报告 API 路由 |
| `packages/api/src/services/report.ts` | 新增 | 报告生成服务 |
| `packages/api/src/index.ts` | 修改 | 注册路由 |
| `packages/app/src/api/report.ts` | 新增 | 前端 API 客户端 |
| `packages/app/src/pages/report/index.tsx` | 新增 | 报告列表页 |
| `packages/app/src/pages/report/detail.tsx` | 新增 | 报告详情页 |
| `packages/app/src/pages/report/index.scss` | 新增 | 报告页样式 |
| `packages/app/src/pages/settings/index.tsx` | 修改 | 添加统计 + 报告入口 |
| `packages/app/src/pages/settings/index.scss` | 修改 | 统计区样式 |
| `packages/app/src/app.config.ts` | 修改 | 添加报告页路由 |

---

### Task 1: 数据库添加 monthly_reports 表

**Files:**
- Modify: `packages/api/src/db/schema.ts`

- [ ] **Step 1: 添加 monthly_reports 表定义**

在 `packages/api/src/db/schema.ts` 末尾添加：

```typescript
// 月度报告
export const monthlyReports = sqliteTable('monthly_reports', {
  id: text('id').primaryKey().$defaultFn(() => uuidv4()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  yearMonth: text('year_month').notNull(),  // "2026-04" 格式
  summaryData: text('summary_data', { mode: 'json' }).notNull().$type<{
    checkinDays: number;
    consecutiveDays: number;
    checkinRate: number;
    hexagramDistribution: Record<string, number>;
    topScenes: string[];
  }>(),
  storyContent: text('story_content'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});
```

- [ ] **Step 2: 生成数据库迁移**

Run: `pnpm --filter @yiban/api db:generate`
Expected: 生成新的迁移文件

- [ ] **Step 3: 推送 schema 到数据库**

Run: `pnpm --filter @yiban/api db:push`
Expected: 表创建成功

- [ ] **Step 4: 验证类型检查**

Run: `pnpm --filter @yiban/api typecheck`
Expected: 无错误

---

### Task 2: 创建报告服务

**Files:**
- Create: `packages/api/src/services/report.ts`

- [ ] **Step 1: 创建报告服务文件**

创建 `packages/api/src/services/report.ts`：

```typescript
import { db } from '../db/index';
import { checkins, agentContents, monthlyReports, users } from '../db/schema';
import { eq, and, gte, lte, sql, desc } from 'drizzle-orm';
import { generateAgentContent } from './agent';

interface SummaryData {
  checkinDays: number;
  consecutiveDays: number;
  checkinRate: number;
  hexagramDistribution: Record<string, number>;
  topScenes: string[];
}

/**
 * 获取用户打卡统计
 */
export async function getUserStats(userId: string): Promise<{
  totalCheckins: number;
  monthCheckins: number;
  maxConsecutive: number;
  currentConsecutive: number;
}> {
  // 累计打卡天数
  const allCheckins = await db
    .select()
    .from(checkins)
    .where(eq(checkins.userId, userId));

  const totalCheckins = allCheckins.length;

  // 本月打卡天数
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthCheckins = allCheckins.filter(
    (c) => c.createdAt >= monthStart
  ).length;

  // 计算连续打卡
  const sortedDates = allCheckins
    .map((c) => c.createdAt.toISOString().split('T')[0])
    .sort()
    .reverse();

  let currentConsecutive = 0;
  let maxConsecutive = 0;
  let tempConsecutive = 0;

  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  // 当前连续打卡
  if (sortedDates.includes(today) || sortedDates.includes(yesterday)) {
    for (let i = 0; i < sortedDates.length; i++) {
      const expectedDate = new Date(Date.now() - i * 86400000).toISOString().split('T')[0];
      if (sortedDates.includes(expectedDate)) {
        currentConsecutive++;
      } else {
        break;
      }
    }
  }

  // 最长连续打卡
  for (let i = 0; i < sortedDates.length; i++) {
    if (i === 0 || 
        new Date(sortedDates[i - 1]).getTime() - new Date(sortedDates[i]).getTime() === 86400000) {
      tempConsecutive++;
      maxConsecutive = Math.max(maxConsecutive, tempConsecutive);
    } else {
      tempConsecutive = 1;
    }
  }

  return {
    totalCheckins,
    monthCheckins,
    maxConsecutive: Math.max(maxConsecutive, 1),
    currentConsecutive,
  };
}

/**
 * 获取月度统计数据
 */
export async function getMonthSummary(userId: string, yearMonth: string): Promise<SummaryData> {
  const [year, month] = yearMonth.split('-').map(Number);
  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = new Date(year, month, 0);

  // 本月打卡记录
  const monthCheckins = await db
    .select()
    .from(checkins)
    .where(
      and(
        eq(checkins.userId, userId),
        gte(checkins.createdAt, monthStart),
        lte(checkins.createdAt, monthEnd)
      )
    );

  const checkinDays = monthCheckins.length;
  const daysInMonth = monthEnd.getDate();
  const checkinRate = checkinDays / daysInMonth;

  // 卦象分布
  const hexagramDistribution: Record<string, number> = {};
  for (const checkin of monthCheckins) {
    const id = checkin.hexagramId;
    hexagramDistribution[id] = (hexagramDistribution[id] || 0) + 1;
  }

  // 场景偏好
  const scenes = await db
    .select({ scene: agentContents.scene, count: sql<number>`count(*)` })
    .from(agentContents)
    .where(
      and(
        eq(agentContents.userId, userId),
        gte(agentContents.createdAt, monthStart),
        lte(agentContents.createdAt, monthEnd)
      )
    )
    .groupBy(agentContents.scene)
    .orderBy(desc(sql`count(*)`));

  const topScenes = scenes.slice(0, 3).map((s) => s.scene);

  // 计算连续打卡
  const sortedDates = monthCheckins
    .map((c) => c.createdAt.toISOString().split('T')[0])
    .sort();

  let consecutiveDays = 0;
  let tempConsecutive = 0;
  for (let i = 0; i < sortedDates.length; i++) {
    if (i === 0 || 
        new Date(sortedDates[i]).getTime() - new Date(sortedDates[i - 1]).getTime() === 86400000) {
      tempConsecutive++;
      consecutiveDays = Math.max(consecutiveDays, tempConsecutive);
    } else {
      tempConsecutive = 1;
    }
  }

  return {
    checkinDays,
    consecutiveDays: Math.max(consecutiveDays, 1),
    checkinRate,
    hexagramDistribution,
    topScenes,
  };
}

/**
 * 生成月度报告
 */
export async function generateMonthlyReport(userId: string, yearMonth: string): Promise<{
  id: string;
  yearMonth: string;
  summaryData: SummaryData;
  storyContent: string;
}> {
  // 检查是否已存在
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
      summaryData: existing[0].summaryData as SummaryData,
      storyContent: existing[0].storyContent || '',
    };
  }

  // 获取统计数据
  const summaryData = await getMonthSummary(userId, yearMonth);

  // 获取用户昵称
  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  const nickname = user[0]?.nickname || '易友';

  // 获取本月卦象名称列表
  const hexagramNames = Object.keys(summaryData.hexagramDistribution)
    .slice(0, 5)
    .map((id) => {
      const parts = id.split('_');
      return parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
    })
    .join('、');

  // 场景名称映射
  const sceneNames: Record<string, string> = {
    suitable_for: '今日适合',
    advice: '处事建议',
    companionship: '情绪陪同',
    career: '工作发展',
    emotion: '情感沟通',
    fortune: '财运参考',
  };

  const topSceneNames = summaryData.topScenes
    .map((s) => sceneNames[s] || s)
    .join('、');

  // AI 生成故事
  const prompt = `你是用户的专属神兽伙伴，用温暖、古风、鼓励的语气，为用户撰写本月的相伴故事。

用户本月数据：
- 打卡天数：${summaryData.checkinDays}天
- 连续打卡：${summaryData.consecutiveDays}天
- 遇到的卦象：${hexagramNames || '无'}
- 常问的话题：${topSceneNames || '无'}

用户昵称：${nickname}

请写一段150-200字的月度相伴故事，内容包括：
1. 对用户本月坚持的肯定
2. 神兽陪伴的感受
3. 对下月的祝福

用第二人称"你"称呼用户，语气亲切温暖。`;

  let storyContent = '';

  try {
    const response = await generateAgentContent({
      userId,
      hexagramId: 'monthly_report',
      mood: 'default',
      scene: 'monthly_story',
      customPrompt: prompt,
    });
    storyContent = response.content;
  } catch (error) {
    console.error('[Report] Story generation failed:', error);
    storyContent = `亲爱的${nickname}，这个月我们相伴了${summaryData.checkinDays}天。每一次相遇，都是一次心灵的对话。感谢你的信任与陪伴，愿下月我们继续同行。`;
  }

  // 保存报告
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
    summaryData: report.summaryData as SummaryData,
    storyContent: report.storyContent || '',
  };
}

/**
 * 获取用户报告列表
 */
export async function getReportList(userId: string): Promise<Array<{
  id: string;
  yearMonth: string;
  checkinDays: number;
  createdAt: Date;
}>> {
  const reports = await db
    .select()
    .from(monthlyReports)
    .where(eq(monthlyReports.userId, userId))
    .orderBy(desc(monthlyReports.yearMonth));

  return reports.map((r) => ({
    id: r.id,
    yearMonth: r.yearMonth,
    checkinDays: (r.summaryData as SummaryData).checkinDays,
    createdAt: r.createdAt,
  }));
}

/**
 * 获取报告详情
 */
export async function getReportDetail(userId: string, yearMonth: string) {
  const report = await db
    .select()
    .from(monthlyReports)
    .where(
      and(
        eq(monthlyReports.userId, userId),
        eq(monthlyReports.yearMonth, yearMonth)
      )
    )
    .limit(1);

  if (report.length === 0) {
    return null;
  }

  return {
    id: report[0].id,
    yearMonth: report[0].yearMonth,
    summaryData: report[0].summaryData as SummaryData,
    storyContent: report[0].storyContent,
    createdAt: report[0].createdAt,
  };
}
```

- [ ] **Step 2: 更新 agent 服务支持自定义 prompt**

修改 `packages/api/src/services/agent.ts`，在 `generateAgentContent` 函数参数中添加可选的 `customPrompt` 参数：

```typescript
interface GenerateParams {
  userId: string;
  hexagramId: string;
  mood: string;
  scene: string;
  customPrompt?: string;  // 新增
}

export async function generateAgentContent(params: GenerateParams): Promise<{ content: string }> {
  const { userId, hexagramId, mood, scene, customPrompt } = params;
  
  // 如果有自定义 prompt，直接使用
  if (customPrompt) {
    const response = await fetch(GLM_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GLM_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'glm-4-flash',
        messages: [
          { role: 'user', content: customPrompt }
        ],
      }),
    });
    
    const data = await response.json();
    return { content: data.choices[0].message.content };
  }
  
  // 原有逻辑...
}
```

- [ ] **Step 3: 验证类型检查**

Run: `pnpm --filter @yiban/api typecheck`
Expected: 无错误

---

### Task 3: 创建报告 API 路由

**Files:**
- Create: `packages/api/src/routes/report.ts`
- Modify: `packages/api/src/index.ts`

- [ ] **Step 1: 创建报告路由文件**

创建 `packages/api/src/routes/report.ts`：

```typescript
import { Hono } from 'hono';
import { authMiddleware, getUserId } from '../middleware/auth';
import { getUserStats, generateMonthlyReport, getReportList, getReportDetail } from '../services/report';
import type { ApiErrorResponse } from '../types/auth';

const router = new Hono();

/**
 * GET /api/report/stats - 获取打卡统计
 */
router.get('/stats', authMiddleware, async (c) => {
  try {
    const userId = getUserId(c);
    const stats = await getUserStats(userId);
    return c.json({ stats });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return c.json<ApiErrorResponse>({ error: '获取统计失败：' + message, code: 500 }, 500);
  }
});

/**
 * GET /api/report/list - 获取报告列表
 */
router.get('/list', authMiddleware, async (c) => {
  try {
    const userId = getUserId(c);
    const reports = await getReportList(userId);
    return c.json({ reports });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return c.json<ApiErrorResponse>({ error: '获取列表失败：' + message, code: 500 }, 500);
  }
});

/**
 * GET /api/report/:yearMonth - 获取报告详情
 */
router.get('/:yearMonth', authMiddleware, async (c) => {
  try {
    const userId = getUserId(c);
    const yearMonth = c.req.param('yearMonth');
    const report = await getReportDetail(userId, yearMonth);
    
    if (!report) {
      return c.json<ApiErrorResponse>({ error: '报告不存在', code: 404 }, 404);
    }
    
    return c.json({ report });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return c.json<ApiErrorResponse>({ error: '获取报告失败：' + message, code: 500 }, 500);
  }
});

/**
 * POST /api/report/generate - 生成月度报告
 */
router.post('/generate', authMiddleware, async (c) => {
  try {
    const userId = getUserId(c);
    
    // TODO: 付费上线后启用此检查
    // const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    // if (!user[0]?.isPremium) {
    //   return c.json<ApiErrorResponse>({ error: '请升级为付费用户', code: 403 }, 403);
    // }
    
    const now = new Date();
    const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    const report = await generateMonthlyReport(userId, yearMonth);
    return c.json({ report });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return c.json<ApiErrorResponse>({ error: '生成报告失败：' + message, code: 500 }, 500);
  }
});

export default router;
```

- [ ] **Step 2: 注册路由到 index.ts**

在 `packages/api/src/index.ts` 中添加：

```typescript
import reportRoutes from './routes/report';
// ...
app.route('/api/report', reportRoutes);
```

- [ ] **Step 3: 验证类型检查**

Run: `pnpm --filter @yiban/api typecheck`
Expected: 无错误

---

### Task 4: 创建前端 API 客户端

**Files:**
- Create: `packages/app/src/api/report.ts`

- [ ] **Step 1: 创建报告 API 客户端**

创建 `packages/app/src/api/report.ts`：

```typescript
import { get, post } from './client';

export interface UserStats {
  totalCheckins: number;
  monthCheckins: number;
  maxConsecutive: number;
  currentConsecutive: number;
}

export interface ReportListItem {
  id: string;
  yearMonth: string;
  checkinDays: number;
  createdAt: string;
}

export interface ReportDetail {
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
  createdAt: string;
}

export const reportApi = {
  getStats: () => get<{ stats: UserStats }>('/api/report/stats', true),
  
  getList: () => get<{ reports: ReportListItem[] }>('/api/report/list', true),
  
  getDetail: (yearMonth: string) => 
    get<{ report: ReportDetail }>(`/api/report/${yearMonth}`, true),
  
  generate: () => post<{ report: ReportDetail }>('/api/report/generate', {}, true),
};
```

- [ ] **Step 2: 验证类型检查**

Run: `pnpm --filter @yiban/app typecheck`
Expected: 无错误

---

### Task 5: 创建报告列表页面

**Files:**
- Create: `packages/app/src/pages/report/index.tsx`
- Create: `packages/app/src/pages/report/index.scss`
- Modify: `packages/app/src/app.config.ts`

- [ ] **Step 1: 创建报告列表页面**

创建 `packages/app/src/pages/report/index.tsx`：

```typescript
import { View, Text, Button } from '@tarojs/components';
import { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { reportApi, type ReportListItem } from '../../api/report';
import Skeleton from '../../components/skeleton/Skeleton';
import { haptic } from '../../utils/haptic';
import './index.scss';

export default function ReportPage() {
  const [reports, setReports] = useState<ReportListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const response = await reportApi.getList();
      setReports(response.reports);
    } catch (error) {
      Taro.showToast({ title: '加载失败', icon: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    haptic.light();
    try {
      setGenerating(true);
      const response = await reportApi.generate();
      Taro.navigateTo({ url: `/pages/report/detail?yearMonth=${response.report.yearMonth}` });
    } catch (error) {
      Taro.showToast({ title: '生成失败', icon: 'error' });
    } finally {
      setGenerating(false);
    }
  };

  const handleViewReport = (yearMonth: string) => {
    haptic.light();
    Taro.navigateTo({ url: `/pages/report/detail?yearMonth=${yearMonth}` });
  };

  const formatMonth = (yearMonth: string) => {
    const [year, month] = yearMonth.split('-');
    return `${year}年${parseInt(month)}月`;
  };

  return (
    <View className="report-page">
      <View className="report-page__header">
        <Text className="report-page__title">我的报告</Text>
      </View>

      <View className="report-page__generate">
        <Button
          className="report-page__generate-btn"
          onClick={handleGenerate}
          disabled={generating}
        >
          {generating ? '生成中...' : '生成本月报告'}
        </Button>
      </View>

      <View className="report-page__list">
        <Text className="report-page__list-title">历史报告</Text>
        
        {loading ? (
          <View className="report-page__skeleton">
            <Skeleton width="100%" height="120px" />
            <Skeleton width="100%" height="120px" />
          </View>
        ) : reports.length === 0 ? (
          <View className="report-page__empty">
            <Text className="report-page__empty-text">暂无历史报告</Text>
            <Text className="report-page__empty-hint">点击上方按钮生成本月报告</Text>
          </View>
        ) : (
          reports.map((report) => (
            <View
              key={report.id}
              className="report-page__item"
              onClick={() => handleViewReport(report.yearMonth)}
            >
              <View className="report-page__item-left">
                <Text className="report-page__item-month">{formatMonth(report.yearMonth)}</Text>
                <Text className="report-page__item-days">打卡 {report.checkinDays} 天</Text>
              </View>
              <Text className="report-page__item-arrow">›</Text>
            </View>
          ))
        )}
      </View>
    </View>
  );
}
```

- [ ] **Step 2: 创建报告页面样式**

创建 `packages/app/src/pages/report/index.scss`：

```scss
@import '../../styles/tokens.scss';

.report-page {
  min-height: 100vh;
  padding: var(--spacing-xl);
  background: var(--color-bg);
}

.report-page__header {
  text-align: center;
  margin-bottom: var(--spacing-xl);
}

.report-page__title {
  font-family: var(--font-serif);
  font-size: 48px;
  font-weight: bold;
  color: var(--color-text);
}

.report-page__generate {
  margin-bottom: var(--spacing-xl);
}

.report-page__generate-btn {
  width: 100%;
  height: 96px;
  background: var(--color-primary);
  color: #fff;
  font-size: 32px;
  font-weight: bold;
  border-radius: 48px;
  border: none;

  &[disabled] {
    opacity: 0.5;
  }
}

.report-page__list {
  background: var(--color-bg-card);
  border-radius: var(--radius-xl);
  padding: var(--spacing-lg);
}

.report-page__list-title {
  display: block;
  font-size: 28px;
  font-weight: bold;
  color: var(--color-text);
  margin-bottom: var(--spacing-md);
}

.report-page__skeleton {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.report-page__empty {
  text-align: center;
  padding: var(--spacing-xl) 0;
}

.report-page__empty-text {
  display: block;
  font-size: 28px;
  color: var(--color-text-hint);
  margin-bottom: var(--spacing-xs);
}

.report-page__empty-hint {
  font-size: 24px;
  color: var(--color-text-tertiary);
}

.report-page__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md) 0;
  border-bottom: 1px solid var(--color-border);

  &:last-child {
    border-bottom: none;
  }

  &:active {
    opacity: 0.7;
  }
}

.report-page__item-left {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.report-page__item-month {
  font-size: 32px;
  font-weight: bold;
  color: var(--color-text);
}

.report-page__item-days {
  font-size: 24px;
  color: var(--color-text-secondary);
}

.report-page__item-arrow {
  font-size: 32px;
  color: var(--color-text-hint);
}
```

- [ ] **Step 3: 添加路由配置**

在 `packages/app/src/app.config.ts` 的 pages 数组中添加：

```typescript
'pages/report/index',
```

- [ ] **Step 4: 验证类型检查**

Run: `pnpm --filter @yiban/app typecheck`
Expected: 无错误

---

### Task 6: 创建报告详情页面

**Files:**
- Create: `packages/app/src/pages/report/detail.tsx`

- [ ] **Step 1: 创建报告详情页面**

创建 `packages/app/src/pages/report/detail.tsx`：

```typescript
import { View, Text, Image } from '@tarojs/components';
import { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { reportApi, type ReportDetail } from '../../api/report';
import Skeleton from '../../components/skeleton/Skeleton';
import './index.scss';

export default function ReportDetailPage() {
  const [report, setReport] = useState<ReportDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = Taro.getCurrentInstance().router?.params;
    if (params?.yearMonth) {
      loadReport(params.yearMonth);
    }
  }, []);

  const loadReport = async (yearMonth: string) => {
    try {
      setLoading(true);
      const response = await reportApi.getDetail(yearMonth);
      setReport(response.report);
    } catch (error) {
      Taro.showToast({ title: '加载失败', icon: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const formatMonth = (yearMonth: string) => {
    const [year, month] = yearMonth.split('-');
    return `${year}年${parseInt(month)}月`;
  };

  const formatRate = (rate: number) => {
    return Math.round(rate * 100) + '%';
  };

  const getHexagramName = (id: string): string => {
    const names: Record<string, string> = {
      qian_kun: '乾坤', kun_qian: '地天', 
      qian: '乾', kun: '坤', tai: '泰', qian_2: '谦',
      zhun: '屯', xu: '需', shi: '师', bi: '比',
      dayou: '大有', gu: '蛊', lin: '临', guan: '观',
    };
    return names[id] || id;
  };

  const getSceneName = (scene: string): string => {
    const names: Record<string, string> = {
      suitable_for: '今日适合',
      advice: '处事建议',
      companionship: '情绪陪同',
      career: '工作发展',
      emotion: '情感沟通',
      fortune: '财运参考',
    };
    return names[scene] || scene;
  };

  if (loading) {
    return (
      <View className="report-detail">
        <View className="report-detail__header">
          <Skeleton width="200px" height="48px" />
        </View>
        <View className="report-detail__stats">
          <Skeleton width="100%" height="120px" />
        </View>
        <View className="report-detail__story">
          <Skeleton width="100%" height="200px" />
        </View>
      </View>
    );
  }

  if (!report) {
    return (
      <View className="report-detail">
        <Text>报告不存在</Text>
      </View>
    );
  }

  const { summaryData, storyContent } = report;

  return (
    <View className="report-detail">
      <View className="report-detail__header">
        <Text className="report-detail__title">{formatMonth(report.yearMonth)}报告</Text>
      </View>

      <View className="report-detail__stats">
        <View className="report-detail__stat">
          <Text className="report-detail__stat-value">{summaryData.checkinDays}</Text>
          <Text className="report-detail__stat-label">打卡天数</Text>
        </View>
        <View className="report-detail__stat">
          <Text className="report-detail__stat-value">{summaryData.consecutiveDays}</Text>
          <Text className="report-detail__stat-label">连续打卡</Text>
        </View>
        <View className="report-detail__stat">
          <Text className="report-detail__stat-value">{formatRate(summaryData.checkinRate)}</Text>
          <Text className="report-detail__stat-label">打卡率</Text>
        </View>
      </View>

      {Object.keys(summaryData.hexagramDistribution).length > 0 && (
        <View className="report-detail__section">
          <Text className="report-detail__section-title">卦象相遇</Text>
          <View className="report-detail__hexagrams">
            {Object.entries(summaryData.hexagramDistribution)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5)
              .map(([id, count]) => (
                <View key={id} className="report-detail__hexagram">
                  <Text className="report-detail__hexagram-name">{getHexagramName(id)}</Text>
                  <Text className="report-detail__hexagram-count">{count}次</Text>
                </View>
              ))}
          </View>
        </View>
      )}

      {summaryData.topScenes.length > 0 && (
        <View className="report-detail__section">
          <Text className="report-detail__section-title">常问话题</Text>
          <View className="report-detail__scenes">
            {summaryData.topScenes.map((scene) => (
              <View key={scene} className="report-detail__scene-tag">
                <Text className="report-detail__scene-text">{getSceneName(scene)}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View className="report-detail__story">
        <Text className="report-detail__story-title">神兽相伴</Text>
        <Text className="report-detail__story-content">{storyContent}</Text>
      </View>
    </View>
  );
}
```

- [ ] **Step 2: 更新样式文件**

在 `packages/app/src/pages/report/index.scss` 中添加详情页样式：

```scss
// 报告详情页
.report-detail {
  min-height: 100vh;
  padding: var(--spacing-xl);
  background: var(--color-bg);
}

.report-detail__header {
  text-align: center;
  margin-bottom: var(--spacing-xl);
}

.report-detail__title {
  font-family: var(--font-serif);
  font-size: 48px;
  font-weight: bold;
  color: var(--color-text);
}

.report-detail__stats {
  display: flex;
  justify-content: space-around;
  background: var(--color-bg-card);
  border-radius: var(--radius-xl);
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}

.report-detail__stat {
  text-align: center;
}

.report-detail__stat-value {
  display: block;
  font-size: 48px;
  font-weight: bold;
  color: var(--color-primary);
}

.report-detail__stat-label {
  font-size: 24px;
  color: var(--color-text-secondary);
}

.report-detail__section {
  background: var(--color-bg-card);
  border-radius: var(--radius-xl);
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
}

.report-detail__section-title {
  display: block;
  font-size: 28px;
  font-weight: bold;
  color: var(--color-text);
  margin-bottom: var(--spacing-md);
}

.report-detail__hexagrams {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.report-detail__hexagram {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--color-bg-light);
  border-radius: var(--radius-md);
}

.report-detail__hexagram-name {
  font-size: 28px;
  font-weight: bold;
  color: var(--color-text);
}

.report-detail__hexagram-count {
  font-size: 22px;
  color: var(--color-text-secondary);
}

.report-detail__scenes {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.report-detail__scene-tag {
  padding: var(--spacing-xs) var(--spacing-md);
  background: var(--color-primary-light);
  border-radius: var(--radius-lg);
}

.report-detail__scene-text {
  font-size: 24px;
  color: var(--color-text);
}

.report-detail__story {
  background: var(--color-bg-card);
  border-radius: var(--radius-xl);
  padding: var(--spacing-lg);
}

.report-detail__story-title {
  display: block;
  font-size: 28px;
  font-weight: bold;
  color: var(--color-text);
  margin-bottom: var(--spacing-md);
}

.report-detail__story-content {
  font-size: 28px;
  line-height: 1.8;
  color: var(--color-text-secondary);
}
```

- [ ] **Step 3: 添加详情页路由**

在 `packages/app/src/app.config.ts` 的 pages 数组中添加：

```typescript
'pages/report/detail',
```

- [ ] **Step 4: 验证类型检查**

Run: `pnpm --filter @yiban/app typecheck`
Expected: 无错误

---

### Task 7: 更新设置页添加统计和报告入口

**Files:**
- Modify: `packages/app/src/pages/settings/index.tsx`
- Modify: `packages/app/src/pages/settings/index.scss`

- [ ] **Step 1: 添加统计和报告入口**

修改 `packages/app/src/pages/settings/index.tsx`，在用户信息区域添加：

1. 导入 reportApi：

```typescript
import { reportApi } from '../../api/report';
```

2. 添加状态：

```typescript
const [stats, setStats] = useState<{ totalCheckins: number; monthCheckins: number; maxConsecutive: number; currentConsecutive: number } | null>(null);
```

3. 添加加载统计的 useEffect：

```typescript
useEffect(() => {
  if (isLoggedIn) {
    loadStats();
  }
}, [isLoggedIn]);

const loadStats = async () => {
  try {
    const response = await reportApi.getStats();
    setStats(response.stats);
  } catch (error) {
    console.error('Load stats failed:', error);
  }
};
```

4. 在用户信息区域添加统计展示（替换或补充现有用户卡片）：

```tsx
{isLoggedIn && user && (
  <View className="settings-page__card">
    <View className="settings-page__user" onClick={handleEditProfile}>
      {user.avatar ? (
        <Image className="settings-page__user-avatar-img" src={getFullAvatarUrl(user.avatar)} mode="aspectFill" />
      ) : (
        <View className="settings-page__user-avatar" style={{ background: currentTheme.colors.primary }}>
          <Text className="settings-page__user-avatar-text">{user.nickname?.charAt(0) || '易'}</Text>
        </View>
      )}
      <View className="settings-page__user-info">
        <Text className="settings-page__user-name">{user.nickname || '易伴用户'}</Text>
        <Text className="settings-page__user-id">ID: {user.id.slice(0, 8)}</Text>
      </View>
      <Text className="settings-page__user-edit">编辑</Text>
    </View>
    
    {stats && (
      <View className="settings-page__stats">
        <View className="settings-page__stat">
          <Text className="settings-page__stat-value">{stats.totalCheckins}</Text>
          <Text className="settings-page__stat-label">累计打卡</Text>
        </View>
        <View className="settings-page__stat">
          <Text className="settings-page__stat-value">{stats.monthCheckins}</Text>
          <Text className="settings-page__stat-label">本月打卡</Text>
        </View>
        <View className="settings-page__stat">
          <Text className="settings-page__stat-value">{stats.currentConsecutive}</Text>
          <Text className="settings-page__stat-label">连续打卡</Text>
        </View>
      </View>
    )}
  </View>
)}
```

5. 添加报告入口（在"数据与存储"卡片后添加）：

```tsx
<View className="settings-page__card">
  <Text className="settings-page__card-title">我的记录</Text>
  
  <View className="settings-page__item settings-page__item--clickable" onClick={() => Taro.navigateTo({ url: '/pages/report/index' })}>
    <Text className="settings-page__item-label">月度报告</Text>
    <Text className="settings-page__item-arrow">›</Text>
  </View>
</View>
```

- [ ] **Step 2: 添加统计区样式**

在 `packages/app/src/pages/settings/index.scss` 中添加：

```scss
.settings-page__stats {
  display: flex;
  justify-content: space-around;
  padding-top: var(--spacing-md);
  margin-top: var(--spacing-md);
  border-top: 1px solid var(--color-border);
}

.settings-page__stat {
  text-align: center;
}

.settings-page__stat-value {
  display: block;
  font-size: 40px;
  font-weight: bold;
  color: var(--color-primary);
}

.settings-page__stat-label {
  font-size: 22px;
  color: var(--color-text-secondary);
}
```

- [ ] **Step 3: 验证类型检查**

Run: `pnpm --filter @yiban/app typecheck`
Expected: 无错误

---

### Task 8: 构建和测试

- [ ] **Step 1: 构建小程序**

Run: `pnpm --filter @yiban/app build:weapp`
Expected: 编译成功

- [ ] **Step 2: 同步后端到服务器**

Run: `rsync -avz -e "ssh -i ~/.ssh/id_ed25519" packages/api/src/ root@115.190.188.155:/var/www/yiban-api/src/`

- [ ] **Step 3: 重启服务器**

Run: `ssh -i ~/.ssh/id_ed25519 root@115.190.188.155 "pm2 restart yiban-api"`

- [ ] **Step 4: 测试功能**

1. 进入设置页，查看统计是否显示
2. 点击"月度报告"，进入报告列表页
3. 点击"生成本月报告"，验证生成成功
4. 点击报告项，查看详情页

---

### Task 9: 提交代码

- [ ] **Step 1: 提交所有改动**

```bash
git add -A
git commit -m "feat: 月度报告 + 打卡统计功能

- 后端添加 monthly_reports 表
- 后端添加报告生成服务（统计 + AI 故事）
- 后端添加报告 API 路由
- 前端添加报告列表页和详情页
- 设置页添加打卡统计展示和报告入口
- 预留付费检查接口（TODO 注释）"
```
