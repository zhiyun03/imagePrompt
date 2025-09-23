# Vercel 部署配置指南

## 概述
本项目使用 Bun 作为包管理器，通过自定义构建脚本在 Vercel 上部署 monorepo 项目。

## Vercel 项目设置

### 1. 构建设置
在 Vercel 项目设置中配置：
- **Framework**: Next.js
- **Build Command**: `./vercel-build-inline.sh`
- **Output Directory**: `apps/nextjs/.next`
- **Install Command**: 留空（由构建脚本处理）
- **Node.js Version**: 20.x

### 2. 环境变量

#### 必需变量
| 变量名 | 示例值 | 说明 |
|--------|--------|------|
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` | 应用的公开 URL |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` | NextAuth 的 URL |
| `NEXTAUTH_SECRET` | `your-generated-secret` | 使用 `openssl rand -base64 32` 生成 |
| `GITHUB_CLIENT_ID` | `your-github-client-id` | GitHub OAuth 应用 ID |
| `GITHUB_CLIENT_SECRET` | `your-github-client-secret` | GitHub OAuth 应用密钥 |
| `ADMIN_EMAIL` | `admin@example.com` | 管理员邮箱 |
| `POSTGRES_URL` | `postgresql://...` | 数据库连接字符串 |

#### 可选变量
| 变量名 | 说明 |
|--------|------|
| `STRIPE_API_KEY` | Stripe 支付 API 密钥 |
| `STRIPE_WEBHOOK_SECRET` | Stripe Webhook 密钥 |
| `RESEND_API_KEY` | Resend 邮件服务 API 密钥 |
| `RESEND_FROM` | 发件人邮箱地址 |
| `NEXT_PUBLIC_POSTHOG_KEY` | PostHog 分析密钥 |
| `NEXT_PUBLIC_POSTHOG_HOST` | PostHog 主机地址 |

### 3. GitHub OAuth 配置

1. 访问 [GitHub Developer Settings](https://github.com/settings/developers)
2. 点击 "New OAuth App"
3. 填写应用信息：
   - **Application name**: 你的应用名称
   - **Homepage URL**: `https://your-app.vercel.app`
   - **Authorization callback URL**: `https://your-app.vercel.app/api/auth/callback/github`
4. 记录 Client ID 和 Client Secret，添加到 Vercel 环境变量中

### 4. 数据库配置

#### 使用 Vercel Postgres（推荐）
1. 在 Vercel 项目中添加 Postgres 数据库
2. 复制连接字符串到 `POSTGRES_URL` 环境变量
3. 连接后，运行 `bun run db:push` 来初始化数据库

#### 使用外部数据库
1. 确保数据库可以通过公网访问
2. 配置 `POSTGRES_URL` 格式：
   ```
   postgresql://username:password@host:port/database
   ```

## 部署步骤

### 1. 初始部署
1. 连接 GitHub 仓库到 Vercel
2. 配置上述环境变量
3. 设置构建设置
4. 触发部署

### 2. 数据库初始化
部署成功后，需要在本地运行数据库初始化：
```bash
# 设置环境变量
cp .env.example .env.local
# 编辑 .env.local 添加你的 POSTGRES_URL

# 推送数据库架构
bun run db:push
```

### 3. 验证部署
- 访问应用的各个页面
- 测试登录功能
- 验证数据库连接
- 检查所有功能是否正常

## 故障排除

### 常见问题

#### 1. 构建失败
- 检查 Node.js 版本是否为 20.x
- 确认 Build Command 设置为 `./vercel-build.sh`
- 查看 Vercel 构建日志中的具体错误

#### 2. 环境变量问题
- 确保所有必需的环境变量都已设置
- 检查 `NEXTAUTH_SECRET` 是否正确生成
- 验证数据库连接字符串格式

#### 3. 认证问题
- 检查 GitHub OAuth 配置是否正确
- 确保 `NEXTAUTH_URL` 与部署 URL 匹配
- 验证回调 URL 配置

#### 4. 数据库连接问题
- 确认数据库可以通过公网访问
- 检查 `POSTGRES_URL` 格式是否正确
- 验证数据库权限设置

## 本地开发

### 环境设置
```bash
# 复制环境变量模板
cp .env.example .env.local

# 安装依赖
bun install

# 启动开发服务器
bun run dev:web
```

### 数据库操作
```bash
# 推送数据库架构
bun run db:push

# 生成数据库类型
bun run db:generate
```

## 维护

### 更新依赖
```bash
# 更新所有依赖
bun update

# 更新特定依赖
bun update package-name
```

### 监控
- 定期检查 Vercel 部署状态
- 监控应用性能和错误
- 检查数据库连接和性能

## 技术方案说明

### 内联配置方案
本方案使用内联配置来解决 Vercel 环境下的 workspace 依赖问题：

- **tsconfig.vercel.json**: 内联 TypeScript 配置，避免依赖 @saasfly/typescript-config
- **tailwind.config.vercel.ts**: 内联 Tailwind 配置，避免依赖 @saasfly/tailwind-config
- **.eslintrc.vercel.json**: 内联 ESLint 配置，避免依赖 @saasfly/eslint-config
- **.prettierrc.vercel.json**: 内联 Prettier 配置，避免依赖 @saasfly/prettier-config
- **vercel-build-inline.sh**: 智能构建脚本，自动替换配置文件

### 构建流程
1. 备份原始配置文件
2. 替换为 Vercel 专用配置
3. 移除 package.json 中的 workspace 依赖
4. 安装依赖并构建
5. 恢复原始配置文件

### 优势
- 保持本地开发体验不变
- 完全解决 workspace 依赖问题
- 自动化配置管理
- 错误恢复机制

## 技术支持

如遇问题，请：
1. 检查 Vercel 构建日志
2. 查看浏览器控制台错误
3. 验证环境变量配置
4. 检查构建脚本执行状态
5. 检查 GitHub Issues 或创建新 Issue