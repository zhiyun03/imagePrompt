import { unstable_noStore as noStore } from "next/cache";
import { z } from "zod";

import { getCurrentUser } from "@saasfly/auth";
import { db, SubscriptionPlan } from "@saasfly/db";

import { createTRPCRouter, protectedProcedure } from "../trpc";

const updateUserNameSchema = z.object({
  name: z.string(),
  userId: z.string(),
});
const insertCustomerSchema = z.object({
  userId: z.string(),
});
z.object({
  userId: z.string(),
});
export const customerRouter = createTRPCRouter({
  updateUserName: protectedProcedure
    .input(updateUserNameSchema)
    .mutation(async ({ input }) => {
      // 暂时禁用数据库查询以解决构建问题
      return { success: false, reason: "Database disabled for build" };

      /*
      const { userId } = input;
      const user = await getCurrentUser();
      if (!user || userId !== user.id) {
        return { success: false, reason: "no auth" };
      }
      await db
        .updateTable("User")
        .set({
          name: input.name,
        })
        .where("id", "=", userId)
        .execute();
      return { success: true, reason: "" };
      */
    }),

  insertCustomer: protectedProcedure
    .input(insertCustomerSchema)
    .mutation(async ({ input }) => {
      // 暂时禁用数据库查询以解决构建问题
      return;

      /*
      const { userId } = input;
      await db
        .insertInto("Customer")
        .values({
          authUserId: userId,
          plan: SubscriptionPlan.FREE,
        })
        .executeTakeFirst();
      */
    }),

  queryCustomer: protectedProcedure
    .input(insertCustomerSchema)
    .query(async ({ input }) => {
      // 暂时禁用数据库查询以解决构建问题
      return null;

      /*
      noStore();
      const { userId } = input;
      console.log("userId:", userId);
      try {
        console.log(
          "result:",
          await db
            .selectFrom("Customer")
            .where("authUserId", "=", userId)
            .executeTakeFirst(),
        );
      } catch (e) {
        console.error("e:", e);
      }

      return await db
        .selectFrom("Customer")
        .where("authUserId", "=", userId)
        .executeTakeFirst();
      */
    }),
});
