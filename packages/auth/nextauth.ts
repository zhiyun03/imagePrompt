import { getServerSession, NextAuthOptions, User } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import EmailProvider from "next-auth/providers/email";

import { MagicLinkEmail, resend, siteConfig } from "@saasfly/common";

import type { GetServerSidePropsContext, NextApiRequest, NextApiResponse } from "next";

import { env } from "./env.mjs";

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

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    GitHubProvider({
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
      httpOptions: { timeout: 15000 },
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
    session({ token, session }) {
      if (token) {
        if (session.user) {
          session.user.id = token.sub as string;
          session.user.name = token.name;
          session.user.email = token.email;
          session.user.image = token.picture;
          session.user.isAdmin = token.isAdmin as boolean;
        }
      }
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
  debug: env.IS_DEBUG === "true",
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
