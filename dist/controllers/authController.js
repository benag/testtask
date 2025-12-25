"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const userService_1 = require("../services/userService");
const auth_1 = require("../utils/auth");
const userService = new userService_1.UserService();
class AuthController {
    async register(req, res) {
        try {
            const { email, password, preferred_language } = req.body;
            const existingUser = await userService.findUserByEmail(email);
            if (existingUser) {
                res.status(409).json({
                    success: false,
                    error: 'User with this email already exists'
                });
                return;
            }
            const user = await userService.createUser({
                email,
                password,
                preferred_language: preferred_language || 'en'
            });
            const token = (0, auth_1.generateToken)(user);
            res.status(201).json({
                success: true,
                data: { user, token },
                message: 'User registered successfully'
            });
        }
        catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
    async login(req, res) {
        try {
            const { email, password } = req.body;
            const user = await userService.findUserByEmail(email);
            if (!user) {
                res.status(401).json({
                    success: false,
                    error: 'Invalid email or password'
                });
                return;
            }
            const isValidPassword = await (0, auth_1.comparePassword)(password, user.password_hash);
            if (!isValidPassword) {
                res.status(401).json({
                    success: false,
                    error: 'Invalid email or password'
                });
                return;
            }
            const { password_hash, ...userWithoutPassword } = user;
            const token = (0, auth_1.generateToken)(userWithoutPassword);
            res.json({
                success: true,
                data: { user: userWithoutPassword, token },
                message: 'Login successful'
            });
        }
        catch (error) {
            console.error('Login error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
    async me(req, res) {
        try {
            const user = req.user;
            res.json({
                success: true,
                data: user
            });
        }
        catch (error) {
            console.error('Get user error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
    async updateLanguage(req, res) {
        try {
            const user = req.user;
            const { language } = req.body;
            await userService.updateUserLanguage(user.id, language);
            res.json({
                success: true,
                message: 'Language preference updated successfully'
            });
        }
        catch (error) {
            console.error('Update language error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=authController.js.map