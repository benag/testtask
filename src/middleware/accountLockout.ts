import { Request, Response, NextFunction } from 'express';
import pool from '../config/database';

interface LoginAttempt {
  email: string;
  ip: string;
  success: boolean;
}

export class AccountLockoutService {
  private static readonly MAX_ATTEMPTS = 5;
  private static readonly LOCKOUT_DURATION = 30 * 60 * 1000; // 30 minutes

  static async recordLoginAttempt(attempt: LoginAttempt): Promise<void> {
    const { email, ip, success } = attempt;

    if (success) {
      // Reset failed attempts on successful login
      await pool.query(
        'UPDATE users SET failed_login_attempts = 0, locked_until = NULL WHERE email = $1',
        [email]
      );
    } else {
      // Increment failed attempts
      const result = await pool.query(
        `UPDATE users 
         SET failed_login_attempts = COALESCE(failed_login_attempts, 0) + 1,
             locked_until = CASE 
               WHEN COALESCE(failed_login_attempts, 0) + 1 >= $1 
               THEN NOW() + INTERVAL '${this.LOCKOUT_DURATION / 1000} seconds'
               ELSE locked_until 
             END
         WHERE email = $2 
         RETURNING failed_login_attempts, locked_until`,
        [this.MAX_ATTEMPTS, email]
      );

      if (result.rows.length > 0) {
        const { failed_login_attempts, locked_until } = result.rows[0];
        
        if (failed_login_attempts >= this.MAX_ATTEMPTS) {
          console.log(`Account locked for email: ${email} until ${locked_until}`);
        }
      }
    }
  }

  static async isAccountLocked(email: string): Promise<{ locked: boolean; lockedUntil?: Date }> {
    const result = await pool.query(
      'SELECT locked_until, failed_login_attempts FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return { locked: false };
    }

    const { locked_until, failed_login_attempts } = result.rows[0];

    if (!locked_until) {
      return { locked: false };
    }

    const now = new Date();
    const lockExpiry = new Date(locked_until);

    if (now > lockExpiry) {
      // Lock has expired, reset the account
      await pool.query(
        'UPDATE users SET failed_login_attempts = 0, locked_until = NULL WHERE email = $1',
        [email]
      );
      return { locked: false };
    }

    return { locked: true, lockedUntil: lockExpiry };
  }

  static async unlockAccount(email: string): Promise<void> {
    await pool.query(
      'UPDATE users SET failed_login_attempts = 0, locked_until = NULL WHERE email = $1',
      [email]
    );
  }
}

// Middleware to check account lockout
export const checkAccountLockout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;

    if (!email) {
      return next();
    }

    const lockStatus = await AccountLockoutService.isAccountLocked(email);

    if (lockStatus.locked) {
      return res.status(423).json({
        success: false,
        error: `Account is temporarily locked due to too many failed login attempts. Please try again after ${lockStatus.lockedUntil?.toLocaleString()}.`,
        lockedUntil: lockStatus.lockedUntil
      });
    }

    next();
  } catch (error) {
    console.error('Account lockout check error:', error);
    next(); // Continue on error to not break login flow
  }
};
