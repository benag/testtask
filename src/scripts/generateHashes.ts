import bcrypt from 'bcrypt';

async function generateHashes(): Promise<void> {
  const adminPassword = 'admin123';
  const userPassword = 'test123';

  const adminHash = await bcrypt.hash(adminPassword, 10);
  const userHash = await bcrypt.hash(userPassword, 10);

  console.log('Admin password hash (admin123):', adminHash);
  console.log('User password hash (test123):', userHash);
}

generateHashes().catch(console.error);
