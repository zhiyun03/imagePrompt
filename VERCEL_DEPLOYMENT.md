# 部署到 Vercel 所需的环境变量

## 必需的环境变量

### 应用配置
- `NEXT_PUBLIC_APP_URL` - 你的应用 URL（例如：https://your-app.vercel.app）

### 认证配置
- `NEXTAUTH_URL` - NextAuth.js URL（与应用 URL 相同）
- `NEXTAUTH_SECRET` - 生成一个随机密钥（运行：`openssl rand -base64 32`）
- `GITHUB_CLIENT_ID` - GitHub OAuth 应用 ID
- `GITHUB_CLIENT_SECRET` - GitHub OAuth 应用密钥
- `ADMIN_EMAIL` - 管理员邮箱（例如：admin@yourdomain.com）

### 数据库配置
- `POSTGRES_URL` - PostgreSQL 数据库连接字符串
  - 如果使用 Vercel Postgres，从 Vercel 获取
  - 如果使用外部 PostgreSQL，格式：`postgresql://username:password@host:5432/database?sslmode=require`

### 支付配置（可选）
- `STRIPE_API_KEY` - Stripe API 密钥
- `STRIPE_WEBHOOK_SECRET` - Stripe Webhook 密钥
- `NEXT_PUBLIC_STRIPE_*` - Stripe 价格和产品 ID

### 邮件配置（可选）
- `RESEND_API_KEY` - Resend API 密钥
- `RESEND_FROM` - 发件人邮箱

### 分析配置（可选）
- `NEXT_PUBLIC_POSTHOG_KEY` - PostHog API 密钥
- `NEXT_PUBLIC_POSTHOG_HOST` - PostHog 主机

## 设置步骤

1. 在 Vercel 项目设置中添加上述环境变量
2. 确保数据库连接字符串正确
3. 部署项目

## 注意事项

- `NEXTAUTH_SECRET` 必须是一个随机生成的密钥
- 如果没有数据库，应用会使用模拟数据库（功能受限）
- GitHub OAuth 需要在 GitHub 上创建 OAuth 应用