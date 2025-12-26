import OpenAI from 'openai';
import { config } from '../config';

export class AITranslationService {
  private openai: OpenAI;

  constructor() {
    console.log('🔍 OpenAI Config Debug:');
    console.log('- OPENAI_API_KEY exists:', !!process.env.OPENAI_API_KEY);
    console.log('- OPENAI_API_KEY length:', process.env.OPENAI_API_KEY?.length || 0);
    console.log('- config.openai.apiKey exists:', !!config.openai.apiKey);
    console.log('- config.openai.apiKey length:', config.openai.apiKey?.length || 0);
    
    if (!config.openai.apiKey || config.openai.apiKey.trim() === '' || config.openai.apiKey === 'your-openai-api-key-here') {
      console.error('❌ OpenAI API key is missing or invalid');
      console.error('- Expected: A valid OpenAI API key starting with "sk-"');
      console.error('- Received:', config.openai.apiKey ? `"${config.openai.apiKey.substring(0, 10)}..."` : 'undefined');
      throw new Error('OpenAI API key is required for AI translation service. Please set OPENAI_API_KEY environment variable.');
    }
    
    console.log('✅ OpenAI API key loaded successfully');
    
    this.openai = new OpenAI({
      apiKey: config.openai.apiKey,
    });
  }

  async generateTranslation(
    key: string,
    sourceText: string,
    sourceLanguage: string,
    targetLanguage: string,
    context?: string
  ): Promise<string> {
    // Extract meaningful text from key if sourceText is just the key
    const extractedText = this.extractMeaningfulText(key, sourceText);
    
    return this.generateSingleTranslation(
      key,
      extractedText,
      sourceLanguage,
      targetLanguage,
      context
    );
  }

  private async generateSingleTranslation(
    key: string,
    sourceText: string,
    sourceLanguage: string,
    targetLanguage: string,
    context?: string
  ): Promise<string> {
    try {
      const languageNames = {
        'en': 'English',
        'he': 'Hebrew',
        'ru': 'Russian',
        'es': 'Spanish',
        'fr': 'French',
        'de': 'German',
        'ar': 'Arabic'
      };

      const sourceLangName = languageNames[sourceLanguage as keyof typeof languageNames] || sourceLanguage;
      const targetLangName = languageNames[targetLanguage as keyof typeof languageNames] || targetLanguage;

      const prompt = this.buildTranslationPrompt(
        key,
        sourceText,
        sourceLangName,
        targetLangName,
        context
      );

      const response = await this.openai.chat.completions.create({
        model: config.openai.model,
        messages: [
          {
            role: 'system',
            content: 'You are a professional translator specializing in software localization. Provide accurate, contextually appropriate translations that maintain the original meaning and tone.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 200,
        temperature: 0.3, // Lower temperature for more consistent translations
      });

      const translation = response.choices[0]?.message?.content?.trim();
      
      if (!translation) {
        throw new Error('No translation received from OpenAI');
      }

      return translation;
    } catch (error) {
      console.error('AI Translation Error:', error);
      throw new Error(`Failed to generate translation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateMultipleTranslations(
    translations: Array<{
      key: string;
      sourceText: string;
      sourceLanguage: string;
      targetLanguage: string;
      context?: string;
    }>
  ): Promise<Array<{ key: string; translation: string; error?: string }>> {
    const results = [];

    for (const item of translations) {
      try {
        const translation = await this.generateTranslation(
          item.key,
          item.sourceText,
          item.sourceLanguage,
          item.targetLanguage,
          item.context
        );
        results.push({ key: item.key, translation });
      } catch (error) {
        results.push({ 
          key: item.key, 
          translation: '', 
          error: error instanceof Error ? error.message : 'Translation failed' 
        });
      }
    }

    return results;
  }

  private buildTranslationPrompt(
    key: string,
    sourceText: string,
    sourceLangName: string,
    targetLangName: string,
    context?: string
  ): string {
    let prompt = `Translate the following ${sourceLangName} text to ${targetLangName}:\n\n`;
    prompt += `Translation Key: "${key}"\n`;
    prompt += `Source Text: "${sourceText}"\n`;
    
    if (context) {
      prompt += `Context: ${context}\n`;
    }

    prompt += `\nInstructions:\n`;
    prompt += `- Provide only the translated text, no explanations\n`;
    prompt += `- Maintain the original meaning and tone\n`;
    prompt += `- Consider the context of a task management application\n`;
    prompt += `- For UI elements, keep translations concise\n`;
    
    if (targetLangName === 'Hebrew') {
      prompt += `- Use modern Hebrew appropriate for software interfaces\n`;
      prompt += `- Ensure proper Hebrew grammar and spelling\n`;
    }
    
    if (targetLangName === 'Russian') {
      prompt += `- Use standard Russian appropriate for software interfaces\n`;
      prompt += `- Ensure proper Russian grammar and spelling\n`;
    }

    prompt += `\nTranslation:`;

    return prompt;
  }

  async validateApiKey(): Promise<boolean> {
    try {
      await this.openai.models.list();
      return true;
    } catch (error) {
      console.error('OpenAI API key validation failed:', error);
      return false;
    }
  }

  async generateKeyTranslations(
    key: string,
    targetLanguages: string[] = ['he', 'ru']
  ): Promise<Record<string, string>> {
    const extractedText = this.extractMeaningfulText(key, key);
    const results: Record<string, string> = {};
    
    for (const targetLang of targetLanguages) {
      try {
        const translation = await this.generateSingleTranslation(
          key,
          extractedText,
          'en',
          targetLang,
          'Task management application UI element'
        );
        results[targetLang] = translation;
      } catch (error) {
        console.error(`Failed to translate to ${targetLang}:`, error);
        results[targetLang] = extractedText; // Fallback to original text
      }
    }
    
    return results;
  }

  private extractMeaningfulText(key: string, sourceText: string): string {
    // If sourceText is different from key, use sourceText as-is
    if (sourceText !== key && sourceText.trim()) {
      return sourceText;
    }
    
    // Extract meaningful part from key patterns like:
    // "admin.yourname" → "your name"
    // "task.status.todo" → "todo"
    // "button.save" → "save"
    // "message.confirm_delete" → "confirm delete"
    
    const parts = key.split('.');
    const lastPart = parts[parts.length - 1] || key;
    
    // Convert camelCase and snake_case to readable text
    const readable = lastPart
      .replace(/([A-Z])/g, ' $1') // camelCase: "yourName" → "your Name"
      .replace(/_/g, ' ') // snake_case: "your_name" → "your name"
      .toLowerCase()
      .trim();
    
    return readable || key;
  }

  getAvailableLanguages(): Array<{ code: string; name: string; rtl: boolean }> {
    return [
      { code: 'en', name: 'English', rtl: false },
      { code: 'he', name: 'Hebrew', rtl: true },
      { code: 'ru', name: 'Russian', rtl: false },
      { code: 'es', name: 'Spanish', rtl: false },
      { code: 'fr', name: 'French', rtl: false },
      { code: 'de', name: 'German', rtl: false },
      { code: 'ar', name: 'Arabic', rtl: true },
    ];
  }
}
