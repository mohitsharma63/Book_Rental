
import * as schema from "@shared/schema";
import { Pool } from 'pg';
import { drizzle } from "drizzle-orm/node-postgres";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: false // Disable SSL for local development
});

export const db = drizzle(pool, { schema });
