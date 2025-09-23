# Vercel 部署指南

## 项目配置

本项目已配置为支持 Vercel 部署，包含以下配置文件：

- `vercel.json` - Vercel 构建配置
- `.vercelignore` - 排除不需要部署的文件
- `apps/nextjs/next.config.mjs` - Next.js 配置（已设置 `output: "standalone"`）

## 部署步骤

### 1. 推送代码到 GitHub

确保你的代码已推送到 GitHub 仓库：

```bash
git add .
git commit -m "配置 Vercel 部署"
git push origin main
```

### 2. 在 Vercel 中导入项目

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 "New Project"
3. 选择你的 GitHub 仓库
4. 点击 "Import"

### 3. 配置环境变量

在 Vercel 项目的 Settings > Environment Variables 中添加以下环境变量：

#### 必需的环境变量

```bash
# 应用基础配置
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app

# NextAuth.js 配置
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your-secret-key

# GitHub OAuth（用于登录）
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# 管理员邮箱（用逗号分隔）
ADMIN_EMAIL=admin@example.com,root@example.com

# 数据库配置（PostgreSQL）
POSTGRES_URL=your-postgresql-connection-string
```

#### 可选的环境变量

```bash
# 邮件服务（Resend）
RESEND_API_KEY=your-resend-api-key
RESEND_FROM=noreply@yourdomain.com

# 支付服务（Stripe）
STRIPE_API_KEY=your-stripe-api-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
NEXT_PUBLIC_STRIPE_STD_PRODUCT_ID=prod_xxx
NEXT_PUBLIC_STRIPE_STD_MONTHLY_PRICE_ID=price_xxx

# 分析服务（PostHog）
NEXT_PUBLIC_POSTHOG_KEY=your-posthog-key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# 调试模式
IS_DEBUG=false
```

### 4. 数据库设置

#### 使用 Vercel Postgres（推荐）

1. 在 Vercel Dashboard 中，点击 "Storage"
2. 选择 "Create Database"
3. 选择 "Postgres"
4. 创建数据库后，复制连接字符串到 `POSTGRES_URL` 环境变量

#### 使用外部 PostgreSQL

如果你使用外部 PostgreSQL 服务，确保：
- 数据库可从 Vercel 访问
- 在环境变量中设置 `POSTGRES_URL`

#### 初始化数据库

部署完成后，运行数据库迁移：

```bash
# 在本地运行（需要配置环境变量）
bun run db:push
```

### 5. 触发部署

配置完成后，Vercel 会自动触发部署。你也可以手动触发：

1. 在 Vercel Dashboard 中进入项目
2. 点击 "Deployments"
3. 点击 "Redeploy"

### 6. 验证部署

部署完成后，检查：

1. 访问你的应用 URL
2. 测试用户登录功能
3. 验证数据库连接
4. 检查所有页面是否正常加载

## 故障排除

### 常见问题

#### 1. 构建失败

- 检查 `bun run build` 是否在本地成功
- 确保所有依赖正确安装
- 查看构建日志了解具体错误

#### 2. 环境变量问题

- 确保所有必需的环境变量都已设置
- 检查环境变量名称是否正确
- 确保密钥值没有特殊字符

#### 3. 数据库连接失败

- 验证 `POSTGRES_URL` 格式正确
- 确保数据库允许 Vercel IP 地址连接
- 检查数据库是否正在运行

#### 4. 认证问题

- 确保 `NEXTAUTH_URL` 与部署 URL 匹配
- 验证 GitHub OAuth 配置正确
- 检查 `NEXTAUTH_SECRET` 是否设置

### 监控和日志

- 在 Vercel Dashboard 中查看 "Logs"
- 使用 "Analytics" 监控性能
- 配置错误报警

## 域名配置

### 自定义域名

1. 在 Vercel Dashboard 中进入项目
2. 点击 "Settings" > "Domains"
3. 添加你的域名
4. 按照 DNS 配置说明设置域名记录

### HTTPS

Vercel 自动为所有部署提供 HTTPS 证书。

## 性能优化

- 使用 Vercel Edge Functions 优化静态资源
- 配置图片优化
- 启用缓存策略
- 监控构建时间和性能指标

## 更新部署

当代码推送到主分支时，Vercel 会自动触发部署。你可以：

1. 在 GitHub 中设置分支保护
2. 配置预览部署（Pull Request 自动部署）
3. 设置部署钩子

## 支持

如果遇到问题，请：

1. 查看 Vercel 文档
2. 检查项目日志
3. 确保环境配置正确
4. 联系技术支持