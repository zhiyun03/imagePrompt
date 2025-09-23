import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@saasfly/ui/card";

import { DashboardShell } from "~/components/shell";
import type { Locale } from "~/config/i18n-config";
import { getDictionary } from "~/lib/get-dictionary";
import { SubscriptionCard } from "./subscription-card";

export const metadata = {
  title: "Billing",
  description: "Manage billing and your subscription plan.",
};


export default async function BillingPage({
  params: { lang },
}: {
  params: {
    lang: Locale;
  };
}) {
  const dict = await getDictionary(lang);
  return (
    <DashboardShell
      title={dict.business.billing.billing}
      description={dict.business.billing.content}
      className="space-y-4"
    >
      <SubscriptionCard dict={dict.business.billing} />

      <UsageCard />
    </DashboardShell>
  );
}


function UsageCard() {
  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Usage</CardTitle>
      </CardHeader>
      <CardContent>None</CardContent>
    </Card>
  );
}
