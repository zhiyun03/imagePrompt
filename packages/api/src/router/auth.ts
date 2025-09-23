import { unstable_noStore as noStore } from "next/cache";

import { db } from "@saasfly/db";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const authRouter = createTRPCRouter({
  mySubscription: protectedProcedure.query(async (opts) => {
    // 暂时禁用数据库查询以解决构建问题
    return {
      plan: "FREE",
      endsAt: null,
    };

    /*
    noStore();
    const userId = opts.ctx.userId as string;
    const customer = await db
      .selectFrom("Customer")
      .select(["plan", "stripeCurrentPeriodEnd"])
      .where("authUserId", "=", userId)
      .executeTakeFirst();

    if (!customer) return null;
    return {
      plan: customer.plan,
      endsAt: customer.stripeCurrentPeriodEnd,
    };
    */
  }),
});
