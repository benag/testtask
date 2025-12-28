import { useTranslationStore } from '../stores/translationStore';
import { useEffect, useState } from 'react';

export const useTranslation = () => {
  const { 
    getTranslation, 
    currentLanguage, 
    setLanguage, 
    languages, 
    loadLanguages, 
    loadTranslations,
    refreshTranslations,
    lastUpdated,
    translations
  } = useTranslationStore();
  
  // Force re-render when translations change
  const [renderKey, setRenderKey] = useState(0);
  
  useEffect(() => {
    setRenderKey(prev => prev + 1);
  }, [lastUpdated, translations]);

  const t = (key: string, fallback?: string) => {
    // Force fresh lookup every time
    const value = getTranslation(key, fallback);
    console.log(`🔄 Translation lookup: ${key} = ${value} (render: ${renderKey})`);
    return value;
  };

  return {
    t,
    currentLanguage,
    setLanguage,
    languages,
    loadLanguages,
    loadTranslations,
    refreshTranslations,
    lastUpdated,
    renderKey // Force re-renders
  };
};
