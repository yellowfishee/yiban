# 神兽推荐付费流程设计方案

> 文档版本：v1.0
> 创建时间：2026-04-03
> 状态：已批准，待实施

## 1. 背景与目标

优化神兽建议的获取流程：
- 打卡后免费用户需要观看激励视频才能获取神兽建议
- 付费用户直接获取
- 每日免费1次（后端控制）
- 6个场景独立解锁（一次广告解锁1个场景）

## 2. 用户流程

### 免费用户
1. 登录 → 打卡 → 显示今日神兽
2. 点击某场景的"听取建议"按钮
3. 后端返回 `{ requiresAd: true }`
4. 前端弹出微信激励视频广告
5. 用户看完视频 → 微信回调通知后端
6. 前端再次调用 `generate` → 后端验证成功后生成内容

### 付费用户
1. 登录 → 打卡 → 显示今日神兽
2. 点击某场景的"听取建议"按钮
3. 直接生成 AI 内容

## 3. 场景定义

共6个场景：

| 场景 | 描述 | 触发时机 |
|------|------|----------|
| suitable_for | 今日适合做什么 | 用户点击解锁 |
| advice | 处事建议 | 用户点击解锁 |
| companionship | 情绪陪同 | 用户点击解锁 |
| career | 工作发展 | 用户点击解锁（新增） |
| emotion | 情感沟通 | 用户点击解锁（新增） |
| fortune | 财运参考 | 用户点击解锁（新增） |

注：新增 career、emotion、fortune 三个场景，现有三个保留。

## 4. 数据库设计

### 新增表 `daily_free_usage`

```sql
CREATE TABLE daily_free_usage (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL REFERENCES users(id),
  usedDate TEXT NOT NULL,  -- 格式：YYYY-MM-DD
  scene TEXT NOT NULL,    -- 场景标识
  usedAt INTEGER NOT NULL, -- 使用时间戳
  createdAt INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);
CREATE UNIQUE INDEX idx_daily_free_usage_user_date_scene
  ON daily_free_usage(userId, usedDate, scene);
```

### 现有表变更

`agent_contents` 表已有字段：
- `hexagramId` - 用于缓存匹配
- `mood` - 用于缓存匹配

## 5. API 设计

### GET /api/agent/contents/:checkinId

获取某次打卡的 AI 内容。

**响应**：
```json
{
  "contents": [
    {
      "id": "xxx",
      "scene": "suitable_for",
      "content": "吾观今日...",
      "cached": false,
      "requiresAd": true,
      "createdAt": "2026-04-03T00:00:00Z"
    }
  ]
}
```

### POST /api/agent/generate

生成指定场景的 AI 内容。

**请求**：
```json
{
  "checkinId": "xxx",
  "scene": "suitable_for"
}
```

**响应（需要广告）**：
```json
{
  "requiresAd": true,
  "message": "请先观看广告解锁此场景"
}
```

**响应（正常生成）**：
```json
{
  "content": "吾观今日...",
  "cached": false,
  "beastName": "凤凰",
  "scene": "suitable_for"
}
```

### POST /api/agent/ad-rewarded（新增）

微信激励视频看完后的回调接口（微信服务端触发）。

**请求**：
```json
{
  "userId": "xxx",
  "checkinId": "xxx",
  "scene": "suitable_for",
  "rewarded": true,
  "signature": "xxx"  // 微信回调签名，后端验证
}
```

**响应**：
```json
{
  "success": true,
  "remainingQuota": 0
}
```

## 6. 缓存策略

缓存主键：`userId + date + scene`

- 同一天、同一场景、同一用户，已生成过则直接返回缓存
- 免费用户每日每场景首次生成不弹广告（记录到 `daily_free_usage`）
- 付费用户不受限制

## 7. 微信激励视频集成

### 广告位配置

使用微信小程序 `RewardedVideoAd`：

```typescript
const rewardedAd = Taro.createRewardedVideoAd({
  adUnitId: 'xxx'  // 替换为实际的广告单元ID
});

rewardedAd.onClose((res) => {
  if (res.isEnded) {
    // 用户完整观看，调用 ad-rewarded 接口
    agentApi.reportAdWatched(checkinId, scene);
  }
});
```

### 签名验证

后端接收微信回调时，需验证签名防止伪造：
- 验证 `signature = md5(userId + checkinId + scene + rewardKey)`
- `rewardKey` 存储在后端配置中

## 8. 合规要求

- 所有建议描述为"参考"而非"预测"
- 强调"神兽视角的分享"，不是命理结论
- 场景名称使用中性词：事业发展、情感沟通、财运参考
- 不出现"预示"、"命运"、"注定"等词汇

## 9. H5 兼容性

微信激励视频广告仅小程序可用：
- H5 端 fallback：显示"仅小程序支持广告解锁"提示
- 或引导用户使用小程序

## 10. 待实施清单

- [ ] 创建 `daily_free_usage` 表
- [ ] 新增 `POST /api/agent/ad-rewarded` 接口
- [ ] 修改 `POST /api/agent/generate` 添加 `requiresAd` 判断逻辑
- [ ] 前端 `InspirationContext` 集成激励视频
- [ ] 前端 UI 每个场景显示解锁按钮
- [ ] 新增 career、emotion、fortune 三个场景的提示词
- [ ] 微信广告单元配置
- [ ] H5 fallback 提示

## 11. 成本估算

- 每次 AI 生成：~0.1元
- 免费用户每日：1次免费 × 6场景 = 最多0.6元/人/天
- （按需调整免费次数）
