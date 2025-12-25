import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Language, Translation } from '../types';
import { translationsAPI } from '../lib/api';

interface TranslationState {
  currentLanguage: string;
  languages: Language[];
  translations: Record<string, string>;
  isLoading: boolean;
  error: string | null;

  // Actions
  setLanguage: (languageCode: string) => void;
  loadLanguages: () => Promise<void>;
  loadTranslations: (languageCode?: string) => Promise<void>;
  getTranslation: (key: string, fallback?: string) => string;
  clearError: () => void;
}

// Static UI translations (can be in JSON files)
const staticTranslations: Record<string, Record<string, string>> = {
  en: {
    'nav.dashboard': 'Dashboard',
    'nav.tasks': 'Tasks',
    'nav.admin': 'Admin',
    'nav.logout': 'Logout',
    'nav.login': 'Login',
    'nav.register': 'Register',
    'button.save': 'Save',
    'button.cancel': 'Cancel',
    'button.delete': 'Delete',
    'button.edit': 'Edit',
    'button.create': 'Create',
    'button.submit': 'Submit',
    'form.title': 'Title',
    'form.description': 'Description',
    'form.email': 'Email',
    'form.password': 'Password',
    'form.confirmPassword': 'Confirm Password',
    'form.dueDate': 'Due Date',
    'page.login.title': 'Login to Task Manager',
    'page.register.title': 'Create Account',
    'page.tasks.title': 'My Tasks',
    'page.admin.title': 'Admin Panel',
    'language.switcher': 'Language',
  },
  he: {
    'nav.dashboard': 'לוח בקרה',
    'nav.tasks': 'משימות',
    'nav.admin': 'ניהול',
    'nav.logout': 'התנתק',
    'nav.login': 'התחבר',
    'nav.register': 'הרשם',
    'button.save': 'שמור',
    'button.cancel': 'בטל',
    'button.delete': 'מחק',
    'button.edit': 'ערוך',
    'button.create': 'צור',
    'button.submit': 'שלח',
    'form.title': 'כותרת',
    'form.description': 'תיאור',
    'form.email': 'אימייל',
    'form.password': 'סיסמה',
    'form.confirmPassword': 'אשר סיסמה',
    'form.dueDate': 'תאריך יעד',
    'page.login.title': 'התחבר למנהל המשימות',
    'page.register.title': 'צור חשבון',
    'page.tasks.title': 'המשימות שלי',
    'page.admin.title': 'פאנל ניהול',
    'language.switcher': 'שפה',
  },
  ru: {
    'nav.dashboard': 'Панель управления',
    'nav.tasks': 'Задачи',
    'nav.admin': 'Админ',
    'nav.logout': 'Выйти',
    'nav.login': 'Войти',
    'nav.register': 'Регистрация',
    'button.save': 'Сохранить',
    'button.cancel': 'Отмена',
    'button.delete': 'Удалить',
    'button.edit': 'Редактировать',
    'button.create': 'Создать',
    'button.submit': 'Отправить',
    'form.title': 'Заголовок',
    'form.description': 'Описание',
    'form.email': 'Email',
    'form.password': 'Пароль',
    'form.confirmPassword': 'Подтвердить пароль',
    'form.dueDate': 'Срок выполнения',
    'page.login.title': 'Войти в Task Manager',
    'page.register.title': 'Создать аккаунт',
    'page.tasks.title': 'Мои задачи',
    'page.admin.title': 'Панель администратора',
    'language.switcher': 'Язык',
  },
};

export const useTranslationStore = create<TranslationState>()(
  persist(
    (set, get) => ({
      currentLanguage: 'en',
      languages: [],
      translations: {},
      isLoading: false,
      error: null,

      setLanguage: (languageCode: string) => {
        set({ currentLanguage: languageCode });
        get().loadTranslations(languageCode);
      },

      loadLanguages: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await translationsAPI.getLanguages();
          if (response.success && response.data) {
            set({ languages: response.data, isLoading: false });
          } else {
            throw new Error(response.error || 'Failed to load languages');
          }
        } catch (error: any) {
          set({
            error: error.response?.data?.error || error.message || 'Failed to load languages',
            isLoading: false,
          });
        }
      },

      loadTranslations: async (languageCode?: string) => {
        const lang = languageCode || get().currentLanguage;
        set({ isLoading: true, error: null });
        
        try {
          const response = await translationsAPI.getTranslations(lang);
          if (response.success && response.data) {
            // Convert array of translations to key-value pairs
            const translationsMap: Record<string, string> = {};
            response.data.forEach((translation: Translation) => {
              if (translation.key) {
                translationsMap[translation.key.key_name] = translation.value;
              }
            });
            
            // Merge with static translations
            const staticLangTranslations = staticTranslations[lang] || {};
            const mergedTranslations = { ...staticLangTranslations, ...translationsMap };
            
            set({ 
              translations: mergedTranslations, 
              isLoading: false 
            });
          } else {
            // Fallback to static translations only
            const staticLangTranslations = staticTranslations[lang] || staticTranslations.en;
            set({ 
              translations: staticLangTranslations, 
              isLoading: false 
            });
          }
        } catch (error: any) {
          // Fallback to static translations on error
          const staticLangTranslations = staticTranslations[lang] || staticTranslations.en;
          set({
            translations: staticLangTranslations,
            error: error.response?.data?.error || error.message || 'Failed to load translations',
            isLoading: false,
          });
        }
      },

      getTranslation: (key: string, fallback?: string) => {
        const { translations, currentLanguage } = get();
        
        // Try current language translations
        if (translations[key]) {
          return translations[key];
        }
        
        // Try static translations for current language
        const staticLangTranslations = staticTranslations[currentLanguage];
        if (staticLangTranslations && staticLangTranslations[key]) {
          return staticLangTranslations[key];
        }
        
        // Try English as fallback
        const englishTranslations = staticTranslations.en;
        if (englishTranslations && englishTranslations[key]) {
          return englishTranslations[key];
        }
        
        // Return provided fallback or the key itself
        return fallback || key;
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'translation-storage',
      partialize: (state) => ({
        currentLanguage: state.currentLanguage,
      }),
    }
  )
);
