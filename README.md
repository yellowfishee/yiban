# 易伴·卦象神兽

## 快速启动

### 1. 安装依赖

```bash
pnpm install
```

### 2. 启动后端 API

```bash
# 终端 1
cd packages/api
pnpm dev
```

后端服务运行在 http://localhost:3000

### 3. 启动前端 H5

```bash
# 终端 2
cd packages/app
pnpm build:h5 && npx serve dist -p 10086
```

然后访问 http://localhost:10086 或 http://你的IP:10086

---

## 微信小程序

```bash
cd packages/app
pnpm build:weapp
```

用微信开发者工具打开 `packages/app/dist` 目录。

---

## 常用命令

| 命令 | 说明 |
|------|------|
| `pnpm install` | 安装所有依赖 |
| `pnpm --filter @yiban/api dev` | 启动后端 API |
| `pnpm --filter @yiban/app build:h5` | 构建 H5 产物 |
| `pnpm --filter @yiban/app build:weapp` | 构建小程序产物 |

---

## 环境变量

后端 API 需要 `.env` 文件（`packages/api/.env`）：

```env
JWT_SECRET=your-jwt-secret-here
WECHAT_APPID=wx203011da8e42d5f9
WECHAT_SECRET=your-wechat-appsecret-here
```

---

## 端口

| 服务 | 端口 |
|------|------|
| 后端 API | 3000 |
| H5 预览 | 10086 |

---

## 项目结构

```
packages/
├── core/     # 共享包（类型、算法、数据）
├── app/      # Taro 跨平台应用（H5 + 小程序）
└── api/      # 后端服务（Hono + Drizzle）
```
