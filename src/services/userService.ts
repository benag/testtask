import pool, { queryWithRetry } from '../config/database';
import { User, RegisterRequest } from '../types';
import { hashPassword } from '../utils/auth';

export class UserService {
  async createUser(userData: RegisterRequest): Promise<Omit<User, 'password_hash'>> {
    const { email, password, preferred_language = 'en' } = userData;
    const password_hash = await hashPassword(password);

    const query = `
      INSERT INTO users (email, password_hash, preferred_language)
      VALUES ($1, $2, $3)
      RETURNING id, email, role, preferred_language, created_at, updated_at
    `;

    const result = await pool.query(query, [email, password_hash, preferred_language]);
    return result.rows[0] as Omit<User, 'password_hash'>;
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await queryWithRetry(query, [email]);
    return result.rows[0] || null;
  }

  async findUserById(id: string): Promise<Omit<User, 'password_hash'> | null> {
    const query = `
      SELECT id, email, role, preferred_language, created_at, updated_at 
      FROM users WHERE id = $1
    `;
    const result = await queryWithRetry(query, [id]);
    return result.rows[0] || null;
  }

  async updateUserLanguage(userId: string, language: string): Promise<void> {
    const query = 'UPDATE users SET preferred_language = $1 WHERE id = $2';
    await pool.query(query, [language, userId]);
  }

  async getUserStats(): Promise<{ total_users: number; total_admins: number }> {
    const query = `
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN role = 'admin' THEN 1 END) as total_admins
      FROM users
    `;
    const result = await pool.query(query);
    return result.rows[0];
  }
}
