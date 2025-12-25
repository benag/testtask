import pool from '../config/database';
import { 
  Language, 
  TranslationKey, 
  Translation, 
  TranslationWithDetails,
  CreateTranslationKeyRequest,
  UpdateTranslationRequest 
} from '../types';

export class TranslationService {
  // Language management
  async getLanguages(): Promise<Language[]> {
    const query = 'SELECT * FROM languages WHERE is_active = true ORDER BY name';
    const result = await pool.query(query);
    return result.rows as Language[];
  }

  async createLanguage(code: string, name: string, is_active = true): Promise<Language> {
    const query = `
      INSERT INTO languages (code, name, is_active)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const result = await pool.query(query, [code, name, is_active]);
    return result.rows[0] as Language;
  }

  async updateLanguage(id: string, name: string, is_active: boolean): Promise<Language | null> {
    const query = `
      UPDATE languages 
      SET name = $1, is_active = $2
      WHERE id = $3
      RETURNING *
    `;
    const result = await pool.query(query, [name, is_active, id]);
    return result.rows[0] || null;
  }

  // Translation key management
  async getTranslationKeys(): Promise<TranslationKey[]> {
    const query = 'SELECT * FROM translation_keys ORDER BY category, key_name';
    const result = await pool.query(query);
    return result.rows as TranslationKey[];
  }

  async createTranslationKey(keyData: CreateTranslationKeyRequest): Promise<TranslationKey> {
    const { key_name, description, category } = keyData;
    const query = `
      INSERT INTO translation_keys (key_name, description, category)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const result = await pool.query(query, [key_name, description, category]);
    return result.rows[0] as TranslationKey;
  }

  async updateTranslationKey(
    id: string, 
    keyData: Partial<CreateTranslationKeyRequest>
  ): Promise<TranslationKey | null> {
    const updateFields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    Object.entries(keyData).forEach(([key, value]) => {
      if (value !== undefined) {
        updateFields.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    });

    if (updateFields.length === 0) {
      const query = 'SELECT * FROM translation_keys WHERE id = $1';
      const result = await pool.query(query, [id]);
      return result.rows[0] || null;
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE translation_keys 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  async deleteTranslationKey(id: string): Promise<boolean> {
    const query = 'DELETE FROM translation_keys WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Translation management
  async getAllTranslations(): Promise<Translation[]> {
    const query = `
      SELECT 
        t.id,
        t.translation_key_id,
        t.language_id,
        t.value,
        t.created_at,
        t.updated_at,
        tk.key_name,
        tk.description,
        tk.category,
        l.code as language_code,
        l.name as language_name
      FROM translations t
      JOIN translation_keys tk ON t.translation_key_id = tk.id
      JOIN languages l ON t.language_id = l.id
      WHERE l.is_active = true
      ORDER BY tk.key_name, l.name
    `;

    const result = await pool.query(query);
    return result.rows.map(row => ({
      id: row.id,
      translation_key_id: row.translation_key_id,
      language_id: row.language_id,
      value: row.value,
      created_at: row.created_at,
      updated_at: row.updated_at,
      key: {
        id: row.translation_key_id,
        key_name: row.key_name,
        description: row.description,
        category: row.category,
        created_at: row.created_at,
        updated_at: row.updated_at
      },
      language: {
        id: row.language_id,
        code: row.language_code,
        name: row.language_name,
        is_active: true,
        created_at: row.created_at,
        updated_at: row.updated_at
      }
    }));
  }

  async getTranslationsWithDetails(): Promise<TranslationWithDetails[]> {
    const query = `
      SELECT 
        tk.id,
        tk.key_name,
        tk.description,
        tk.category,
        JSON_AGG(
          JSON_BUILD_OBJECT(
            'language_code', l.code,
            'language_name', l.name,
            'value', COALESCE(t.value, '')
          ) ORDER BY l.name
        ) as translations
      FROM translation_keys tk
      CROSS JOIN languages l
      LEFT JOIN translations t ON tk.id = t.translation_key_id AND l.id = t.language_id
      WHERE l.is_active = true
      GROUP BY tk.id, tk.key_name, tk.description, tk.category
      ORDER BY tk.category, tk.key_name
    `;

    const result = await pool.query(query);
    return result.rows as TranslationWithDetails[];
  }

  async getTranslationsByLanguage(languageCode: string): Promise<Record<string, string>> {
    const query = `
      SELECT tk.key_name, t.value
      FROM translation_keys tk
      JOIN translations t ON tk.id = t.translation_key_id
      JOIN languages l ON t.language_id = l.id
      WHERE l.code = $1 AND l.is_active = true
    `;

    const result = await pool.query(query, [languageCode]);
    const translations: Record<string, string> = {};
    
    result.rows.forEach(row => {
      translations[row.key_name] = row.value;
    });

    return translations;
  }

  async updateTranslation(
    translationKeyId: string, 
    languageCode: string, 
    translationData: UpdateTranslationRequest
  ): Promise<Translation | null> {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Get language ID
      const langQuery = 'SELECT id FROM languages WHERE code = $1 AND is_active = true';
      const langResult = await client.query(langQuery, [languageCode]);
      
      if (langResult.rows.length === 0) {
        throw new Error('Language not found');
      }

      const languageId = langResult.rows[0].id;

      // Upsert translation
      const query = `
        INSERT INTO translations (translation_key_id, language_id, value)
        VALUES ($1, $2, $3)
        ON CONFLICT (translation_key_id, language_id)
        DO UPDATE SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP
        RETURNING *
      `;

      const result = await client.query(query, [
        translationKeyId, 
        languageId, 
        translationData.value
      ]);

      await client.query('COMMIT');
      return result.rows[0] as Translation;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async deleteTranslation(translationKeyId: string, languageCode: string): Promise<boolean> {
    const query = `
      DELETE FROM translations 
      WHERE translation_key_id = $1 
      AND language_id = (SELECT id FROM languages WHERE code = $2)
    `;
    const result = await pool.query(query, [translationKeyId, languageCode]);
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Export/Import functionality
  async exportTranslations(): Promise<Record<string, Record<string, string>>> {
    const query = `
      SELECT 
        l.code as language_code,
        tk.key_name,
        t.value
      FROM languages l
      CROSS JOIN translation_keys tk
      LEFT JOIN translations t ON tk.id = t.translation_key_id AND l.id = t.language_id
      WHERE l.is_active = true
      ORDER BY l.code, tk.key_name
    `;

    const result = await pool.query(query);
    const exportData: Record<string, Record<string, string>> = {};

    result.rows.forEach(row => {
      if (!exportData[row.language_code]) {
        exportData[row.language_code] = {};
      }
      exportData[row.language_code]![row.key_name] = row.value || '';
    });

    return exportData;
  }

  async importTranslations(
    importData: Record<string, Record<string, string>>
  ): Promise<{ imported: number; errors: string[] }> {
    const client = await pool.connect();
    let imported = 0;
    const errors: string[] = [];

    try {
      await client.query('BEGIN');

      for (const [languageCode, translations] of Object.entries(importData)) {
        // Check if language exists
        const langQuery = 'SELECT id FROM languages WHERE code = $1';
        const langResult = await client.query(langQuery, [languageCode]);
        
        if (langResult.rows.length === 0) {
          errors.push(`Language ${languageCode} not found`);
          continue;
        }

        const languageId = langResult.rows[0].id;

        for (const [keyName, value] of Object.entries(translations)) {
          try {
            // Check if translation key exists
            const keyQuery = 'SELECT id FROM translation_keys WHERE key_name = $1';
            const keyResult = await client.query(keyQuery, [keyName]);
            
            if (keyResult.rows.length === 0) {
              errors.push(`Translation key ${keyName} not found`);
              continue;
            }

            const translationKeyId = keyResult.rows[0].id;

            // Upsert translation
            const upsertQuery = `
              INSERT INTO translations (translation_key_id, language_id, value)
              VALUES ($1, $2, $3)
              ON CONFLICT (translation_key_id, language_id)
              DO UPDATE SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP
            `;

            await client.query(upsertQuery, [translationKeyId, languageId, value]);
            imported++;
          } catch (error) {
            errors.push(`Error importing ${languageCode}.${keyName}: ${error}`);
          }
        }
      }

      await client.query('COMMIT');
      return { imported, errors };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async updateTranslationById(id: string, translationData: { value: string }): Promise<Translation | null> {
    const query = `
      UPDATE translations 
      SET value = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    const result = await pool.query(query, [id, translationData.value]);
    return result.rows[0] || null;
  }

  async deleteTranslationById(id: string): Promise<boolean> {
    const query = 'DELETE FROM translations WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rowCount !== null && result.rowCount > 0;
  }
}
