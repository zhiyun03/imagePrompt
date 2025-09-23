#!/bin/bash

# Vercel 构建脚本
# 这个脚本解决了 workspace 依赖问题和数据库连接问题

echo "Starting Vercel build..."

# 1. 安装根目录依赖
echo "Installing root dependencies..."
bun install

# 2. 进入 nextjs 目录
echo "Building Next.js app..."
cd apps/nextjs

# 3. 安装 nextjs 依赖（如果需要）
if [ ! -d "node_modules" ]; then
    echo "Installing Next.js dependencies..."
    bun install
fi

# 4. 构建应用（跳过环境验证以避免数据库连接问题）
echo "Running Next.js build..."
SKIP_ENV_VALIDATION=true POSTGRES_URL="postgresql://dummy:dummy@localhost:5432/dummy" bun run build

echo "Build completed successfully!"