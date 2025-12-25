"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const database_1 = __importDefault(require("../config/database"));
const auth_1 = require("../utils/auth");
class UserService {
    async createUser(userData) {
        const { email, password, preferred_language = 'en' } = userData;
        const password_hash = await (0, auth_1.hashPassword)(password);
        const query = `
      INSERT INTO users (email, password_hash, preferred_language)
      VALUES ($1, $2, $3)
      RETURNING id, email, role, preferred_language, created_at, updated_at
    `;
        const result = await database_1.default.query(query, [email, password_hash, preferred_language]);
        return result.rows[0];
    }
    async findUserByEmail(email) {
        const query = 'SELECT * FROM users WHERE email = $1';
        const result = await database_1.default.query(query, [email]);
        return result.rows[0] || null;
    }
    async findUserById(id) {
        const query = `
      SELECT id, email, role, preferred_language, created_at, updated_at 
      FROM users WHERE id = $1
    `;
        const result = await database_1.default.query(query, [id]);
        return result.rows[0] || null;
    }
    async updateUserLanguage(userId, language) {
        const query = 'UPDATE users SET preferred_language = $1 WHERE id = $2';
        await database_1.default.query(query, [language, userId]);
    }
    async getUserStats() {
        const query = `
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN role = 'admin' THEN 1 END) as total_admins
      FROM users
    `;
        const result = await database_1.default.query(query);
        return result.rows[0];
    }
}
exports.UserService = UserService;
//# sourceMappingURL=userService.js.map