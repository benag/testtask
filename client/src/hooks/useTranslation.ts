import { useTranslationStore } from '../stores/translationStore';

export const useTranslation = () => {
  const { 
    getTranslation, 
    currentLanguage, 
    setLanguage, 
    languages, 
    loadLanguages, 
    loadTranslations,
    refreshTranslations,
    lastUpdated
  } = useTranslationStore();

  const t = (key: string, fallback?: string) => getTranslation(key, fallback);

  return {
    t,
    currentLanguage,
    setLanguage,
    languages,
    loadLanguages,
    loadTranslations,
    refreshTranslations,
    lastUpdated // Include this to trigger re-renders
  };
};
