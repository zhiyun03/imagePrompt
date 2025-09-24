#!/usr/bin/env node

// 环境变量验证脚本
console.log('🔍 验证环境变量配置...\n');

// 尝试加载 .env.local 文件
try {
  require('dotenv').config({ path: '.env.local' });
  console.log('✅ 已加载 .env.local 文件');
} catch (error) {
  console.log('⚠️ 无法加载 .env.local 文件，使用 process.env');
}

const requiredEnvVars = [
  'NEXTAUTH_URL',
  'NEXTAUTH_SECRET',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'POSTGRES_URL',
  'NEXT_PUBLIC_APP_URL',
];

const optionalEnvVars = [
  'RESEND_API_KEY',
  'RESEND_FROM',
  'ADMIN_EMAIL',
  'STRIPE_API_KEY',
  'STRIPE_WEBHOOK_SECRET',
];

let hasErrors = false;

console.log('📋 必需的环境变量:');
requiredEnvVars.forEach(envVar => {
  const value = process.env[envVar];
  if (value && value !== 'placeholder_key' && value !== '') {
    console.log(`✅ ${envVar}: ${value.substring(0, 20)}${value.length > 20 ? '...' : ''}`);
  } else {
    console.log(`❌ ${envVar}: 未配置或使用占位符`);
    hasErrors = true;
  }
});

console.log('\n📋 可选的环境变量:');
optionalEnvVars.forEach(envVar => {
  const value = process.env[envVar];
  if (value && value !== 'placeholder_key' && value !== '') {
    console.log(`✅ ${envVar}: ${value.substring(0, 20)}${value.length > 20 ? '...' : ''}`);
  } else {
    console.log(`⚠️ ${envVar}: 未配置或使用占位符`);
  }
});

console.log('\n🔧 NextAuth 配置验证:');
if (process.env.NEXTAUTH_URL && process.env.NEXTAUTH_SECRET) {
  console.log('✅ NextAuth 基础配置完整');
} else {
  console.log('❌ NextAuth 基础配置缺失');
  hasErrors = true;
}

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  console.log('✅ Google OAuth 配置完整');
} else {
  console.log('❌ Google OAuth 配置缺失');
  hasErrors = true;
}

if (process.env.POSTGRES_URL) {
  console.log('✅ 数据库连接已配置');
} else {
  console.log('❌ 数据库连接未配置');
  hasErrors = true;
}

console.log('\n📝 验证结果:');
if (hasErrors) {
  console.log('❌ 发现配置问题，请修复后重新启动应用');
  process.exit(1);
} else {
  console.log('✅ 所有必需的环境变量都已正确配置');
  console.log('🚀 应用可以正常启动');
}