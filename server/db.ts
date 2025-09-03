import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";
import 'dotenv/config';
import { eq } from 'drizzle-orm';

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });

export function tenantDb(subdomainId: string) {
  return {
    select: (table: any) =>
      db.select().from(table).where(eq(table.subdomainId, subdomainId)),

    insert: (table: any, values: any) =>
      db.insert(table).values({ ...values, subdomainId }),

    update: (table: any, values: any) =>
      db.update(table).set(values).where(eq(table.subdomainId, subdomainId)),

    delete: (table: any) =>
      db.delete(table).where(eq(table.subdomainId, subdomainId)),
  };
}