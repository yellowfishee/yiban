# 易伴·卦象神兽

## 项目结构

```
packages/
├── core/     # 共享包（类型、算法、数据）。构建后输出到 dist/
├── app/      # Taro 3.6.39 跨平台应用（H5 + 微信小程序）
└── api/      # Hono + Drizzle (SQLite) 后端服务
```

## 常用命令

```bash
# 安装依赖
pnpm install

# 启动后端（tsx watch）
pnpm --filter @yiban/api dev

# 启动前端 H5 热更新
pnpm --filter @yiban/app dev:h5

# 构建产物
pnpm --filter @yiban/app build:h5      # H5 → dist/
pnpm --filter @yiban/app build:weapp   # 小程序 → dist/

# 类型检查
pnpm --filter @yiban/api typecheck
pnpm --filter @yiban/app typecheck
pnpm --filter @yiban/core typecheck

# 测试（仅 core 包）
pnpm --filter @yiban/core test
pnpm --filter @yiban/core test:watch

# 数据库（Drizzle）
pnpm --filter @yiban/api db:generate   # 生成迁移
pnpm --filter @yiban/api db:push        # 推送 schema 到数据库
pnpm --filter @yiban/api db:studio      # 浏览器查看数据

# 构建 core（其他包的 @yiban/core workspace:* 依赖此产物）
pnpm --filter @yiban/core build
```

## 关键约束

- **core 必须先 build**：app 和 api 的 `workspace:*` 依赖指向构建产物（`dist/`），修改 core 后需 `pnpm --filter @yiban/core build` 再运行其他包。
- **API 环境变量**：需要 `packages/api/.env`（见 `.env.example`），必须包含 `DATABASE_URL`（默认 `file:local.db`）。
- **端口**：API = 3000，H5 预览 = 10086。
- **tsconfig.base.json 强制 strict 模式**，且 `noUnusedLocals` / `noUnusedParameters` 为 true。

## Taro 路径别名

`@yiban/core` 在 app 中指向 `../core/src`（源码，非构建产物）。修改 core 源码后 app 可直接使用，无需每次 rebuild core。

## 数据库

默认 SQLite（`file:local.db`），由 drizzle-orm + libsql client 驱动。迁移文件输出到 `packages/api/drizzle/`。
