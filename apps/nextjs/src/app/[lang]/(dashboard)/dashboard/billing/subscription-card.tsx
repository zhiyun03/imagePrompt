"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@saasfly/ui/card";

import { trpc } from "~/trpc/client";
import { SubscriptionForm } from "./subscription-form";

interface Subscription {
  plan: string | null;
  endsAt: Date | null;
}

interface SubscriptionCardProps {
  dict: Record<string, string>;
}

export function SubscriptionCard({ dict }: SubscriptionCardProps) {
  const subscription = trpc.auth.mySubscription.useQuery();

  function generateSubscriptionMessage(
    dict: Record<string, string>,
    subscription: Subscription,
  ): string {
    const content = String(dict.subscriptionInfo);
    if (subscription.plan && subscription.endsAt) {
      return content
        .replace("{plan}", subscription.plan)
        .replace("{date}", subscription.endsAt.toLocaleDateString());
    }
    return "";
  }

  if (subscription.isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Subscription</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading subscription information...</p>
        </CardContent>
      </Card>
    );
  }

  if (subscription.error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Subscription</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">Failed to load subscription information.</p>
        </CardContent>
      </Card>
    );
  }

  const content = generateSubscriptionMessage(dict, subscription.data || { plan: null, endsAt: null });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription</CardTitle>
      </CardHeader>
      <CardContent>
        {subscription.data && (subscription.data.plan || subscription.data.endsAt) ? (
          <p dangerouslySetInnerHTML={{ __html: content }} />
        ) : (
          <p>{dict.noSubscription}</p>
        )}
      </CardContent>
      <CardFooter>
        <SubscriptionForm hasSubscription={!!subscription.data?.plan} dict={dict} />
      </CardFooter>
    </Card>
  );
}