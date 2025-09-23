#!/bin/bash

# Vercel 简化构建脚本
# 专门解决workspace依赖问题，但不影响Next.js版本检测

set -e

echo "🚀 Starting Vercel build for SaaS Fly monorepo..."
echo "📅 Build started at: $(date)"

# 进入nextjs目录
cd apps/nextjs

echo "📦 Installing dependencies..."
bun install

echo "🏗️ Building Next.js app..."
SKIP_ENV_VALIDATION=true bun run build

echo "✅ Build completed successfully!"
echo "📅 Build finished at: $(date)"