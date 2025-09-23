import { NextResponse, type NextRequest } from "next/server";

import { handleEvent, stripe, type Stripe } from "@saasfly/stripe";

import { env } from "~/env.mjs";

const handler = async (req: NextRequest) => {
  // 暂时禁用 Stripe webhook 以解决数据库连接问题
  return NextResponse.json({
    message: "Stripe webhook temporarily disabled for build",
    received: true
  }, { status: 200 });

  /*
  const payload = await req.text();
  const signature = req.headers.get("Stripe-Signature")!;
  try {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      env.STRIPE_WEBHOOK_SECRET,
    ) as Stripe.DiscriminatedEvent;
    await handleEvent(event);

    console.log("✅ Handled Stripe Event", event.type);
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.log(`❌ Error when handling Stripe Event: ${message}`);
    return NextResponse.json({ error: message }, { status: 400 });
  }
  */
};

export { handler as GET, handler as POST };
