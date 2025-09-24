import { match as matchLocale } from "@formatjs/intl-localematcher";
import { withAuth } from "next-auth/middleware";
import { NextRequest, NextResponse } from "next/server";
import Negotiator from "negotiator";

import { i18n } from "~/config/i18n-config";
import { env } from "~/env.mjs";

const noNeedProcessRoute = [".*\\.png", ".*\\.jpg", ".*\\.opengraph-image.png"];

const noRedirectRoute = ["/api(.*)", "/trpc(.*)", "/admin", "/api/coze(.*)"];

const SESSION_COOKIE_NAMES = ["__Secure-next-auth.session-token", "next-auth.session-token"] as const;

const getSessionToken = (req: NextRequest) => {
  for (const name of SESSION_COOKIE_NAMES) {
    const value = req.cookies.get(name)?.value;
    if (value) {
      return value;
    }
  }
  return null;
};

function hasSessionToken(req: NextRequest | { cookies: NextRequest["cookies"] }) {
  return SESSION_COOKIE_NAMES.some((name) => !!req.cookies.get(name)?.value);
}

async function resolveAuthState(req: NextRequest) {
  const token = req.nextauth.token;
  if (token) {
    return {
      isAuth: true,
      token,
      sessionToken: null as string | null,
      userEmail: token.email ?? null,
    } as const;
  }

  const sessionToken = getSessionToken(req);
  if (!sessionToken) {
    return {
      isAuth: false,
      token: null,
      sessionToken: null,
      userEmail: null,
    } as const;
  }

  // 在 middleware/edge 环境不再调用 adapter，避免引入 openid-client 等依赖导致 substring 报错
  return {
    isAuth: !!sessionToken, // 仅凭 cookie 粗略判断
    token: null,
    sessionToken,
    userEmail: null,
  } as const;
}

const isPublicRoute = (pathname: string) => {
  const publicRoutes = [
    // 注意: login 不作为公共路由放行，避免已登录时访问 /login 被提前 next()
    new RegExp("/(\\w{2}/)?register(.*)"),
    new RegExp("/(\\w{2}/)?terms(.*)"),
    new RegExp("/(\\w{2}/)?privacy(.*)"),
    new RegExp("/(\\w{2}/)?docs(.*)"),
    new RegExp("/(\\w{2}/)?blog(.*)"),
    new RegExp("/(\\w{2}/)?pricing(.*)"),
    new RegExp("/(\\w{2}/)?image-to-prompt(.*)"), // Image to prompt tool is public
    new RegExp("^/\\w{2}$"), // root with locale
    new RegExp("^/$"), // root without locale
  ];
  return publicRoutes.some((route) => route.test(pathname));
};

export function getLocale(request: NextRequest): string | undefined {
  const negotiatorHeaders: Record<string, string> = {};
  request.headers.forEach((value, key) => (negotiatorHeaders[key] = value));
  const locales = Array.from(i18n.locales);
  const languages = new Negotiator({ headers: negotiatorHeaders }).languages(locales);
  return matchLocale(languages, locales, i18n.defaultLocale);
}

export function isNoRedirect(request: NextRequest): boolean {
  const pathname = request.nextUrl.pathname;
  return noRedirectRoute.some((route) => new RegExp(route).test(pathname));
}

export function isNoNeedProcess(request: NextRequest): boolean {
  const pathname = request.nextUrl.pathname;
  return noNeedProcessRoute.some((route) => new RegExp(route).test(pathname));
}

export default withAuth(
  async function middleware(req: NextRequest) {
    if (req.nextUrl.pathname.startsWith("/api/auth")) {
      return NextResponse.next();
    }

    // Skip middleware for our API routes to avoid authentication issues
    if (
      req.nextUrl.pathname.startsWith("/api/coze/") ||
      req.nextUrl.pathname.startsWith("/api/webhooks/")
    ) {
      return NextResponse.next();
    }

    if (isNoNeedProcess(req)) {
      return null;
    }

    const pathname = req.nextUrl.pathname;
    const pathnameIsMissingLocale = i18n.locales.every(
      (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`,
    );

    if (!isNoRedirect(req) && pathnameIsMissingLocale) {
      const locale = getLocale(req);
      return NextResponse.redirect(
        new URL(`/${locale}${pathname.startsWith("/") ? "" : "/"}${pathname}`, req.url),
      );
    }

    const isAuthPage = /^\/[a-zA-Z]{2,}\/(login|register)/.test(pathname);
    const authState = await resolveAuthState(req);
    const isAuth = authState.isAuth;

    const locale = getLocale(req);

    let isAdmin = false;
    // admin 判断保持简单，避免边缘环境读取数据库
    if (env.ADMIN_EMAIL && authState.userEmail) {
      const adminEmails = env.ADMIN_EMAIL.split(",");
      isAdmin = adminEmails.includes(authState.userEmail);
    }

    if (isAuthPage) {
      if (isAuth && locale) {
        return NextResponse.redirect(new URL(`/${locale}/dashboard`, req.url));
      }
      return NextResponse.next();
    }

    if (pathname.startsWith("/admin/dashboard")) {
      if (!isAuth || !isAdmin) {
        return NextResponse.redirect(new URL(`/admin/login`, req.url));
      }
      return NextResponse.next();
    }

    if (pathname.startsWith("/api/trpc/")) {
      return isAuth ? NextResponse.next() : NextResponse.redirect(new URL(`/api/auth/error`, req.url));
    }

    if (isPublicRoute(pathname)) {
      return NextResponse.next();
    }

    if (!isAuth) {
      let from = req.nextUrl.pathname;
      if (req.nextUrl.search) {
        from += req.nextUrl.search;
      }
      const redirectUrl = new URL(`/${locale ?? i18n.defaultLocale}/login`, req.url);
      redirectUrl.searchParams.set("from", from);
      return NextResponse.redirect(redirectUrl);
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;
        const isAuthPage = /^\/[a-zA-Z]{2,}\/(login|register)/.test(pathname);
        const hasCookie = hasSessionToken(req as NextRequest);

        if (pathname.startsWith("/api/auth")) {
          return true;
        }

        if (pathname.startsWith("/api/coze/") || pathname.startsWith("/api/webhooks/")) {
          return true;
        }

        if (isPublicRoute(pathname)) {
          return true;
        }

        if (isAuthPage) {
          return true;
        }

        if (pathname.startsWith("/admin/dashboard")) {
          if (env.ADMIN_EMAIL && token?.email) {
            const adminEmails = env.ADMIN_EMAIL.split(",");
            return adminEmails.includes(token.email);
          }
          return false;
        }

        if (pathname.startsWith("/api/trpc/")) {
          return !!token || hasCookie;
        }

        return !!token || hasCookie;
      },
    },
  },
);

export const config = {
  matcher: [
    "/((?!.*\\..*|_next).*)",
    "/",
    "/(api|trpc)(.*)",
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
};