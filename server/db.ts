import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Only configure neon websocket for production
if (process.env.NODE_ENV === 'production') {
  neonConfig.webSocketConstructor = ws;
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  // For local development, disable SSL
  ssl: process.env.NODE_ENV === 'production'
});
export const db = drizzle({ client: pool, schema });
