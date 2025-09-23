import { notFound, redirect } from "next/navigation";
import type { User } from "@saasfly/auth";

import { authOptions, getCurrentUser } from "@saasfly/auth";
import { db } from "@saasfly/db";

import { ClusterConfig } from "~/components/k8s/cluster-config";
import type { Cluster } from "~/types/k8s";

async function getClusterForUser(clusterId: Cluster["id"], userId: User["id"]) {
  try {
    return await db
      .selectFrom("K8sClusterConfig")
      .selectAll()
      .where("id", "=", Number(clusterId))
      .where("authUserId", "=", userId)
      .executeTakeFirst();
  } catch (error) {
    // 如果数据库不可用，返回 null
    console.error("Database connection error:", error);
    return null;
  }
}

interface EditorClusterProps {
  params: {
    clusterId: number;
    lang: string;
  };
}

export default async function EditorClusterPage({
  params,
}: EditorClusterProps) {
  let user = null;
  try {
    user = await getCurrentUser();
  } catch (error) {
    console.error("Failed to get current user:", error);
  }

  if (!user) {
    redirect(authOptions?.pages?.signIn ?? "/login-clerk");
  }

  // console.log("EditorClusterPage user:" + user.id + "params:", params);
  const cluster = await getClusterForUser(params.clusterId, user.id);

  if (!cluster) {
    notFound();
  }
  return (
    <ClusterConfig
      cluster={{
        id: cluster.id,
        name: cluster.name,
        location: cluster.location,
      }}
      params={{ lang: params.lang }}
    />
  );
}
