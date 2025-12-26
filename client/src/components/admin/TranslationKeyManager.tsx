import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Key, Languages, Wand2 } from 'lucide-react';
import { adminAPI, translationsAPI } from '../../lib/api';
// import { useTranslation } from '../../hooks/useTranslation';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import type { TranslationKey, Language, Translation } from '../../types';

interface KeyFormData {
  key_name: string;
  description: string;
  category: string;
}

export const TranslationKeyManager: React.FC = () => {
  // const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingKey, setEditingKey] = useState<TranslationKey | null>(null);
  const [showTranslations, setShowTranslations] = useState<string | null>(null);
  const [translationValues, setTranslationValues] = useState<Record<string, string>>({});
  const [savingTranslations, setSavingTranslations] = useState<Set<string>>(new Set());
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [formData, setFormData] = useState<KeyFormData>({
    key_name: '',
    description: '',
    category: '',
  });

  const { data: keysResponse, isLoading } = useQuery({
    queryKey: ['admin-translation-keys'],
    queryFn: adminAPI.getTranslationKeys,
  });

  const { data: languagesResponse } = useQuery({
    queryKey: ['languages'],
    queryFn: translationsAPI.getLanguages,
  });

  const { data: translationsResponse } = useQuery({
    queryKey: ['admin-all-translations'],
    queryFn: adminAPI.getAllTranslations,
  });

  const createKeyMutation = useMutation({
    mutationFn: adminAPI.createTranslationKey,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-translation-keys'] });
      handleCloseForm();
    },
  });

  const updateKeyMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TranslationKey> }) =>
      adminAPI.updateTranslationKey(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-translation-keys'] });
      handleCloseForm();
    },
  });

  const deleteKeyMutation = useMutation({
    mutationFn: adminAPI.deleteTranslationKey,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-translation-keys'] });
    },
  });

  const updateTranslationMutation = useMutation({
    mutationFn: ({ id, data, translationKey }: { id: string; data: any; translationKey: string }) => {
      setSavingTranslations(prev => new Set(prev).add(translationKey));
      return adminAPI.updateTranslation(id, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-all-translations'] });
      setSavingTranslations(prev => {
        const newSet = new Set(prev);
        newSet.delete(variables.translationKey);
        return newSet;
      });
    },
    onError: (_, variables) => {
      setSavingTranslations(prev => {
        const newSet = new Set(prev);
        newSet.delete(variables.translationKey);
        return newSet;
      });
    },
  });

  const createTranslationMutation = useMutation({
    mutationFn: ({ data, translationKey }: { data: any; translationKey: string }) => {
      setSavingTranslations(prev => new Set(prev).add(translationKey));
      return adminAPI.createTranslation(data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-all-translations'] });
      setSavingTranslations(prev => {
        const newSet = new Set(prev);
        newSet.delete(variables.translationKey);
        return newSet;
      });
    },
    onError: (_, variables) => {
      setSavingTranslations(prev => {
        const newSet = new Set(prev);
        newSet.delete(variables.translationKey);
        return newSet;
      });
    },
  });

  const keys = (keysResponse?.data || []) as TranslationKey[];
  const languages = (languagesResponse?.data || []) as Language[];
  const translations = (translationsResponse?.data || []) as Translation[];

  // Group translations by key ID
  const translationsByKey = translations.reduce((acc, translation) => {
    const keyId = translation.translation_key_id || translation.key?.id;
    if (!keyId) return acc;
    
    if (!acc[keyId]) {
      acc[keyId] = {};
    }
    acc[keyId][translation.language?.code || ''] = translation;
    return acc;
  }, {} as Record<string, Record<string, Translation>>);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingKey) {
      updateKeyMutation.mutate({
        id: editingKey.id,
        data: formData,
      });
    } else {
      createKeyMutation.mutate(formData);
    }
  };

  const handleEdit = (key: TranslationKey) => {
    setEditingKey(key);
    setFormData({
      key_name: key.key_name,
      description: key.description || '',
      category: key.category || '',
    });
    setShowForm(true);
  };

  const handleDelete = (keyId: string) => {
    if (window.confirm('Are you sure you want to delete this translation key? This will also delete all associated translations.')) {
      deleteKeyMutation.mutate(keyId);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingKey(null);
    setFormData({ key_name: '', description: '', category: '' });
  };

  const handleToggleTranslations = (keyId: string) => {
    setShowTranslations(showTranslations === keyId ? null : keyId);
  };

  const handleTranslationChange = (keyId: string, languageCode: string, value: string) => {
    const translationKey = `${keyId}-${languageCode}`;
    setTranslationValues(prev => ({
      ...prev,
      [translationKey]: value
    }));
  };

  const handleSaveTranslation = async (keyId: string, languageCode: string) => {
    const translationKey = `${keyId}-${languageCode}`;
    const value = translationValues[translationKey];
    
    if (!value) return;

    const existingTranslation = translationsByKey[keyId]?.[languageCode];
    
    if (existingTranslation) {
      // Update existing translation
      updateTranslationMutation.mutate({
        id: existingTranslation.id,
        data: { value },
        translationKey
      });
    } else {
      // Create new translation
      createTranslationMutation.mutate({
        data: {
          key_id: keyId,
          language_code: languageCode,
          value
        },
        translationKey
      });
    }

    // Clear the local state
    setTranslationValues(prev => {
      const newState = { ...prev };
      delete newState[translationKey];
      return newState;
    });
  };

  const handleAITranslation = async (keyId: string, targetLanguage: string) => {
    console.log('🤖 AI Translation clicked:', { keyId, targetLanguage });
    
    const selectedKey = keys.find(k => k.id === keyId);
    if (!selectedKey) {
      console.error('Key not found:', keyId);
      return;
    }
    
    // If targetLanguage is 'auto', generate for Hebrew and Russian
    if (targetLanguage === 'auto') {
      await generateBulkTranslations(selectedKey.key_name, ['he', 'ru']);
    } else {
      // Generate for specific language
      await generateBulkTranslations(selectedKey.key_name, [targetLanguage]);
    }
  };
  
  const generateBulkTranslations = async (keyName: string, targetLanguages: string[]) => {
    try {
      setIsGeneratingAI(true);
      console.log('🤖 Generating bulk translations for:', keyName, targetLanguages);
      
      const response = await fetch('/api/ai-translations/generate-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          key: keyName,
          targetLanguages
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate translations');
      }
      
      console.log('🎉 Generated translations:', data.data.translations);
      
      // Auto-populate the translation fields
      const newTranslationValues: Record<string, string> = {};
      Object.entries(data.data.translations).forEach(([lang, translation]) => {
        const keyId = keys.find(k => k.key_name === keyName)?.id;
        if (keyId) {
          const translationKey = `${keyId}-${lang}`;
          newTranslationValues[translationKey] = translation as string;
        }
      });
      
      setTranslationValues(prev => ({
        ...prev,
        ...newTranslationValues
      }));
      
      // Show success message or notification
      alert(`Generated translations for ${targetLanguages.join(', ')}!`);
      
    } catch (error) {
      console.error('Bulk translation error:', error);
      alert(`Failed to generate translations: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGeneratingAI(false);
    }
  };


  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Translation Keys</h2>
          <p className="text-gray-600">Manage translation keys that can be translated into multiple languages</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Add Key</span>
        </Button>
      </div>

      {/* Key Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingKey ? 'Edit Translation Key' : 'Add New Translation Key'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Key Name"
                value={formData.key_name}
                onChange={(e) => setFormData({ ...formData, key_name: e.target.value })}
                placeholder="e.g., nav.dashboard, task.status.completed"
                required
                disabled={!!editingKey} // Don't allow editing key name for existing keys
              />
              
              <Input
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of what this key is used for"
              />
              
              <Input
                label="Category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g., navigation, tasks, auth, common"
              />

              <div className="flex space-x-2">
                <Button
                  type="submit"
                  isLoading={createKeyMutation.isPending || updateKeyMutation.isPending}
                >
                  {editingKey ? 'Update Key' : 'Add Key'}
                </Button>
                <Button type="button" variant="outline" onClick={handleCloseForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Keys List */}
      <Card>
        <CardHeader>
          <CardTitle>Translation Keys ({keys.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {keys.length === 0 ? (
            <div className="text-center py-8">
              <Key className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No translation keys</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by adding your first translation key.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {keys.map((key) => {
                const keyTranslations = translationsByKey[key.id] || {};
                const isExpanded = showTranslations === key.id;
                
                return (
                  <div key={key.id} className="border border-gray-200 rounded-lg">
                    {/* Key Header */}
                    <div className="flex items-center justify-between p-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <Key className="w-5 h-5 text-gray-400" />
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-gray-900">
                              {key.key_name}
                            </h3>
                            {key.description && (
                              <p className="text-sm text-gray-500">
                                {key.description}
                              </p>
                            )}
                            <div className="flex items-center space-x-2 mt-1">
                              {key.category && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  {key.category}
                                </span>
                              )}
                              <span className="text-xs text-gray-500">
                                {Object.keys(keyTranslations).length}/{languages.length} languages
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleTranslations(key.id)}
                          className="flex items-center space-x-1"
                        >
                          <Languages className="w-3 h-3" />
                          <span>{isExpanded ? 'Hide' : 'Show'} Translations</span>
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAITranslation(key.id, 'auto')}
                          className="flex items-center space-x-1 text-purple-600 hover:text-purple-700"
                          title="Generate AI Translations"
                        >
                          <Wand2 className="w-3 h-3" />
                          <span>AI Generate</span>
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(key)}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(key.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                    {/* Translations Section */}
                    {isExpanded && (
                      <div className="border-t border-gray-200 p-4 bg-gray-50">
                        <h4 className="text-sm font-medium text-gray-900 mb-3">Translations</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {languages.map((language) => {
                            const translation = keyTranslations[language.code];
                            const translationKey = `${key.id}-${language.code}`;
                            const currentValue = translationValues[translationKey] ?? translation?.value ?? '';
                            
                            return (
                              <div key={language.code} className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                  {language.name} ({language.code})
                                </label>
                                <div className="flex space-x-2">
                                  <Input
                                    value={currentValue}
                                    onChange={(e) => handleTranslationChange(key.id, language.code, e.target.value)}
                                    placeholder={`Enter ${language.name} translation...`}
                                    className="flex-1"
                                  />
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleAITranslation(key.id, language.code)}
                                    className="text-purple-600 hover:text-purple-700"
                                    title={`Generate AI translation for ${language.name}`}
                                  >
                                    <Wand2 className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => handleSaveTranslation(key.id, language.code)}
                                    disabled={!translationValues[translationKey] || translationValues[translationKey] === translation?.value}
                                    isLoading={savingTranslations.has(translationKey)}
                                  >
                                    Save
                                  </Button>
                                </div>
                                {translation && (
                                  <p className="text-xs text-gray-500">
                                    Current: {translation.value}
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Translation Status */}
      {isGeneratingAI && (
        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Wand2 className="w-4 h-4 text-purple-600 animate-spin" />
              <span className="text-purple-700">Generating AI translations...</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
