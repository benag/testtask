import { Pool } from 'pg';

// Only load dotenv in development
if (process.env.NODE_ENV !== 'production') {
  import('dotenv').then(dotenv => dotenv.config());
}

// Debug: Log database configuration
console.log('🔍 Database Config Debug:');
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('DATABASE_URL preview:', process.env.DATABASE_URL?.substring(0, 50) + '...');
console.log('NODE_ENV:', process.env.NODE_ENV);

// Temporary hardcoded DATABASE_URL for Railway deployment testing
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:jhbsd73b@database-1.cn8k6a26wgvi.us-east-1.rds.amazonaws.com:5432/task_manager';

// Ensure we have a DATABASE_URL
if (!DATABASE_URL) {
  throw new Error('DATABASE_URL is required');
}

console.log('Using DATABASE_URL:', DATABASE_URL.substring(0, 50) + '...');

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Accept self-signed certificates from RDS
  },
  max: 10, // Reduce max connections
  idleTimeoutMillis: 60000, // 60 seconds
  connectionTimeoutMillis: 10000, // 10 seconds
  // Add connection retry and keepalive
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
});

// Test the connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  // Don't exit process, let the application handle retries
});

// Helper function for database queries with retry logic
export async function queryWithRetry(text: string, params?: any[], retries = 3): Promise<any> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const result = await pool.query(text, params);
      return result;
    } catch (error: any) {
      console.error(`Database query attempt ${attempt} failed:`, error.message);
      
      if (attempt === retries) {
        throw error;
      }
      
      // Wait before retry (exponential backoff)
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
      console.log(`Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

export default pool;
