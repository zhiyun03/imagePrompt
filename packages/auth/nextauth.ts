import { getServerSession, NextAuthOptions, User } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import { MagicLinkEmail, resend, siteConfig } from "@saasfly/common";

import type { GetServerSidePropsContext, NextApiRequest, NextApiResponse } from "next";

import { env } from "./env.mjs";

// 为openid-client设置代理
import { HttpsProxyAgent } from "https-proxy-agent";
import * as https from "https";
import * as http from "http";

type UserId = string;
type IsAdmin = boolean;

declare module "next-auth" {
  interface Session {
    user: User & {
      id: UserId;
      isAdmin: IsAdmin;
    };
  }
}

declare module "next-auth" {
  interface JWT {
    isAdmin: IsAdmin;
  }
}

// 设置全局代理 - 强制所有HTTPS请求使用代理
if (typeof window === 'undefined') {
  const httpsProxy = process.env.HTTPS_PROXY || process.env.https_proxy;
  const httpProxy = process.env.HTTP_PROXY || process.env.http_proxy;
  
  console.log('🌐 Setting up global proxy for NextAuth');
  
  if (httpsProxy || httpProxy) {
    const proxyUrl = httpsProxy || httpProxy;
    if (!proxyUrl) {
      console.log('⚠️ Proxy URL is undefined');
    } else {

    console.log('✅ Proxy detected:', proxyUrl);

    // 创建代理agent
    const proxyAgent = new HttpsProxyAgent(proxyUrl);

    // 直接替换全局HTTPS agent
    https.globalAgent = proxyAgent;

    // 直接替换全局HTTP agent  
    http.globalAgent = new HttpsProxyAgent(proxyUrl);
    
    console.log('✅ Global agents replaced with proxy agents');
    console.log('🔗 All HTTPS requests will now use proxy:', proxyUrl);

    // 设置环境变量作为备用
    process.env.HTTPS_PROXY = proxyUrl;
    process.env.https_proxy = proxyUrl;
    process.env.HTTP_PROXY = proxyUrl;
    process.env.http_proxy = proxyUrl;
    }
  } else {
    console.log('⚠️ No proxy configuration found');
  }
}

export const authOptions: NextAuthOptions = {
  // adapter: KyselyAdapter(db), // 暂时禁用适配器，先确保基本登录功能工作
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID || "",
      clientSecret: env.GOOGLE_CLIENT_SECRET || "",
      httpOptions: { 
        timeout: 60000, // 增加超时时间到60秒
        // 移除自定义agent，让Node.js使用全局代理设置
      },
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    // Temporarily disable email provider until database is configured
    // EmailProvider({
    //   sendVerificationRequest: async ({ identifier, url }) => {
    //     try {
    //       await resend.emails.send({
    //         from: env.RESEND_FROM,
    //         to: identifier,
    //         subject: `Sign-in link for ${(siteConfig as { name: string }).name}`,
    //         react: MagicLinkEmail({
    //           firstName: "",
    //           actionUrl: url,
    //           mailType: "login",
    //           siteName: (siteConfig as { name: string }).name,
    //         }),
    //         headers: {
    //           "X-Entity-Ref-ID": new Date().getTime() + "",
    //         },
    //       });
    //     } catch (error) {
    //       console.log(error);
    //     }
    //   },
    // }),
  ],
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      console.log('✅ SignIn callback triggered:', { user, account, profile });
      return true; // 允许登录
    },
    async redirect({ url, baseUrl }) {
      console.log('🔀 Redirect callback:', { url, baseUrl });
      // 如果URL是相对路径，就相对于baseUrl
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // 如果URL已经是完整的内部URL，直接返回
      else if (new URL(url).origin === baseUrl) return url;
      // 登录成功后重定向到主页（落地页）
      return `${baseUrl}/zh`;
    },
    async session({ token, session }) {
      if (token && session.user) {
        session.user.id = token.sub as string;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.picture;
        session.user.isAdmin = token.isAdmin as boolean;
      }
      console.log('📊 Session callback result:', { session: session.user });
      return session;
    },
    async jwt({ token, user }) {
      const email = token?.email ?? "";

      let isAdmin = false;
      if (env.ADMIN_EMAIL && email) {
        const adminEmails = env.ADMIN_EMAIL.split(",");
        isAdmin = adminEmails.includes(email);
      }

      return {
        ...token,
        isAdmin: isAdmin,
      };
    },
  },
  debug: true, // 临时启用调试模式
  logger: {
    error(code, metadata) {
      console.error('NextAuth Error:', code, metadata);
    },
    warn(code) {
      console.warn('NextAuth Warning:', code);
    },
    debug(code, metadata) {
      console.log('NextAuth Debug:', code, metadata);
    }
  },
  // 添加事件处理
  events: {
    signIn: async ({ user, account, profile, isNewUser }) => {
      console.log('✅ User signed in:', {
        user: { id: user.id, name: user.name, email: user.email },
        account: { provider: account?.provider, providerAccountId: account?.providerAccountId },
        isNewUser
      });

      if (isNewUser) {
        console.log('🎉 New user created:', user.email);
      }
    },
    signOut: async ({ token, session }) => {
      console.log('👋 User signed out:', { token, session });
    },
    createUser: async ({ user }) => {
      console.log('👤 User created in database:', { id: user.id, email: user.email, name: user.name });
    },
    linkAccount: async ({ user, account, profile }) => {
      console.log('🔗 Account linked:', { userId: user.id, provider: account.provider, providerAccountId: account.providerAccountId });
    },
    session: async ({ session }) => {
      console.log('📊 Session event:', { userId: session.user?.id, email: session.user?.email });
    },
  },
};

// Use it in server contexts
export function auth(
  ...args:
    | [GetServerSidePropsContext["req"], GetServerSidePropsContext["res"]]
    | [NextApiRequest, NextApiResponse]
    | []
) {
  return getServerSession(...args, authOptions);
}

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user;
}