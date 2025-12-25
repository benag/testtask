"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAccountLockout = exports.AccountLockoutService = void 0;
const database_1 = __importDefault(require("../config/database"));
class AccountLockoutService {
    static MAX_ATTEMPTS = 5;
    static LOCKOUT_DURATION = 30 * 60 * 1000;
    static async recordLoginAttempt(attempt) {
        const { email, ip, success } = attempt;
        if (success) {
            await database_1.default.query('UPDATE users SET failed_login_attempts = 0, locked_until = NULL WHERE email = $1', [email]);
        }
        else {
            const result = await database_1.default.query(`UPDATE users 
         SET failed_login_attempts = COALESCE(failed_login_attempts, 0) + 1,
             locked_until = CASE 
               WHEN COALESCE(failed_login_attempts, 0) + 1 >= $1 
               THEN NOW() + INTERVAL '${this.LOCKOUT_DURATION / 1000} seconds'
               ELSE locked_until 
             END
         WHERE email = $2 
         RETURNING failed_login_attempts, locked_until`, [this.MAX_ATTEMPTS, email]);
            if (result.rows.length > 0) {
                const { failed_login_attempts, locked_until } = result.rows[0];
                if (failed_login_attempts >= this.MAX_ATTEMPTS) {
                    console.log(`Account locked for email: ${email} until ${locked_until}`);
                }
            }
        }
    }
    static async isAccountLocked(email) {
        const result = await database_1.default.query('SELECT locked_until, failed_login_attempts FROM users WHERE email = $1', [email]);
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
            await database_1.default.query('UPDATE users SET failed_login_attempts = 0, locked_until = NULL WHERE email = $1', [email]);
            return { locked: false };
        }
        return { locked: true, lockedUntil: lockExpiry };
    }
    static async unlockAccount(email) {
        await database_1.default.query('UPDATE users SET failed_login_attempts = 0, locked_until = NULL WHERE email = $1', [email]);
    }
}
exports.AccountLockoutService = AccountLockoutService;
const checkAccountLockout = async (req, res, next) => {
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
    }
    catch (error) {
        console.error('Account lockout check error:', error);
        next();
    }
};
exports.checkAccountLockout = checkAccountLockout;
//# sourceMappingURL=accountLockout.js.map