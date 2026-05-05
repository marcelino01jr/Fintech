import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

// CockroachDB uses the PostgreSQL wire protocol
// Connection string format: postgresql://user:pass@host:26257/dbname?sslmode=verify-full
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production"
    ? { rejectUnauthorized: true }
    : { rejectUnauthorized: false },
});

export const db = drizzle(pool, { schema });
export * from "./schema";
