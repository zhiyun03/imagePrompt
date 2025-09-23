import { z } from "zod";

import { createTRPCRouter, procedure, protectedProcedure } from "../trpc";

export const helloRouter = createTRPCRouter({
  // 公开的健康检查端点
  health: procedure.query(() => {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      message: "Service is healthy",
    };
  }),

  // 需要认证的问候端点
  hello: protectedProcedure
    .input(
      z.object({
        text: z.string(),
      }),
    )
    .query((opts: { input: { text: string } }) => {
      return {
        greeting: `hello ${opts.input.text}`,
      };
    }),
});
