# 月度报告 + 打卡统计设计

> 日期：2026-04-16
> 状态：待实现

---

## 一、目标

实现付费用户的月度报告功能，并展示打卡统计数据。

---

## 二、功能概述

### 2.1 月度报告

**入口**：设置页 → "我的报告"

**报告内容**：
1. **打卡概览** - 本月打卡天数、连续打卡天数、打卡率
2. **卦象分析** - 本月遇到的卦象分布（可视化展示）
3. **场景偏好** - 高频解锁的 Agent 场景统计
4. **神兽相遇故事** - AI 生成的当月神兽相伴故事（GLM-5）

**触发方式**：用户手动点击"生成本月报告"按钮

**历史记录**：保存到数据库，支持查看历史报告

### 2.2 打卡统计

**统计维度**：
| 指标 | 说明 |
|------|------|
| 累计打卡 | 用户注册以来的总打卡天数 |
| 本月打卡 | 当月打卡天数 |
| 最长连续 | 历史最长连续打卡天数 |
| 当前连续 | 当前连续打卡天数（断签则重置） |

**展示位置**：
1. 设置页用户信息区 - 显示关键数字
2. 报告页面顶部 - 详细统计 + 可视化

---

## 三、技术设计

### 3.1 数据库

新增 `monthly_reports` 表：

```sql
CREATE TABLE monthly_reports (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  year_month TEXT NOT NULL,           -- "2026-04" 格式
  summary_data TEXT NOT NULL,          -- JSON: 统计数据
  story_content TEXT,                  -- AI 生成的故事
  created_at INTEGER NOT NULL,
  UNIQUE(user_id, year_month)          -- 每用户每月仅一条
);
```

**summaryData JSON 结构**：
```json
{
  "checkinDays": 15,
  "consecutiveDays": 7,
  "checkinRate": 0.5,
  "hexagramDistribution": {
    "qian_kun": 3,
    "tai": 2,
    ...
  },
  "topScenes": ["suitable_for", "advice", "companionship"]
}
```

### 3.2 API 端点

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/report/stats` | 获取用户打卡统计 |
| GET | `/api/report/list` | 获取历史报告列表 |
| GET | `/api/report/:yearMonth` | 获取指定月份报告 |
| POST | `/api/report/generate` | 生成本月报告（付费用户） |

### 3.3 前端页面

**新建页面**：
- `packages/app/src/pages/report/index.tsx` - 报告列表页
- `packages/app/src/pages/report/detail.tsx` - 报告详情页

**修改页面**：
- `packages/app/src/pages/settings/index.tsx` - 添加统计展示 + 报告入口

### 3.4 AI 报告生成

**提示词模板**：
```
你是{神兽名称}，以神兽的口吻为用户撰写本月的相伴故事。

用户本月数据：
- 打卡天数：{days}天
- 遇到的卦象：{hexagrams}
- 常问的话题：{scenes}

请用温暖、古风、鼓励的语气，写一段200字左右的月度相伴故事。
```

---

## 四、权限控制

| 功能 | 免费用户 | 付费用户 |
|------|----------|----------|
| 查看打卡统计 | ✅ | ✅ |
| 生成本月报告 | ❌ | ✅ |
| 查看历史报告 | ❌ | ✅ |

---

## 五、文件改动清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `packages/api/src/db/schema.ts` | 修改 | 添加 monthly_reports 表 |
| `packages/api/src/routes/report.ts` | 新增 | 报告相关 API |
| `packages/api/src/services/report.ts` | 新增 | 报告生成逻辑 |
| `packages/api/src/index.ts` | 修改 | 注册路由 |
| `packages/app/src/api/report.ts` | 新增 | 前端 API 客户端 |
| `packages/app/src/pages/report/index.tsx` | 新增 | 报告列表页 |
| `packages/app/src/pages/report/detail.tsx` | 新增 | 报告详情页 |
| `packages/app/src/pages/report/index.scss` | 新增 | 报告页样式 |
| `packages/app/src/pages/settings/index.tsx` | 修改 | 添加统计 + 报告入口 |
| `packages/app/src/pages/settings/index.scss` | 修改 | 统计区样式 |
| `packages/app/src/app.config.ts` | 修改 | 添加报告页路由 |

---

## 六、交互流程

### 6.1 生成报告

```
用户点击"生成本月报告"
    ↓
检查是否付费用户 → 否 → 提示升级付费
    ↓ 是
检查本月是否已生成 → 是 → 直接展示
    ↓ 否
显示加载动画（AI 生成中...）
    ↓
调用 GLM-5 API 生成故事
    ↓
保存到数据库
    ↓
展示报告内容
```

### 6.2 查看统计

```
进入设置页
    ↓
用户信息区显示：
  - 累计打卡 XX 天
  - 本月打卡 XX 天
  - 连续打卡 XX 天
    ↓
点击"我的报告" → 进入报告列表页
```

---

## 七、成功标准

1. 付费用户可生成月度报告
2. 报告包含打卡统计、卦象分布、AI 故事
3. 设置页正确展示打卡统计
4. 非付费用户无法生成报告（有升级提示）
5. 支持查看历史报告
