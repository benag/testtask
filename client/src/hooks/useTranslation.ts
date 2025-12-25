import { useTranslationStore } from '../stores/translationStore';

export const useTranslation = () => {
  const { getTranslation, currentLanguage, setLanguage, languages, loadLanguages, loadTranslations } = useTranslationStore();

  const t = (key: string, fallback?: string) => getTranslation(key, fallback);

  return {
    t,
    currentLanguage,
    setLanguage,
    languages,
    loadLanguages,
    loadTranslations,
  };
};
