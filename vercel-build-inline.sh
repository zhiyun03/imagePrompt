#!/bin/bash

# Vercel 内联配置构建脚本
# 在构建前临时替换配置文件，避免workspace依赖问题

set -e

echo "🚀 Starting Vercel build with inline config..."
echo "📅 Build started at: $(date)"

# 进入nextjs目录
cd apps/nextjs

echo "📦 Backing up original config files..."
# 备份原始配置文件
cp tsconfig.json tsconfig.json.backup 2>/dev/null || true
cp tailwind.config.ts tailwind.config.ts.backup 2>/dev/null || true
cp .eslintrc.json .eslintrc.json.backup 2>/dev/null || true
cp .prettierrc .prettierrc.backup 2>/dev/null || true
cp package.json package.json.backup 2>/dev/null || true

echo "🔧 Replacing config files with Vercel-optimized versions..."
# 替换配置文件
cp tsconfig.vercel.json tsconfig.json
cp tailwind.config.vercel.ts tailwind.config.ts
cp .eslintrc.vercel.json .eslintrc.json
cp .prettierrc.vercel.json .prettierrc

echo "📝 Updating package.json to remove workspace dependencies..."
# 创建临时的Vercel专用package.json，移除workspace依赖
cat package.json.backup | jq '
  del(.devDependencies["@saasfly/eslint-config"]) |
  del(.devDependencies["@saasfly/prettier-config"]) |
  del(.devDependencies["@saasfly/tailwind-config"]) |
  del(.devDependencies["@saasfly/typescript-config"]) |
  .eslintConfig = {
    "root": true,
    "extends": [
      "next/core-web-vitals",
      "eslint:recommended",
      "@typescript-eslint/recommended-type-checked",
      "@typescript-eslint/stylistic-type-checked"
    ],
    "env": {
      "es2022": true,
      "node": true,
      "browser": true
    },
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
      "project": true,
      "ecmaVersion": 2022,
      "sourceType": "module"
    },
    "plugins": ["@typescript-eslint", "import"]
  } |
  .prettier = {
    "semi": false,
    "singleQuote": true,
    "tabWidth": 2,
    "trailingComma": "es5",
    "printWidth": 100,
    "arrowParens": "avoid",
    "endOfLine": "lf",
    "bracketSpacing": true,
    "bracketSameLine": false,
    "quoteProps": "as-needed"
  }
' > package.json

echo "📥 Installing dependencies..."
bun install

echo "🏗️ Building Next.js app..."
SKIP_ENV_VALIDATION=true bun run build

BUILD_STATUS=$?
if [ $BUILD_STATUS -ne 0 ]; then
  echo "❌ Build failed, restoring original files..."
  # 恢复原始文件
  mv tsconfig.json.backup tsconfig.json 2>/dev/null || true
  mv tailwind.config.ts.backup tailwind.config.ts 2>/dev/null || true
  mv .eslintrc.json.backup .eslintrc.json 2>/dev/null || true
  mv .prettierrc.backup .prettierrc 2>/dev/null || true
  mv package.json.backup package.json 2>/dev/null || true
  exit $BUILD_STATUS
fi

echo "🔄 Restoring original config files..."
# 恢复原始文件
mv tsconfig.json.backup tsconfig.json 2>/dev/null || true
mv tailwind.config.ts.backup tailwind.config.ts 2>/dev/null || true
mv .eslintrc.json.backup .eslintrc.json 2>/dev/null || true
mv .prettierrc.backup .prettierrc 2>/dev/null || true
mv package.json.backup package.json 2>/dev/null || true

echo "✅ Build completed successfully!"
echo "📅 Build finished at: $(date)"