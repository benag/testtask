"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const database_1 = __importStar(require("../config/database"));
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
        const result = await (0, database_1.queryWithRetry)(query, [email]);
        return result.rows[0] || null;
    }
    async findUserById(id) {
        const query = `
      SELECT id, email, role, preferred_language, created_at, updated_at 
      FROM users WHERE id = $1
    `;
        const result = await (0, database_1.queryWithRetry)(query, [id]);
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