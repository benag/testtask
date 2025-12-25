const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('amazonaws.com') ? { rejectUnauthorized: false } : false,
});

async function setupTranslations() {
  try {
    console.log('🌐 Setting up basic translations...');
    
    const client = await pool.connect();
    
    // Create languages
    const languages = [
      { code: 'en', name: 'English', is_active: true },
      { code: 'he', name: 'Hebrew', is_active: true },
      { code: 'ru', name: 'Russian', is_active: true }
    ];
    
    console.log('📝 Creating languages...');
    for (const lang of languages) {
      await client.query(`
        INSERT INTO languages (id, code, name, is_active, created_at)
        VALUES (gen_random_uuid(), $1, $2, $3, NOW())
        ON CONFLICT (code) DO NOTHING
      `, [lang.code, lang.name, lang.is_active]);
      console.log(`  ✓ ${lang.name} (${lang.code})`);
    }
    
    // Create translation keys
    const translationKeys = [
      { key: 'app.title', description: 'Application title', category: 'general' },
      { key: 'nav.dashboard', description: 'Dashboard navigation', category: 'navigation' },
      { key: 'nav.tasks', description: 'Tasks navigation', category: 'navigation' },
      { key: 'nav.admin', description: 'Admin navigation', category: 'navigation' },
      { key: 'auth.login', description: 'Login button', category: 'auth' },
      { key: 'auth.logout', description: 'Logout button', category: 'auth' },
      { key: 'auth.email', description: 'Email field', category: 'auth' },
      { key: 'auth.password', description: 'Password field', category: 'auth' },
      { key: 'tasks.create', description: 'Create task button', category: 'tasks' },
      { key: 'tasks.title', description: 'Task title field', category: 'tasks' },
      { key: 'tasks.status', description: 'Task status', category: 'tasks' },
      { key: 'common.save', description: 'Save button', category: 'common' },
      { key: 'common.cancel', description: 'Cancel button', category: 'common' },
      { key: 'common.delete', description: 'Delete button', category: 'common' }
    ];
    
    console.log('🔑 Creating translation keys...');
    for (const key of translationKeys) {
      await client.query(`
        INSERT INTO translation_keys (id, key_name, description, category, created_at, updated_at)
        VALUES (gen_random_uuid(), $1, $2, $3, NOW(), NOW())
        ON CONFLICT (key_name) DO NOTHING
      `, [key.key, key.description, key.category]);
      console.log(`  ✓ ${key.key}`);
    }
    
    // Create translations
    const translations = {
      'en': {
        'app.title': 'Task Manager',
        'nav.dashboard': 'Dashboard',
        'nav.tasks': 'Tasks',
        'nav.admin': 'Admin',
        'auth.login': 'Login',
        'auth.logout': 'Logout',
        'auth.email': 'Email',
        'auth.password': 'Password',
        'tasks.create': 'Create Task',
        'tasks.title': 'Title',
        'tasks.status': 'Status',
        'common.save': 'Save',
        'common.cancel': 'Cancel',
        'common.delete': 'Delete'
      },
      'he': {
        'app.title': 'מנהל משימות',
        'nav.dashboard': 'לוח בקרה',
        'nav.tasks': 'משימות',
        'nav.admin': 'ניהול',
        'auth.login': 'התחברות',
        'auth.logout': 'התנתקות',
        'auth.email': 'אימייל',
        'auth.password': 'סיסמה',
        'tasks.create': 'צור משימה',
        'tasks.title': 'כותרת',
        'tasks.status': 'סטטוס',
        'common.save': 'שמור',
        'common.cancel': 'בטל',
        'common.delete': 'מחק'
      },
      'ru': {
        'app.title': 'Менеджер задач',
        'nav.dashboard': 'Панель управления',
        'nav.tasks': 'Задачи',
        'nav.admin': 'Администрирование',
        'auth.login': 'Войти',
        'auth.logout': 'Выйти',
        'auth.email': 'Электронная почта',
        'auth.password': 'Пароль',
        'tasks.create': 'Создать задачу',
        'tasks.title': 'Заголовок',
        'tasks.status': 'Статус',
        'common.save': 'Сохранить',
        'common.cancel': 'Отмена',
        'common.delete': 'Удалить'
      }
    };
    
    console.log('🌍 Creating translations...');
    for (const [langCode, langTranslations] of Object.entries(translations)) {
      console.log(`  📖 ${langCode.toUpperCase()}:`);
      
      for (const [keyName, value] of Object.entries(langTranslations)) {
        await client.query(`
          INSERT INTO translations (id, translation_key_id, language_id, value, created_at, updated_at)
          SELECT gen_random_uuid(), tk.id, l.id, $3, NOW(), NOW()
          FROM translation_keys tk, languages l
          WHERE tk.key_name = $1 AND l.code = $2
          ON CONFLICT (translation_key_id, language_id) DO NOTHING
        `, [keyName, langCode, value]);
        console.log(`    ✓ ${keyName}: ${value}`);
      }
    }
    
    client.release();
    console.log('\n✅ Translations setup completed!');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  } finally {
    await pool.end();
  }
}

setupTranslations();
