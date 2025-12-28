import { Request, Response } from 'express';
import { UserService } from '../services/userService';
import { hashPassword, comparePassword, generateToken } from '../utils/auth';
import fs from 'fs/promises';
import path from 'path';
import { LoginRequest, RegisterRequest, ApiResponse, AuthResponse } from '../types';

const userService = new UserService();

export class AuthController {
  private async loadStaticTranslations(languageCode: string): Promise<Record<string, string>> {
    try {
      const isDev = process.env.NODE_ENV === 'development';
      const filePath = isDev 
        ? path.join(process.cwd(), 'client/src/locales', `${languageCode}.json`)
        : path.join(__dirname, '../../client/src/locales', `${languageCode}.json`);
      
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const translations = JSON.parse(fileContent);
      console.log(`🔄 Loaded ${Object.keys(translations).length} static translations for ${languageCode} on login`);
      return translations;
    } catch (error) {
      console.warn(`⚠️ Failed to load static translations for ${languageCode}:`, error);
      return {};
    }
  }
  async register(req: Request<{}, ApiResponse<AuthResponse>, RegisterRequest>, res: Response): Promise<void> {
    try {
      const { email, password, preferred_language } = req.body;

      // Check if user already exists
      const existingUser = await userService.findUserByEmail(email);
      if (existingUser) {
        res.status(409).json({
          success: false,
          error: 'User with this email already exists'
        });
        return;
      }

      // Create new user
      const user = await userService.createUser({ 
        email, 
        password, 
        preferred_language: preferred_language || 'en' 
      });
      const token = generateToken(user);

      res.status(201).json({
        success: true,
        data: { user, token },
        message: 'User registered successfully'
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async login(req: Request<{}, ApiResponse<AuthResponse>, LoginRequest>, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      // Find user by email
      const user = await userService.findUserByEmail(email);
      if (!user) {
        res.status(401).json({
          success: false,
          error: 'Invalid email or password'
        });
        return;
      }

      // Verify password
      const isValidPassword = await comparePassword(password, user.password_hash);
      if (!isValidPassword) {
        res.status(401).json({
          success: false,
          error: 'Invalid email or password'
        });
        return;
      }

      // Generate token
      const { password_hash, ...userWithoutPassword } = user;
      const token = generateToken(userWithoutPassword);

      // Load fresh static translations for user's preferred language
      const userLanguage = user.preferred_language || 'en';
      const staticTranslations = await this.loadStaticTranslations(userLanguage);

      res.json({
        success: true,
        data: { 
          user: userWithoutPassword, 
          token,
          staticTranslations: {
            [userLanguage]: staticTranslations
          }
        },
        message: 'Login successful'
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async me(req: Request, res: Response): Promise<void> {
    try {
      // User is attached by auth middleware
      const user = (req as any).user;
      
      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async updateLanguage(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      const { language } = req.body;

      await userService.updateUserLanguage(user.id, language);

      res.json({
        success: true,
        message: 'Language preference updated successfully'
      });
    } catch (error) {
      console.error('Update language error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
}
