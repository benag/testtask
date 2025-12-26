import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Download, Upload, Search, Wand2 } from 'lucide-react';
import { adminAPI } from '../../lib/api';
import { useTranslation } from '../../hooks/useTranslation';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { TranslationForm } from './TranslationForm';
import { AITranslationGenerator } from './AITranslationGenerator';
import type { Translation } from '../../types';

export const TranslationManager: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingTranslation, setEditingTranslation] = useState<Translation | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [showAIGenerator, setShowAIGenerator] = useState<string | null>(null);

  const { data: translationsResponse, isLoading } = useQuery({
    queryKey: ['admin-translations'],
    queryFn: adminAPI.getTranslations,
  });

  // Note: keysResponse available for future features like key management
  // const { data: keysResponse } = useQuery({
  //   queryKey: ['admin-translation-keys'],
  //   queryFn: adminAPI.getTranslationKeys,
  // });

  const { data: languagesResponse } = useQuery({
    queryKey: ['languages'],
    queryFn: () => adminAPI.getTranslations().then(res => {
      // Extract unique languages from translations
      const languages = new Set();
      res.data?.forEach((translation: Translation) => {
        if (translation.language) {
          languages.add(translation.language.code);
        }
      });
      return { success: true, data: Array.from(languages) };
    }),
  });

  const deleteTranslationMutation = useMutation({
    mutationFn: adminAPI.deleteTranslation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-translations'] });
    },
  });

  const exportTranslationsMutation = useMutation({
    mutationFn: adminAPI.exportTranslations,
    onSuccess: (data) => {
      // Download JSON file
      const blob = new Blob([JSON.stringify(data.data, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `translations-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
  });

  const importTranslationsMutation = useMutation({
    mutationFn: adminAPI.importTranslations,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-translations'] });
      alert('Translations imported successfully!');
    },
    onError: (error: any) => {
      alert(`Import failed: ${error.response?.data?.error || error.message}`);
    },
  });

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const jsonData = JSON.parse(e.target?.result as string);
          importTranslationsMutation.mutate(jsonData);
        } catch (error) {
          alert('Invalid JSON file');
        }
      };
      reader.readAsText(file);
    }
    // Reset the input
    event.target.value = '';
  };

  const translations = translationsResponse?.data || [];
  const languages = (languagesResponse?.data || []) as string[];

  // Filter translations
  const filteredTranslations = translations.filter((translation: Translation) => {
    const keyName = translation.key?.key_name || '';
    const value = translation.value || '';
    const matchesSearch = keyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         value.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLanguage = selectedLanguage === 'all' || translation.language?.code === selectedLanguage;
    
    return matchesSearch && matchesLanguage;
  });

  const handleEditTranslation = (translation: Translation) => {
    setEditingTranslation(translation);
    setShowForm(true);
  };

  const handleDeleteTranslation = async (translationId: string) => {
    if (window.confirm(t('message.confirm_delete'))) {
      await deleteTranslationMutation.mutateAsync(translationId);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingTranslation(null);
  };

  const handleExport = () => {
    exportTranslationsMutation.mutate();
  };

  const handleAITranslation = (translationId: string) => {
    setShowAIGenerator(translationId);
  };

  const handleTranslationGenerated = () => {
    // Refresh the translations list
    queryClient.invalidateQueries({ queryKey: ['admin-translations'] });
    setShowAIGenerator(null);
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
          <h2 className="text-2xl font-bold text-gray-900">Translation Management</h2>
          <p className="text-gray-600">Manage dynamic translations for your application</p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={handleExport}
            className="flex items-center space-x-2"
            isLoading={exportTranslationsMutation.isPending}
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </Button>
          <Button
            variant="outline"
            onClick={handleImport}
            className="flex items-center space-x-2"
            isLoading={importTranslationsMutation.isPending}
          >
            <Upload className="w-4 h-4" />
            <span>Import</span>
          </Button>
          <Button
            onClick={() => setShowForm(true)}
            className="flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Translation</span>
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search translations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Languages</option>
                {languages.map((lang: string) => (
                  <option key={lang} value={lang}>
                    {lang.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Translations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Translations ({filteredTranslations.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTranslations.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No translations found</p>
              <Button onClick={() => setShowForm(true)}>
                Add First Translation
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Key
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Language
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Value
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTranslations.map((translation: Translation) => (
                    <tr key={translation.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {translation.key?.key_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {translation.language?.code?.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                        {translation.value}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {translation.key?.category || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAITranslation(translation.id)}
                            className="text-purple-600 hover:text-purple-700"
                            title="Generate AI Translation"
                          >
                            <Wand2 className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditTranslation(translation)}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteTranslation(translation.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Translation Generator */}
      {showAIGenerator && (() => {
        const selectedTranslation = translations.find(t => t.id === showAIGenerator);
        if (!selectedTranslation) return null;
        
        // Find a source translation (preferably English)
        const sourceTranslation = translations.find(t => 
          t.key?.key_name === selectedTranslation.key?.key_name && 
          t.language?.code === 'en'
        ) || translations.find(t => 
          t.key?.key_name === selectedTranslation.key?.key_name
        );
        
        if (!sourceTranslation) return null;
        
        return (
          <Card className="border-purple-200 bg-purple-50">
            <CardHeader>
              <CardTitle className="text-purple-900 flex items-center space-x-2">
                <Wand2 className="w-5 h-5" />
                <span>AI Translation Generator</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AITranslationGenerator
                translationKey={selectedTranslation.key?.key_name || ''}
                sourceText={sourceTranslation.value || ''}
                sourceLanguage={sourceTranslation.language?.code || 'en'}
                targetLanguage={selectedTranslation.language?.code || ''}
                onTranslationGenerated={handleTranslationGenerated}
              />
              <div className="mt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowAIGenerator(null)}
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })()}

      {/* Translation Form Modal */}
      {showForm && (
        <TranslationForm
          translation={editingTranslation}
          onClose={handleFormClose}
          onSuccess={handleFormClose}
        />
      )}
    </div>
  );
};
