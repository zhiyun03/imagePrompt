import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";
import type { GeneratedAlways } from "kysely";

interface Database {
  User: {
    id: GeneratedAlways<string>;
    name: string | null;
    email: string;
    emailVerified: Date | null;
    image: string | null;
  };
  Account: {
    id: GeneratedAlways<string>;
    userId: string;
    type: string;
    provider: string;
    providerAccountId: string;
    refresh_token: string | null;
    access_token: string | null;
    expires_at: number | null;
    token_type: string | null;
    scope: string | null;
    id_token: string | null;
    session_state: string | null;
  };
  Session: {
    id: GeneratedAlways<string>;
    userId: string;
    sessionToken: string;
    expires: Date;
  };
  VerificationToken: {
    identifier: string;
    token: string;
    expires: Date;
  };
}

// 从环境变量获取数据库连接
const connectionString = process.env.POSTGRES_URL;
if (!connectionString) {
  throw new Error("❌ POSTGRES_URL environment variable is required. Please configure your database connection.");
}

// 创建数据库连接
const dialect = new PostgresDialect({
  pool: new Pool({
    connectionString: connectionString || "postgresql://localhost:5432/defaultdb",
    ssl: connectionString?.includes('localhost') ? false : { rejectUnauthorized: false }
  })
});

export const db = new Kysely<Database>({
  dialect,
});

// 为了与 @auth/kysely-adapter 兼容，重新导出数据库
// 这里我们使用类型断言来解决类型不匹配的问题
export const adapterDb = db as any;
