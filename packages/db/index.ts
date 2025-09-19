import { createKysely } from "@vercel/postgres-kysely";

import type { DB } from "./prisma/types";

export { jsonArrayFrom, jsonObjectFrom } from "kysely/helpers/postgres";

export * from "./prisma/types";
export * from "./prisma/enums";

// Create a mock database for development when POSTGRES_URL is not available
const createMockDB = () => ({
  selectFrom: () => ({
    select: () => Promise.resolve([]),
    where: () => ({ executeTakeFirst: () => Promise.resolve(null) }),
    execute: () => Promise.resolve([])
  }),
  insertInto: () => ({
    values: () => ({ execute: () => Promise.resolve({ insertId: 1 }) })
  }),
  updateTable: () => ({
    set: () => ({ where: () => ({ execute: () => Promise.resolve({ numUpdatedRows: 1 }) }) })
  }),
  deleteFrom: () => ({
    where: () => ({ execute: () => Promise.resolve({ numDeletedRows: 1 }) })
  })
});

export const db = process.env.POSTGRES_URL
  ? createKysely<DB>()
  : (createMockDB() as any);
