import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables first
dotenv.config();

import pool from '../config/database';

async function runMigrations(): Promise<void> {
  const migrationsDir = path.join(__dirname, '../../migrations');
  
  // Debug: Check environment variables
  console.log('🔍 Migration Environment check:');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
  console.log('DATABASE_URL preview:', process.env.DATABASE_URL?.substring(0, 50) + '...');
  
  // Use same fallback as database config
  const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:jhbsd73b@database-1.cn8k6a26wgvi.us-east-1.rds.amazonaws.com:5432/task_manager';
  
  console.log('Migration using DATABASE_URL:', DATABASE_URL.substring(0, 50) + '...');
  
  // Explicit check for DATABASE_URL
  if (!DATABASE_URL) {
    throw new Error('DATABASE_URL is required!');
  }
  
  if (DATABASE_URL.includes('127.0.0.1') || DATABASE_URL.includes('localhost')) {
    throw new Error('DATABASE_URL is pointing to localhost instead of RDS!');
  }
  
  try {
    // Create migrations table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Get list of migration files
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    console.log(`Found ${migrationFiles.length} migration files`);

    for (const file of migrationFiles) {
      // Check if migration has already been executed
      const result = await pool.query(
        'SELECT id FROM migrations WHERE filename = $1',
        [file]
      );

      if (result.rows.length > 0) {
        console.log(`⏭️  Skipping ${file} (already executed)`);
        continue;
      }

      console.log(`🔄 Running migration: ${file}`);

      // Read and execute migration
      const migrationPath = path.join(migrationsDir, file);
      const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        await client.query(migrationSQL);
        await client.query(
          'INSERT INTO migrations (filename) VALUES ($1)',
          [file]
        );
        await client.query('COMMIT');
        console.log(`✅ Completed migration: ${file}`);
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    }

    console.log('🎉 All migrations completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
  console.log('⏭️  Skipping migrations - database already set up');
  console.log('Migration process completed (skipped)');
  process.exit(0);
  
  // Commented out for Railway deployment since RDS is already set up
  // runMigrations()
  //   .then(() => {
  //     console.log('Migration process completed');
  //     process.exit(0);
  //   })
  //   .catch((error) => {
  //     console.error('Migration process failed:', error);
  //     process.exit(1);
  //   });
}

export { runMigrations };
