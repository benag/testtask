const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('amazonaws.com') ? { rejectUnauthorized: false } : false,
});

async function createUser(email, password, role = 'user', language = 'en') {
  try {
    const client = await pool.connect();
    
    // Check if user already exists
    const existing = await client.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      console.log(`⚠️  User ${email} already exists`);
      client.release();
      return existing.rows[0];
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const result = await client.query(`
      INSERT INTO users (id, email, password_hash, role, preferred_language, created_at, updated_at)
      VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW(), NOW())
      RETURNING id, email, role, preferred_language
    `, [email, hashedPassword, role, language]);
    
    console.log(`✅ Created ${role} user: ${email}`);
    
    client.release();
    return result.rows[0];
    
  } catch (error) {
    console.error(`❌ Failed to create user ${email}:`, error.message);
    return null;
  }
}

async function createTestUsers() {
  console.log('👥 Creating test users...');
  
  const users = [
    { email: 'admin@test.com', password: 'admin123', role: 'admin' },
    { email: 'user@test.com', password: 'user123', role: 'user' },
    { email: 'demo@test.com', password: 'demo123', role: 'user' },
  ];
  
  const createdUsers = [];
  
  for (const userData of users) {
    const user = await createUser(userData.email, userData.password, userData.role);
    if (user) {
      createdUsers.push({ ...user, password: userData.password });
    }
  }
  
  console.log('\n📋 Test user credentials:');
  createdUsers.forEach(user => {
    console.log(`  📧 ${user.email}`);
    console.log(`  🔑 Password: ${user.password || '[existing]'}`);
    console.log(`  👤 Role: ${user.role}`);
    console.log('  ---');
  });
  
  await pool.end();
  console.log('\n✨ User creation completed!');
}

// Allow running with command line arguments
const args = process.argv.slice(2);
if (args.length >= 2) {
  const [email, password, role] = args;
  createUser(email, password, role || 'user').then(() => pool.end());
} else {
  createTestUsers();
}
