import React, { useEffect, useState } from 'react';
import { Globe } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

export const LanguageSwitcher: React.FC = () => {
  const { currentLanguage, setLanguage, languages, loadLanguages, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    loadLanguages();
  }, [loadLanguages]);

  const handleLanguageChange = (languageCode: string) => {
    setLanguage(languageCode);
    setIsOpen(false);
  };

  const currentLang = languages.find(lang => lang.code === currentLanguage);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 rounded-md transition-colors"
        aria-label={t('language.switcher')}
      >
        <Globe className="w-4 h-4" />
        <span className="uppercase font-medium">
          {currentLang?.code || currentLanguage}
        </span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-20">
            <div className="py-1">
              {languages.map((language) => (
                <button
                  key={language.id}
                  onClick={() => handleLanguageChange(language.code)}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                    language.code === currentLanguage
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{language.name}</span>
                    <span className="text-xs text-gray-500 uppercase">
                      {language.code}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
