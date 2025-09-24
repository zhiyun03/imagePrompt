"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { cn } from "@saasfly/ui";
import { buttonVariants } from "@saasfly/ui/button";
import * as Icons from "@saasfly/ui/icons";
import { Input } from "@saasfly/ui/input";
import { Label } from "@saasfly/ui/label";
import { toast } from "@saasfly/ui/use-toast";

type Dictionary = Record<string, string>;

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {
  lang: string;
  dict: Dictionary;
  disabled?: boolean;
}

const userAuthSchema = z.object({
  email: z.string().email(),
});

type FormData = z.infer<typeof userAuthSchema>;

export function UserAuthForm({
  className,
  lang,
  dict,
  disabled,
  ...props
}: UserAuthFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(userAuthSchema),
  });
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [isGoogleLoading, setIsGoogleLoading] = React.useState<boolean>(false);
  const searchParams = useSearchParams();

  async function onSubmit(data: FormData) {
    setIsLoading(true);

    const signInResult = await signIn("email", {
      email: data.email.toLowerCase(),
      redirect: false,
      callbackUrl: searchParams?.get("from") ?? `/${lang}/dashboard`,
    }).catch((error) => {
      console.error("Error during sign in:", error);
    });

    setIsLoading(false);

    if (!signInResult?.ok) {
      return toast({
        title: "Something went wrong.",
        description: "Your sign in request failed. Please try again.",
        variant: "destructive",
      });
    }

    return toast({
      title: "Check your email",
      description: "We sent you a login link. Be sure to check your spam too.",
    });
  }

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-2">
          <div className="grid gap-1">
            <Label className="sr-only" htmlFor="email">
              Email
            </Label>
            <Input
              id="email"
              placeholder="name@example.com"
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={isLoading || isGoogleLoading || disabled}
              {...register("email")}
            />
            {errors?.email && (
              <p className="px-1 text-xs text-red-600">
                {errors.email.message}
              </p>
            )}
          </div>
          <button className={cn(buttonVariants())} disabled={isLoading}>
            {isLoading && (
              <Icons.Spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            {dict.signin_email}
            {/* Sign In with Email */}
          </button>
        </div>
      </form>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            {dict.signin_others}
            {/* Or continue with */}
          </span>
        </div>
      </div>
      <button
        type="button"
        className={cn(buttonVariants({ variant: "outline" }))}
        onClick={async (e) => {
          e.preventDefault();
          e.stopPropagation();

          console.log("🔴 Google button clicked!");
          console.log("🔴 signIn function available:", typeof signIn);

          setIsGoogleLoading(true);

          try {
            console.log("🔴 Starting Google sign in...");

            // 使用正确的callbackUrl进行Google登录 - 重定向到主页
            const callbackUrl = searchParams?.get("from") ?? `/${lang}`;
            console.log("🔴 CallbackUrl will be:", callbackUrl);

            // 使用redirect: false来获取结果
            const result = await signIn("google", {
              callbackUrl: callbackUrl,
              redirect: false,
            });

            console.log("🔴 Google sign in result:", result);

            if (result?.error) {
              console.error("🔴 Google sign in error:", result.error);
              throw new Error(result.error);
            }

            if (result?.url) {
              console.log("🔴 Redirecting to:", result.url);
              window.location.href = result.url;
            } else {
              console.log("🔴 No redirect URL, assuming success");
              // 如果没有URL但也没有错误，可能是session已经更新
              setTimeout(() => {
                window.location.href = callbackUrl;
              }, 1000);
            }

          } catch (error) {
            console.error("🔴 Catch block error:", error);
            toast({
              title: "Google登录失败",
              description: error.message || "请稍后重试",
              variant: "destructive",
            });
          } finally {
            console.log("🔴 Finally block executed");
            setIsGoogleLoading(false);
          }
        }}
        disabled={isLoading || isGoogleLoading || disabled}
      >
        {isGoogleLoading ? (
          <Icons.Spinner className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Icons.Google className="mr-2 h-4 w-4" />
        )}{" "}
        Google
      </button>
    </div>
  );
}
