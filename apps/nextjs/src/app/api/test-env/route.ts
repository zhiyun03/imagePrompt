import { env } from "@saasfly/auth/env.mjs";

export async function GET() {
  // 仅在开发环境中返回信息，生产环境中应禁用
  if (process.env.NODE_ENV !== 'development') {
    return new Response('Not available in production', { status: 403 });
  }
  
  const envInfo = {
    GOOGLE_CLIENT_ID: env.GOOGLE_CLIENT_ID ? `${env.GOOGLE_CLIENT_ID.substring(0, 10)}...` : '未设置',
    GOOGLE_CLIENT_SECRET: env.GOOGLE_CLIENT_SECRET ? '已设置(隐藏)' : '未设置',
    NEXTAUTH_URL: env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: env.NEXTAUTH_SECRET ? '已设置(隐藏)' : '未设置',
  };
  
  return new Response(JSON.stringify(envInfo, null, 2), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}