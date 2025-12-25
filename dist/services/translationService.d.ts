import { Language, TranslationKey, Translation, TranslationWithDetails, CreateTranslationKeyRequest, UpdateTranslationRequest } from '../types';
export declare class TranslationService {
    getLanguages(): Promise<Language[]>;
    createLanguage(code: string, name: string, is_active?: boolean): Promise<Language>;
    updateLanguage(id: string, name: string, is_active: boolean): Promise<Language | null>;
    getTranslationKeys(): Promise<TranslationKey[]>;
    createTranslationKey(keyData: CreateTranslationKeyRequest): Promise<TranslationKey>;
    updateTranslationKey(id: string, keyData: Partial<CreateTranslationKeyRequest>): Promise<TranslationKey | null>;
    deleteTranslationKey(id: string): Promise<boolean>;
    getTranslationsWithDetails(): Promise<TranslationWithDetails[]>;
    getTranslationsByLanguage(languageCode: string): Promise<Record<string, string>>;
    updateTranslation(translationKeyId: string, languageCode: string, translationData: UpdateTranslationRequest): Promise<Translation | null>;
    deleteTranslation(translationKeyId: string, languageCode: string): Promise<boolean>;
    exportTranslations(): Promise<Record<string, Record<string, string>>>;
    importTranslations(importData: Record<string, Record<string, string>>): Promise<{
        imported: number;
        errors: string[];
    }>;
    updateTranslationById(id: string, translationData: {
        value: string;
    }): Promise<Translation | null>;
    deleteTranslationById(id: string): Promise<boolean>;
}
//# sourceMappingURL=translationService.d.ts.map