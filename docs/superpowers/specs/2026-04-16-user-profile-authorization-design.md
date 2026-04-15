# 用户资料授权设计

## 背景

微信小程序自 2022 年起废弃了 `wx.getUserInfo` API，无法直接获取用户昵称和头像。需要用户主动填写。

**当前问题**：
- 用户进入小程序直接到首页
- 登录时只获取 openid，昵称和头像使用默认值
- 用户体验不完整，无法个性化

## 目标

在用户首次进入小程序时，引导用户填写昵称和头像（可跳过）。

## 流程

```
启动 App
    ↓
检查登录状态
    ↓
┌─ 已登录且已完善资料 → 进入首页
│
└─ 未登录/未完善资料 → 跳转授权页
                            ↓
                    ┌─ 填写昵称头像 → 保存 → 进入首页
                    │
                    └─ 跳过 → 使用随机值 → 进入首页
```

## 技术方案

### 1. 新增授权页面

**路径**：`packages/app/src/pages/authorize/index.tsx`

**页面内容**：
- 品牌 Logo + 标题「易伴·卦象神兽」
- 副标题「设置你的专属形象」
- 头像选择按钮（使用 `open-type="chooseAvatar"`）
- 昵称输入框（使用 `type="nickname"`）
- 「完成」按钮（保存并跳转首页）
- 「跳过」按钮（使用随机昵称 + 默认头像）

### 2. 微信小程序 API

```tsx
// 头像选择
<button open-type="chooseAvatar" onChooseAvatar={handleChooseAvatar}>
  <Image src={avatar} />
</button>

// 昵称输入
<input type="nickname" placeholder="请输入昵称" onInput={handleNicknameInput} />
```

### 3. 检查用户是否已完善资料

在 `AuthContext` 中添加判断逻辑：
- 方案 A：检查 `nickname` 是否匹配 `易友\d{4}` 模式
- 方案 B（推荐）：后端新增 `hasProfile` 字段

采用方案 A，无需后端改动。

### 4. 随机昵称生成

跳过时生成 `易友${Math.floor(Math.random() * 10000)}` 格式的昵称。

### 5. 后端 API

新增 `PUT /api/user/profile` 接口，用于更新用户昵称和头像。

## 文件变更

| 文件 | 操作 |
|------|------|
| `packages/app/src/pages/authorize/index.tsx` | 新增 |
| `packages/app/src/pages/authorize/index.scss` | 新增 |
| `packages/app/src/app.config.ts` | 添加页面路由 |
| `packages/app/src/context/AuthContext.tsx` | 添加 `hasProfile` 判断 |
| `packages/app/src/api/user.ts` | 添加 `updateProfile` 方法 |
| `packages/api/src/routes/user.ts` | 添加 `PUT /profile` 路由 |

## 设计细节

### 授权页面样式

- 背景：品牌色 `#F5F0E8`
- 头像：圆形，120rpx，带边框
- 昵称输入框：圆角，品牌色边框
- 按钮：主按钮红色，跳过按钮灰色文字

### 交互

- 头像点击 → 弹出微信头像选择
- 昵称输入 → 弹出微信昵称键盘
- 完成 → 调用 API 保存 → 跳转首页
- 跳过 → 使用随机值 → 跳转首页

## 成功标准

1. 首次进入小程序显示授权页
2. 用户可以选择头像和昵称
3. 用户可以跳过，使用随机值
4. 完成后进入首页，再次启动不再显示授权页
