import type {NextRequest} from "next/server";
import {fetchRequestHandler} from "@trpc/server/adapters/fetch";

import {createTRPCContext} from "@saasfly/api";

// export const runtime = "edge";
const createContext = async (req: NextRequest) => {
    return createTRPCContext({
        headers: req.headers,
    });
};

const handler = async (req: NextRequest) => {
    // 动态加载路由，避免构建时连接数据库
    const { edgeRouter } = await import("@saasfly/api/edge");

    return fetchRequestHandler({
        endpoint: "/api/trpc/edge",
        router: edgeRouter,
        req: req,
        createContext: () => createContext(req),
        onError: ({error, path}) => {
            console.log("Error in tRPC handler (edge) on path", path);
            console.error(error);
        },
    });
};

export {handler as GET, handler as POST};
