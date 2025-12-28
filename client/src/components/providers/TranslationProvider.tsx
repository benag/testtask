import React, { useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';

interface TranslationProviderProps {
  children: React.ReactNode;
}

export const TranslationProvider: React.FC<TranslationProviderProps> = ({ children }) => {
  const { lastUpdated, currentLanguage } = useTranslation();

  // This component will re-render whenever translations change
  // forcing all child components to re-render with new translations
  useEffect(() => {
    console.log('🔄 Translation provider re-rendering due to language change:', currentLanguage);
  }, [lastUpdated, currentLanguage]);

  return <>{children}</>;
};
