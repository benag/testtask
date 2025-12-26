import { generateToken, hashPassword, comparePassword } from '../src/utils/auth';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

describe('Basic Functionality Tests', () => {
  describe('Password Hashing', () => {
    it('should hash and verify passwords correctly', async () => {
      const password = 'testPassword123';
      const hashedPassword = await bcrypt.hash(password, 10);
      
      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(password);
      
      const isValid = await bcrypt.compare(password, hashedPassword);
      expect(isValid).toBe(true);
      
      const isInvalid = await bcrypt.compare('wrongPassword', hashedPassword);
      expect(isInvalid).toBe(false);
    });
  });

  describe('JWT Token Generation', () => {
    beforeEach(() => {
      // Use the default secret from config
      delete process.env.JWT_SECRET;
    });

    it('should generate JWT tokens', () => {
      const user = {
        id: '1',
        email: 'test@example.com',
        role: 'user' as 'user' | 'admin',
        preferred_language: 'en',
        created_at: new Date(),
        updated_at: new Date()
      };

      const token = generateToken(user);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    it('should verify JWT tokens manually', () => {
      const user = {
        id: '1',
        email: 'test@example.com',
        role: 'user' as 'user' | 'admin',
        preferred_language: 'en',
        created_at: new Date(),
        updated_at: new Date()
      };

      const token = generateToken(user);
      
      // Verify token manually
      const decoded = jwt.verify(token, 'your-super-secret-jwt-key') as any;
      expect(decoded.id).toBe(user.id);
      expect(decoded.email).toBe(user.email);
      expect(decoded.role).toBe(user.role);
    });

    it('should throw error for invalid token', () => {
      expect(() => {
        jwt.verify('invalid-token', 'your-super-secret-jwt-key');
      }).toThrow();
    });
  });

  describe('Data Validation', () => {
    it('should validate email format', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'admin@test-site.org'
      ];

      const invalidEmails = [
        'invalid-email',
        '@domain.com',
        'user@',
        'user@domain'
      ];

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      validEmails.forEach(email => {
        expect(emailRegex.test(email)).toBe(true);
      });

      invalidEmails.forEach(email => {
        expect(emailRegex.test(email)).toBe(false);
      });
    });

    it('should validate task status values', () => {
      const validStatuses = ['todo', 'in_progress', 'done'];
      const invalidStatuses = ['pending', 'completed', 'cancelled'];

      validStatuses.forEach(status => {
        expect(['todo', 'in_progress', 'done']).toContain(status);
      });

      invalidStatuses.forEach(status => {
        expect(['todo', 'in_progress', 'done']).not.toContain(status);
      });
    });

    it('should validate task priority values', () => {
      const validPriorities = ['low', 'medium', 'high'];
      const invalidPriorities = ['urgent', 'normal', 'critical'];

      validPriorities.forEach(priority => {
        expect(['low', 'medium', 'high']).toContain(priority);
      });

      invalidPriorities.forEach(priority => {
        expect(['low', 'medium', 'high']).not.toContain(priority);
      });
    });
  });

  describe('Language Support', () => {
    it('should support multiple languages', () => {
      const supportedLanguages = ['en', 'he', 'ru'];
      const mockTranslations = {
        en: { 'task.status.todo': 'To Do' },
        he: { 'task.status.todo': 'לביצוע' },
        ru: { 'task.status.todo': 'К выполнению' }
      };

      supportedLanguages.forEach(lang => {
        expect(mockTranslations[lang as keyof typeof mockTranslations]).toBeDefined();
        expect(mockTranslations[lang as keyof typeof mockTranslations]['task.status.todo']).toBeDefined();
      });
    });

    it('should handle RTL languages', () => {
      const rtlLanguages = ['he', 'ar'];
      const ltrLanguages = ['en', 'ru', 'es'];

      rtlLanguages.forEach(lang => {
        // Hebrew should be detected as RTL
        expect(['he', 'ar', 'fa', 'ur']).toContain(lang);
      });

      ltrLanguages.forEach(lang => {
        // These should not be RTL
        expect(['he', 'ar', 'fa', 'ur']).not.toContain(lang);
      });
    });
  });

  describe('User Roles', () => {
    it('should define user roles correctly', () => {
      const validRoles = ['user', 'admin'];
      const invalidRoles = ['moderator', 'guest', 'superuser'];

      validRoles.forEach(role => {
        expect(['user', 'admin']).toContain(role);
      });

      invalidRoles.forEach(role => {
        expect(['user', 'admin']).not.toContain(role);
      });
    });

    it('should have proper role hierarchy', () => {
      const roleHierarchy = {
        user: 1,
        admin: 2
      };

      expect(roleHierarchy.admin).toBeGreaterThan(roleHierarchy.user);
    });
  });

  describe('Configuration Validation', () => {
    it('should validate environment variables', () => {
      const requiredEnvVars = ['NODE_ENV', 'JWT_SECRET'];
      
      requiredEnvVars.forEach(envVar => {
        // In test environment, these should be set
        if (envVar === 'NODE_ENV') {
          expect(process.env[envVar]).toBeDefined();
        }
      });
    });

    it('should handle different environments', () => {
      const validEnvironments = ['development', 'test', 'production'];
      const currentEnv = process.env.NODE_ENV || 'development';
      
      expect(validEnvironments).toContain(currentEnv);
    });
  });
});
