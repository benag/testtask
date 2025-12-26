describe('Configuration Tests', () => {
  describe('Environment Configuration', () => {
    it('should have proper test environment setup', () => {
      expect(process.env.NODE_ENV).toBe('test');
    });

    it('should handle missing environment variables gracefully', () => {
      const originalEnv = process.env.JWT_SECRET;
      delete process.env.JWT_SECRET;

      // Should have a fallback or default
      const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
      expect(jwtSecret).toBeDefined();
      expect(typeof jwtSecret).toBe('string');

      // Restore original value
      if (originalEnv) {
        process.env.JWT_SECRET = originalEnv;
      }
    });

    it('should validate database URL format', () => {
      const validDatabaseUrls = [
        'postgresql://user:pass@localhost:5432/dbname',
        'postgresql://user@localhost/dbname',
        'postgres://user:pass@host:5432/db'
      ];

      const invalidDatabaseUrls = [
        'mysql://user:pass@localhost:3306/dbname',
        'invalid-url',
        'http://localhost:5432/db'
      ];

      const postgresRegex = /^postgres(ql)?:\/\//;

      validDatabaseUrls.forEach(url => {
        expect(postgresRegex.test(url)).toBe(true);
      });

      invalidDatabaseUrls.forEach(url => {
        expect(postgresRegex.test(url)).toBe(false);
      });
    });
  });

  describe('Application Constants', () => {
    it('should define task statuses', () => {
      const TASK_STATUSES = ['todo', 'in_progress', 'done'];
      
      expect(TASK_STATUSES).toHaveLength(3);
      expect(TASK_STATUSES).toContain('todo');
      expect(TASK_STATUSES).toContain('in_progress');
      expect(TASK_STATUSES).toContain('done');
    });

    it('should define task priorities', () => {
      const TASK_PRIORITIES = ['low', 'medium', 'high'];
      
      expect(TASK_PRIORITIES).toHaveLength(3);
      expect(TASK_PRIORITIES).toContain('low');
      expect(TASK_PRIORITIES).toContain('medium');
      expect(TASK_PRIORITIES).toContain('high');
    });

    it('should define user roles', () => {
      const USER_ROLES = ['user', 'admin'];
      
      expect(USER_ROLES).toHaveLength(2);
      expect(USER_ROLES).toContain('user');
      expect(USER_ROLES).toContain('admin');
    });

    it('should define supported languages', () => {
      const SUPPORTED_LANGUAGES = [
        { code: 'en', name: 'English', rtl: false },
        { code: 'he', name: 'Hebrew', rtl: true },
        { code: 'ru', name: 'Russian', rtl: false }
      ];
      
      expect(SUPPORTED_LANGUAGES).toHaveLength(3);
      
      const codes = SUPPORTED_LANGUAGES.map(lang => lang.code);
      expect(codes).toContain('en');
      expect(codes).toContain('he');
      expect(codes).toContain('ru');
      
      // Check RTL property
      const hebrew = SUPPORTED_LANGUAGES.find(lang => lang.code === 'he');
      expect(hebrew?.rtl).toBe(true);
      
      const english = SUPPORTED_LANGUAGES.find(lang => lang.code === 'en');
      expect(english?.rtl).toBe(false);
    });
  });

  describe('Validation Rules', () => {
    it('should validate email format', () => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      const validEmails = [
        'user@example.com',
        'test.email@domain.co.uk',
        'admin@test-site.org',
        'user123@example123.com'
      ];
      
      const invalidEmails = [
        'invalid-email',
        '@domain.com',
        'user@',
        'user..name@domain.com',
        'user@domain',
        'user name@domain.com'
      ];
      
      validEmails.forEach(email => {
        expect(emailRegex.test(email)).toBe(true);
      });
      
      invalidEmails.forEach(email => {
        expect(emailRegex.test(email)).toBe(false);
      });
    });

    it('should validate password requirements', () => {
      const validatePassword = (password: string) => {
        const errors = [];
        
        if (!password) {
          errors.push('Password is required');
        } else {
          if (password.length < 6) {
            errors.push('Password must be at least 6 characters');
          }
          if (password.length > 100) {
            errors.push('Password must be less than 100 characters');
          }
        }
        
        return errors;
      };
      
      expect(validatePassword('123456')).toHaveLength(0);
      expect(validatePassword('password123')).toHaveLength(0);
      expect(validatePassword('123')).toContain('Password must be at least 6 characters');
      expect(validatePassword('')).toContain('Password is required');
      expect(validatePassword('a'.repeat(101))).toContain('Password must be less than 100 characters');
    });

    it('should validate task data', () => {
      const validateTask = (task: any) => {
        const errors = [];
        
        if (!task.title || task.title.trim() === '') {
          errors.push('Title is required');
        }
        
        if (task.title && task.title.length > 200) {
          errors.push('Title must be less than 200 characters');
        }
        
        if (task.status && !['todo', 'in_progress', 'done'].includes(task.status)) {
          errors.push('Invalid status');
        }
        
        if (task.priority && !['low', 'medium', 'high'].includes(task.priority)) {
          errors.push('Invalid priority');
        }
        
        return errors;
      };
      
      // Valid task
      expect(validateTask({
        title: 'Test Task',
        status: 'todo',
        priority: 'medium'
      })).toHaveLength(0);
      
      // Invalid task
      expect(validateTask({})).toContain('Title is required');
      expect(validateTask({ title: '', status: 'invalid' })).toContain('Title is required');
      expect(validateTask({ title: 'Test', status: 'invalid' })).toContain('Invalid status');
      expect(validateTask({ title: 'Test', priority: 'urgent' })).toContain('Invalid priority');
    });
  });

  describe('Utility Functions', () => {
    it('should format dates consistently', () => {
      const formatDate = (date: Date) => {
        return date.toISOString();
      };
      
      const testDate = new Date('2024-01-01T12:00:00Z');
      const formatted = formatDate(testDate);
      
      expect(formatted).toBe('2024-01-01T12:00:00.000Z');
      expect(typeof formatted).toBe('string');
    });

    it('should sanitize user input', () => {
      const sanitizeInput = (input: string) => {
        return input.trim().replace(/[<>]/g, '');
      };
      
      expect(sanitizeInput('  hello world  ')).toBe('hello world');
      expect(sanitizeInput('<script>alert("xss")</script>')).toBe('scriptalert("xss")/script');
      expect(sanitizeInput('normal text')).toBe('normal text');
    });

    it('should generate consistent slugs', () => {
      const generateSlug = (text: string) => {
        return text
          .toLowerCase()
          .trim()
          .replace(/[^\w\s-]/g, '')
          .replace(/[\s_-]+/g, '-')
          .replace(/^-+|-+$/g, '');
      };
      
      expect(generateSlug('Hello World')).toBe('hello-world');
      expect(generateSlug('Test Task #1')).toBe('test-task-1');
      expect(generateSlug('  Multiple   Spaces  ')).toBe('multiple-spaces');
      expect(generateSlug('Special!@#$%Characters')).toBe('specialcharacters');
    });
  });
});
