import type {NextRequest} from "next/server";
import {fetchRequestHandler} from "@trpc/server/adapters/fetch";

import {createTRPCContext} from "@saasfly/api";
import {edgeRouter} from "@saasfly/api/edge";

// 暂时禁用 edge runtime 以解决 crypto 模块兼容性问题
// export const runtime = "edge";

const createContext = async (req: NextRequest) => {
    try {
        return await createTRPCContext({
            headers: req.headers,
            req: req,
        });
    } catch (error) {
        console.error("Failed to create tRPC context:", error);
        // 返回简化的上下文以避免构建失败
        return {
            headers: req.headers,
            req: req,
            userId: null,
            session: null,
        };
    }
};

const handler = (req: NextRequest) => {
    // 暂时禁用 edge 路由以解决构建问题
    return new Response("Edge tRPC temporarily disabled for build", {
        status: 503,
        headers: {
            'Content-Type': 'text/plain',
        },
    });

    /*
    try {
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
    } catch (error) {
        console.error("Failed to initialize tRPC handler:", error);
        throw error;
    }
    */
};

export {handler as GET, handler as POST};
