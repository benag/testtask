import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Language, Translation } from '../types';
import { translationsAPI } from '../lib/api';
import { staticTranslations } from '../locales';

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

// Static UI translations are now loaded from JSON files

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
