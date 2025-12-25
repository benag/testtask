"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
async function generateHashes() {
    const adminPassword = 'admin123';
    const userPassword = 'test123';
    const adminHash = await bcrypt_1.default.hash(adminPassword, 10);
    const userHash = await bcrypt_1.default.hash(userPassword, 10);
    console.log('Admin password hash (admin123):', adminHash);
    console.log('User password hash (test123):', userHash);
}
generateHashes().catch(console.error);
//# sourceMappingURL=generateHashes.js.map