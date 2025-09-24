import React from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { cn } from "@saasfly/ui";
import { buttonVariants } from "@saasfly/ui/button";
import * as Icons from "@saasfly/ui/icons";

import { UserAuthForm } from "~/components/user-auth-form";
import type { Locale } from "~/config/i18n-config";
import { getDictionary } from "~/lib/get-dictionary";

export const metadata: Metadata = {
  title: "ImagePrompt Login",
  description: "Login to your ImagePrompt account",
};

export default async function LoginPage({
  params: { lang },
}: {
  params: {
    lang: Locale;
  };
}) {
  const dict = await getDictionary(lang);
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      {/* Left: Form */}
      <div className="relative flex items-center justify-center p-6 lg:p-10">
        <Link
          href={`/${lang}`}
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "absolute left-4 top-4 md:left-8 md:top-8",
          )}
        >
          <>
            <Icons.ChevronLeft className="mr-2 h-4 w-4" />
            {dict.login.back}
          </>
        </Link>

        <div className="mx-auto flex w-full max-w-sm flex-col justify-center space-y-6">
          <div className="flex flex-col space-y-3">
            <div className="flex items-center gap-2">
              <Image
                src="/logo.svg"
                width="40"
                height="40"
                alt="ImagePrompt Logo"
                priority
                unoptimized
              />
              <span className="text-xl font-bold">Image Prompt</span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {dict.login.welcome_back}
            </h1>
            <p className="text-sm text-muted-foreground">
              {dict.login.signin_title}
            </p>
          </div>

          <UserAuthForm lang={lang} dict={dict.login} />
        </div>
      </div>

      {/* Right: Welcome Panel */}
      <div className="hidden lg:flex items-center justify-center bg-gradient-to-br from-fuchsia-600 via-purple-600 to-indigo-600">
        <div className="mx-auto w-full max-w-xl px-10 text-white">
          <h2 className="text-3xl font-bold leading-tight md:text-4xl">
            {lang === "zh" ? "欢迎来到" : "Welcome to"}
          </h2>
          <h3 className="mt-2 bg-gradient-to-r from-yellow-200 via-pink-200 to-purple-200 bg-clip-text text-3xl font-extrabold text-transparent md:text-5xl">
            Image Prompt
          </h3>
          <p className="mt-4 text-white/80 leading-relaxed">
            {lang === "zh"
              ? "登录以访问控制台并管理你的应用"
              : "Sign in to access your dashboard and manage your applications"}
          </p>

          <div className="mt-10 grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <Icons.Rocket className="h-5 w-5" />
                <div className="text-sm font-medium">
                  {lang === "zh" ? "快速可靠" : "Fast & Reliable"}
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <Icons.ShieldCheck className="h-5 w-5" />
                <div className="text-sm font-medium">
                  {lang === "zh" ? "安全" : "Secure"}
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <Icons.Laptop className="h-5 w-5" />
                <div className="text-sm font-medium">
                  {lang === "zh" ? "开发者友好" : "Developer Friendly"}
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <Icons.Cloud className="h-5 w-5" />
                <div className="text-sm font-medium">
                  {lang === "zh" ? "全球扩展" : "Global Scale"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
