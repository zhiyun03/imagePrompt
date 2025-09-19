import { match as matchLocale } from "@formatjs/intl-localematcher";
import { withAuth } from "next-auth/middleware";
import { NextRequest, NextResponse } from 'next/server';
import Negotiator from "negotiator";

import { i18n } from "~/config/i18n-config";
import { env } from "@saasfly/auth/env.mjs";

const noNeedProcessRoute = [".*\\.png", ".*\\.jpg", ".*\\.opengraph-image.png"];

const noRedirectRoute = ["/api(.*)", "/trpc(.*)", "/admin"];

const isPublicRoute = (pathname: string) => {
  const publicRoutes = [
    new RegExp("/(\\w{2}/)?login(.*)"),
    new RegExp("/(\\w{2}/)?register(.*)"),
    new RegExp("/(\\w{2}/)?terms(.*)"),
    new RegExp("/(\\w{2}/)?privacy(.*)"),
    new RegExp("/(\\w{2}/)?docs(.*)"),
    new RegExp("/(\\w{2}/)?blog(.*)"),
    new RegExp("/(\\w{2}/)?pricing(.*)"),
    new RegExp("^/\\w{2}$"), // root with locale
  ];
  return publicRoutes.some(route => route.test(pathname));
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
    if (isNoNeedProcess(req)) {
      return null;
    }

    const isWebhooksRoute = req.nextUrl.pathname.startsWith("/api/webhooks/");
    if (isWebhooksRoute) {
      return NextResponse.next();
    }

    const pathname = req.nextUrl.pathname;
    const pathnameIsMissingLocale = i18n.locales.every(
      (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
    );

    if (!isNoRedirect(req) && pathnameIsMissingLocale) {
      const locale = getLocale(req);
      return NextResponse.redirect(
        new URL(
          `/${locale}${pathname.startsWith("/") ? "" : "/"}${pathname}`,
          req.url,
        ),
      );
    }

    if (isPublicRoute(pathname)) {
      return NextResponse.next();
    }

    const token = req.nextauth.token;
    const isAuth = !!token;
    let isAdmin = false;

    if (env.ADMIN_EMAIL && token?.email) {
      const adminEmails = env.ADMIN_EMAIL.split(",");
      isAdmin = adminEmails.includes(token.email);
    }

    const isAuthPage = /^\/[a-zA-Z]{2,}\/(login|register)/.test(req.nextUrl.pathname);
    const isAuthRoute = req.nextUrl.pathname.startsWith("/api/trpc/");
    const locale = getLocale(req);

    if (isAuthRoute && isAuth) {
      return NextResponse.next();
    }

    if (req.nextUrl.pathname.startsWith("/admin/dashboard")) {
      if (!isAuth || !isAdmin) {
        return NextResponse.redirect(new URL(`/admin/login`, req.url));
      }
      return NextResponse.next();
    }

    if (isAuthPage) {
      if (isAuth) {
        return NextResponse.redirect(new URL(`/${locale}/dashboard`, req.url));
      }
      return NextResponse.next();
    }

    if (!isAuth) {
      let from = req.nextUrl.pathname;
      if (req.nextUrl.search) {
        from += req.nextUrl.search;
      }
      return NextResponse.redirect(
        new URL(`/${locale}/login?from=${encodeURIComponent(from)}`, req.url),
      );
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;

        // Allow public routes
        if (isPublicRoute(pathname)) {
          return true;
        }

        // Admin routes
        if (pathname.startsWith("/admin/dashboard")) {
          if (env.ADMIN_EMAIL && token?.email) {
            const adminEmails = env.ADMIN_EMAIL.split(",");
            return adminEmails.includes(token.email);
          }
          return false;
        }

        // Auth routes
        if (pathname.startsWith("/api/trpc/")) {
          return !!token;
        }

        // Protected routes
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    "/((?!.*\\..*|_next).*)",
    "/",
    "/(api|trpc)(.*)",
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)"
  ],
};