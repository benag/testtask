const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('amazonaws.com') ? { rejectUnauthorized: false } : false,
});

async function testDatabaseConnection() {
  try {
    console.log('🔗 Testing database connection...');
    
    const client = await pool.connect();
    console.log('✅ Connected to PostgreSQL database');
    
    // Test basic query
    const result = await client.query('SELECT NOW() as current_time');
    console.log(`⏰ Database time: ${result.rows[0].current_time}`);
    
    client.release();
    return true;
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

async function checkDatabaseSchema() {
  try {
    console.log('\n📋 Checking database schema...');
    
    const client = await pool.connect();
    
    // Check tables
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('📊 Existing tables:');
    tables.rows.forEach(table => {
      console.log(`  ✓ ${table.table_name}`);
    });
    
    // Check users
    if (tables.rows.some(t => t.table_name === 'users')) {
      const userCount = await client.query('SELECT COUNT(*) FROM users');
      console.log(`\n👥 Users in database: ${userCount.rows[0].count}`);
      
      if (parseInt(userCount.rows[0].count) > 0) {
        const users = await client.query('SELECT email, role, created_at FROM users ORDER BY created_at');
        console.log('📝 User accounts:');
        users.rows.forEach(user => {
          console.log(`  ✓ ${user.email} (${user.role}) - Created: ${user.created_at.toISOString().split('T')[0]}`);
        });
      }
    }
    
    client.release();
    return true;
    
  } catch (error) {
    console.error('❌ Schema check failed:', error.message);
    return false;
  }
}

async function runDatabaseTests() {
  console.log('🚀 Starting database tests...');
  
  const connected = await testDatabaseConnection();
  if (connected) {
    await checkDatabaseSchema();
  }
  
  console.log('\n✨ Database tests completed!');
  await pool.end();
}

runDatabaseTests();
