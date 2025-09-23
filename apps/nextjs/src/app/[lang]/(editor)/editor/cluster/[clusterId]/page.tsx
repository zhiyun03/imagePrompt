import { notFound, redirect } from "next/navigation";
import type { User } from "@saasfly/auth";

import { authOptions, getCurrentUser } from "@saasfly/auth";
import { db } from "@saasfly/db";

import { ClusterConfig } from "~/components/k8s/cluster-config";
import type { Cluster } from "~/types/k8s";

async function getClusterForUser(clusterId: Cluster["id"], userId: User["id"]) {
  // 暂时禁用数据库查询以解决构建问题
  return null;

  /*
  return await db
    .selectFrom("K8sClusterConfig")
    .selectAll()
    .where("id", "=", Number(clusterId))
    .where("authUserId", "=", userId)
    .executeTakeFirst();
  */
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
  const user = await getCurrentUser();
  if (!user) {
    redirect(authOptions?.pages?.signIn ?? "/login-clerk");
  }

  // console.log("EditorClusterPage user:" + user.id + "params:", params);
  const cluster = await getClusterForUser(params.clusterId, user.id);

  if (!cluster) {
    // 暂时禁用以解决构建问题
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold">Cluster Editor</h1>
        <p className="text-muted-foreground">
          Cluster functionality temporarily disabled for build. Please set up database connection to enable cluster features.
        </p>
      </div>
    );
    // notFound();
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
