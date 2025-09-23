import {
  httpBatchLink,
  type HTTPBatchLinkOptions,
  type HTTPHeaders,
  type TRPCLink,
} from "@trpc/client";

import type { AppRouter } from "@saasfly/api";

import { env } from "~/env.mjs";

export { transformer } from "@saasfly/api/transformer";
const getBaseUrl = () => {
  if (typeof window !== "undefined") return "";
  const vc = env.NEXT_PUBLIC_APP_URL;
  if (vc) return vc;
  return `http://localhost:3000`;
};

export const endingLink = (opts?: {
  headers?: HTTPHeaders | (() => HTTPHeaders);
}) =>
  ((runtime) => {
    const sharedOpts = {
      headers: opts?.headers,
    } satisfies Partial<HTTPBatchLinkOptions>;

    return httpBatchLink({
      ...sharedOpts,
      url: `${getBaseUrl()}/api/trpc/edge`,
    })(runtime);
  }) satisfies TRPCLink<AppRouter>;
