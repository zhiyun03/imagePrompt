import { NextResponse, type NextRequest } from "next/server";

import { env } from "~/env.mjs";

const handler = async (req: NextRequest) => {
  // 如果没有配置 Stripe，返回 404
  if (!env.STRIPE_WEBHOOK_SECRET || !env.STRIPE_API_KEY) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 404 });
  }

  const payload = await req.text();
  const signature = req.headers.get("Stripe-Signature")!;

  try {
    // 动态导入 Stripe 相关模块，避免构建时连接数据库
    const { handleEvent, stripe } = await import("@saasfly/stripe");
    const { Stripe } = await import("stripe");

    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      env.STRIPE_WEBHOOK_SECRET,
    ) as import("stripe").Stripe.DiscriminatedEvent;

    await handleEvent(event);

    console.log("✅ Handled Stripe Event", event.type);
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.log(`❌ Error when handling Stripe Event: ${message}`);
    return NextResponse.json({ error: message }, { status: 400 });
  }
};

export { handler as GET, handler as POST };
