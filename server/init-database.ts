
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import { seedDatabase } from './seed-database';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://bookloop:bookloop@213.210.21.124:5432/bokloopdb",
  ssl: false
});

const db = drizzle(pool);

async function initDatabase() {
  try {
    console.log("Initializing database...");
    
    // Run migrations if they exist
    try {
      await migrate(db, { migrationsFolder: './migrations' });
      console.log("Migrations completed successfully");
    } catch (error) {
      console.log("No migrations found or migration failed, continuing...");
    }
    
    // Seed the database
    await seedDatabase();
    
    console.log("Database initialization completed successfully!");
    
  } catch (error) {
    console.error("Database initialization failed:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  initDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { initDatabase };
