# Vercel 部署指南

## 项目配置

### 1. Bun 运行时配置
Vercel 原生不支持 Bun，需要通过以下方式配置：

**方案 A：使用 Vercel 的 Build Command**
- 在 Vercel 项目设置中，设置 Build Command 为 `bun run build`
- 确保 Node.js 版本 >= 18

**方案 B：修改 package.json 使用 npm**
在根目录 package.json 中添加：
```json
{
  "scripts": {
    "vercel-build": "npm run build"
  }
}
```

### 2. 必需的环境变量

#### 应用配置
- `NEXT_PUBLIC_APP_URL` - 你的应用 URL（例如：https://your-app.vercel.app）

#### 认证配置
- `NEXTAUTH_URL` - NextAuth.js URL（与应用 URL 相同）
- `NEXTAUTH_SECRET` - 生成一个随机密钥（运行：`openssl rand -base64 32`）
- `GITHUB_CLIENT_ID` - GitHub OAuth 应用 ID
- `GITHUB_CLIENT_SECRET` - GitHub OAuth 应用密钥
- `ADMIN_EMAIL` - 管理员邮箱（例如：admin@yourdomain.com）

#### 数据库配置
- `POSTGRES_URL` - PostgreSQL 数据库连接字符串
  - 如果使用 Vercel Postgres，从 Vercel 获取
  - 如果使用外部 PostgreSQL，格式：`postgresql://username:password@host:5432/database?sslmode=require`

### 3. 可选的环境变量

#### 支付配置
- `STRIPE_API_KEY` - Stripe API 密钥
- `STRIPE_WEBHOOK_SECRET` - Stripe Webhook 密钥
- `NEXT_PUBLIC_STRIPE_*` - Stripe 价格和产品 ID

#### 邮件配置
- `RESEND_API_KEY` - Resend API 密钥
- `RESEND_FROM` - 发件人邮箱

#### 分析配置
- `NEXT_PUBLIC_POSTHOG_KEY` - PostHog API 密钥
- `NEXT_PUBLIC_POSTHOG_HOST` - PostHog 主机

## 部署步骤

### 1. 准备环境变量
在 Vercel 项目设置中添加所有必需的环境变量。

### 2. GitHub OAuth 设置
1. 在 GitHub 上创建 OAuth 应用
2. 设置 Homepage URL 为 `https://your-app.vercel.app`
3. 设置 Authorization callback URL 为 `https://your-app.vercel.app/api/auth/callback/github`

### 3. 数据库设置（推荐 Vercel Postgres）
1. 在 Vercel 项目中添加 Vercel Postgres
2. 复制连接字符串到 `POSTGRES_URL` 环境变量

### 4. 部署项目
1. 推送代码到 GitHub
2. 或在 Vercel 中导入项目

## 故障排除

### 构建失败
如果遇到 "Command exited with 1" 错误：
1. 确保所有环境变量都已设置
2. 检查 Node.js 版本 >= 18
3. 尝试在本地运行 `bun run build` 确保构建成功

### 数据库连接错误
如果遇到数据库连接错误：
1. 检查 `POSTGRES_URL` 是否正确
2. 如果没有数据库，代码会使用模拟数据库（功能受限）

### 认证错误
如果遇到认证错误：
1. 检查 `NEXTAUTH_SECRET` 是否已设置
2. 确保 GitHub OAuth 配置正确

## 重要注意事项

- `NEXTAUTH_SECRET` 必须是一个随机生成的密钥
- 在生产环境中，不要使用默认的示例值
- 定期更新依赖项以获得安全更新
- 监控 Vercel 的构建日志以排查问题