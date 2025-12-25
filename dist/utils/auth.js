"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = exports.comparePassword = exports.hashPassword = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const hashPassword = async (password) => {
    const saltRounds = 10;
    return bcrypt_1.default.hash(password, saltRounds);
};
exports.hashPassword = hashPassword;
const comparePassword = async (password, hash) => {
    return bcrypt_1.default.compare(password, hash);
};
exports.comparePassword = comparePassword;
const generateToken = (user) => {
    return jsonwebtoken_1.default.sign({
        id: user.id,
        email: user.email,
        role: user.role,
        preferred_language: user.preferred_language,
    }, config_1.config.jwt.secret, { expiresIn: config_1.config.jwt.expiresIn });
};
exports.generateToken = generateToken;
//# sourceMappingURL=auth.js.map