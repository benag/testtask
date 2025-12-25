import en from './en.json';
import he from './he.json';
import ru from './ru.json';

export const staticTranslations: Record<string, Record<string, string>> = {
  en,
  he,
  ru,
};

export const supportedLanguages = ['en', 'he', 'ru'] as const;
export type SupportedLanguage = typeof supportedLanguages[number];

export default staticTranslations;
