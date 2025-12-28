import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Language } from '../types';
import { translationsAPI } from '../lib/api';
import { staticTranslations } from '../locales';

interface TranslationState {
  currentLanguage: string;
  languages: Language[];
  translations: Record<string, string>;
  isLoading: boolean;
  error: string | null;
  lastUpdated: number; // Add timestamp to force re-renders

  // Actions
  setLanguage: (languageCode: string) => void;
  loadLanguages: () => Promise<void>;
  loadTranslations: (languageCode?: string) => Promise<void>;
  refreshTranslations: () => Promise<void>; // Add refresh function
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
      lastUpdated: Date.now(),

      setLanguage: (languageCode: string) => {
        set({ currentLanguage: languageCode, lastUpdated: Date.now() });
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
          // ALWAYS load static translations from API (never use bundled)
          let staticLangTranslations = {};
          console.log(`🔍 Attempting to load static translations from API for ${lang}`);
          try {
            const token = localStorage.getItem('token');
            console.log(`🔑 Using token: ${token ? 'Present' : 'Missing'}`);
            
            const staticResponse = await fetch(`/api/static-translations/${lang}?t=${Date.now()}`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
              },
            });
            
            console.log(`🌐 Static API response status: ${staticResponse.status}`);
            
            if (staticResponse.ok) {
              const staticData = await staticResponse.json();
              console.log(`📄 Static API response:`, staticData);
              
              if (staticData.success) {
                staticLangTranslations = staticData.data.translations;
                console.log(`✅ Loaded ${Object.keys(staticLangTranslations).length} static translations from API for ${lang}`);
                console.log(`🔍 Sample translations:`, Object.keys(staticLangTranslations).slice(0, 5));
                console.log(`🎯 nav.tasks value from API:`, (staticLangTranslations as Record<string, string>)['nav.tasks']);
              } else {
                console.warn(`⚠️ Static API returned success=false:`, staticData);
                // Still try bundled as last resort
                staticLangTranslations = staticTranslations[lang] || {};
              }
            } else {
              const errorText = await staticResponse.text();
              console.warn(`⚠️ Static API failed with status ${staticResponse.status}:`, errorText);
              // Still try bundled as last resort
              staticLangTranslations = staticTranslations[lang] || {};
            }
          } catch (staticError) {
            console.warn('❌ Failed to load static translations from API:', staticError);
            // Last resort: use bundled static translations
            staticLangTranslations = staticTranslations[lang] || {};
            console.log(`🔄 Using bundled fallback: ${Object.keys(staticLangTranslations).length} translations`);
            console.log(`🔄 Bundled nav.tasks value:`, (staticLangTranslations as Record<string, string>)['nav.tasks']);
          }
          
          // Use only static translations (no database translations for UI text)
          console.log(`🔄 Using static translations only for ${lang}:`, {
            'nav.tasks': (staticLangTranslations as Record<string, string>)['nav.tasks'],
            'nav.dashboard': (staticLangTranslations as Record<string, string>)['nav.dashboard'],
            'total_keys': Object.keys(staticLangTranslations).length
          });
          
          set({ 
            translations: staticLangTranslations, 
            isLoading: false,
            lastUpdated: Date.now()
          });
          
          // Force all components to re-render by triggering a state change
          setTimeout(() => {
            set({ lastUpdated: Date.now() });
          }, 100);
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

      refreshTranslations: async () => {
        const { currentLanguage } = get();
        console.log('🔄 Refreshing translations for language:', currentLanguage);
        
        // Force reload translations from API and rebuild the app
        await get().loadTranslations(currentLanguage);
        
        // Force a complete page reload to ensure all components get new translations
        console.log('🔄 Force reloading page to apply translation changes...');
        setTimeout(() => {
          window.location.reload();
        }, 500);
        
        // Force a complete re-render by updating timestamp
        set({ lastUpdated: Date.now() });
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
