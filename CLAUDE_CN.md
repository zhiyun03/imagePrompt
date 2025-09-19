# CLAUDE_CN.md 已从版本控制中移除

此文件为 Claude Code (claude.ai/code) 在此代码仓库中工作时提供中文指导。

## 全局规则
我会用中文给你指令，你需要用中文回复

## 开发命令

### 核心开发
- `bun run dev:web` - 启动 Web 应用开发服务器（Next.js 在 localhost:3000）
- `bun run dev` - 并行启动所有开发服务器
- `bun run build` - 使用 Turbo 构建所有包和应用
- `bun run typecheck` - 在所有包中运行 TypeScript 类型检查
- `bun run lint` - 在所有包中运行 ESLint
- `bun run lint:fix` - 自动修复 ESLint 问题
- `bun run format` - 使用 Prettier 检查代码格式
- `bun run format:fix` - 自动修复代码格式

### 数据库操作
- `bun run db:push` - 将数据库架构更改推送到 PostgreSQL（需要先设置数据库）

### 包管理
- 使用 Bun 作为包管理器（`bun install`、`bun add` 等）
- 采用 apps/、packages/ 和 tooling/ 目录的工作区 monorepo 结构

## 项目架构

### Monorepo 结构
这是一个 Turbo monorepo，包含以下主要组件：

**应用：**
- `apps/nextjs/` - 主要的 Next.js 14 应用程序（SaaS Web 应用）
- `apps/auth-proxy/` - 身份验证代理服务

**包：**
- `packages/db/` - 使用 Kysely 和 Prisma 的数据库层（PostgreSQL）
- `packages/auth/` - 身份验证工具（目前使用 Clerk）
- `packages/api/` - 共享 API 工具和 tRPC 设置
- `packages/ui/` - 共享 React 组件（基于 shadcn/ui）
- `packages/common/` - 共享工具和类型
- `packages/stripe/` - Stripe 支付集成

**工具配置：**
- `tooling/eslint-config/` - 共享 ESLint 配置
- `tooling/prettier-config/` - 共享 Prettier 配置
- `tooling/tailwind-config/` - 共享 Tailwind CSS 配置
- `tooling/typescript-config/` - 共享 TypeScript 配置

### 核心技术栈
- **框架：** Next.js 14 与 App Router
- **数据库：** PostgreSQL 与 Kysely（类型安全查询构建器）和 Prisma（架构管理）
- **身份验证：** Clerk（2025年6月后默认，NextAuth.js 在单独分支可用）
- **样式：** Tailwind CSS 与 shadcn/ui 组件
- **状态管理：** Zustand
- **数据获取：** tRPC 与 React Query
- **支付：** Stripe 集成
- **邮件：** Resend 与 React Email 模板
- **国际化：** 内置 i18n 支持

### 数据库设置
1. 复制 `.env.example` 到 `.env.local`
2. 设置 PostgreSQL 数据库（本地或 Vercel Postgres）
3. 在 `.env.local` 中添加 `POSTGRES_URL`
4. 运行 `bun run db:push` 初始化数据库架构

### 环境变量
需要配置的关键环境变量：
- `NEXT_PUBLIC_APP_URL` - 应用程序 URL
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` 和 `CLERK_SECRET_KEY` - Clerk 身份验证
- `POSTGRES_URL` - 数据库连接
- `STRIPE_API_KEY` 和 `STRIPE_WEBHOOK_SECRET` - 支付处理
- `RESEND_API_KEY` 和 `RESEND_FROM` - 邮件发送
- `GITHUB_CLIENT_ID` 和 `GITHUB_CLIENT_SECRET` - GitHub OAuth

### 管理后台
- 通过 `/admin/dashboard` 访问
- 通过 `ADMIN_EMAIL` 环境变量配置管理员邮箱
- 目前处于 alpha 阶段，仅有静态页面

### 代码质量
- TypeScript 确保类型安全
- ESLint 自定义配置
- Prettier 代码格式化
- Husky Git 钩子
- Turbo 构建编排和缓存

## 开发注意事项

### 项目特点
- 这是一个企业级 SaaS 应用程序模板
- 使用 monorepo 架构便于代码管理和复用
- 集成了多种企业级功能（支付、身份验证、国际化等）
- 重点关注开发者体验和代码质量

### 常见任务
- **新功能开发：** 在相应的包中添加功能，遵循现有架构模式
- **数据库更改：** 修改 Prisma 架构后运行 `bun run db:push`
- **样式调整：** 使用 Tailwind CSS 类和 shadcn/ui 组件
- **API 开发：** 使用 tRPC 创建类型安全的 API 端点

### 调试和测试
- 使用 `bun run dev:web` 启动开发服务器
- 检查浏览器控制台和网络选项卡进行调试
- 确保所有环境变量正确配置
- 数据库连接正常工作

### 部署准备
- 运行 `bun run build` 确保构建成功
- 检查 `bun run typecheck` 和 `bun run lint` 无错误
- 确保所有环境变量在生产环境中正确设置