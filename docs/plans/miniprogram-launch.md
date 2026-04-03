# 小程序上线实施计划

> **目标**：上线小程序，实现沉浸式体验 + 一键微信登录

---

## 1. 改动范围

### 1.1 首页改版

**packages/app/src/pages/home/index.tsx**
- 移除"立即登录"按钮和未登录引导
- 打卡按钮改为直接触发微信登录（若未登录）

**packages/app/src/context/InspirationContext.tsx**
- `handleCheckIn` 增加未登录检测
- 若未登录，先调用微信登录，登录成功后再打卡

### 1.2 登录页优化

**packages/app/src/pages/login/index.tsx**
- 简化保留手机号登录入口（作为备用）
- 微信一键登录逻辑移到打卡流程中

### 1.3 后端部署

**packages/api**
- 配置生产环境变量
- 部署到公网服务器
- 配置 HTTPS

---

## 2. 实施步骤

### Step 1: 首页沉浸式改版 ✅ 已完成

**文件**: `packages/app/src/pages/home/index.tsx`

- [x] 移除未登录引导 UI
- [x] 修改 `onCheckIn` 函数支持未登录时触发登录
- [x] 用户点击打卡 → 自动弹窗微信授权 → 登录成功后自动打卡

**验证**: `pnpm --filter @yiban/app exec tsc --noEmit` ✅

---

### Step 2: 一键微信登录封装 ✅ 已完成

**文件**: `packages/app/src/context/AuthContext.tsx`

- [x] 新增 `loginWithWeapp()` 方法
- [x] 使用 `Taro.login()` 获取微信授权码
- [x] 发送 code 到后端换取 JWT

**验证**: `pnpm --filter @yiban/app exec tsc --noEmit` ✅

---

### Step 3: 登录页简化 🔲 待决定

**文件**: `packages/app/src/pages/login/index.tsx`

当前状态：登录页保留手机号登录入口作为备用。

是否需要简化取决于产品策略：
- 若完全不需要手机号登录 → 可移除
- 若保留备用入口 → 保持现状

---

### Step 4: 后端部署准备

**packages/api/.env.example** 新增：
```bash
# 生产环境
NODE_ENV=production
DATABASE_URL=file:prod.db
PORT=3000

# JWT
JWT_SECRET=your_production_secret

# 微信小程序（生产）
WECHAT_APPID=your_appid
WECHAT_SECRET=your_secret

# AI
AI_API_KEY=your_api_key
```

**部署检查清单**:
- [ ] 服务器准备（Node.js 18+）
- [ ] 数据库文件迁移
- [ ] HTTPS 证书配置
- [ ] 域名解析

---

## 3. 验收标准

- [ ] 未登录用户点击打卡 → 自动弹出微信授权 → 登录成功后自动打卡
- [ ] 已登录用户点击打卡 → 直接执行打卡逻辑
- [ ] TypeScript 编译零错误
- [ ] 后端 API 可公网访问

---

## 4. 后续观察指标

上线后监控：
- 打卡转化率（点击 → 完成）
- 新用户登录成功率
- 次日留存率
- 分享率
