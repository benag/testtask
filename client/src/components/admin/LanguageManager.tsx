import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Globe } from 'lucide-react';
import { adminAPI, translationsAPI } from '../../lib/api';
import { useTranslation } from '../../hooks/useTranslation';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import type { Language } from '../../types';

interface LanguageFormData {
  code: string;
  name: string;
  is_active: boolean;
}

export const LanguageManager: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingLanguage, setEditingLanguage] = useState<Language | null>(null);
  const [formData, setFormData] = useState<LanguageFormData>({
    code: '',
    name: '',
    is_active: true,
  });

  const { data: languagesResponse, isLoading } = useQuery({
    queryKey: ['languages'],
    queryFn: translationsAPI.getLanguages,
  });

  const createLanguageMutation = useMutation({
    mutationFn: adminAPI.createLanguage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['languages'] });
      handleCloseForm();
    },
  });

  const updateLanguageMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Language> }) =>
      adminAPI.updateLanguage(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['languages'] });
      handleCloseForm();
    },
  });

  const languages = (languagesResponse?.data || []) as Language[];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingLanguage) {
      updateLanguageMutation.mutate({
        id: editingLanguage.id,
        data: formData,
      });
    } else {
      createLanguageMutation.mutate({
        code: formData.code,
        name: formData.name,
      });
    }
  };

  const handleEdit = (language: Language) => {
    setEditingLanguage(language);
    setFormData({
      code: language.code,
      name: language.name,
      is_active: language.is_active,
    });
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingLanguage(null);
    setFormData({ code: '', name: '', is_active: true });
  };

  const toggleLanguageStatus = (language: Language) => {
    updateLanguageMutation.mutate({
      id: language.id,
      data: { is_active: !language.is_active },
    });
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
          <h2 className="text-2xl font-bold text-gray-900">Language Management</h2>
          <p className="text-gray-600">Manage supported languages for your application</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Add Language</span>
        </Button>
      </div>

      {/* Language Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingLanguage ? 'Edit Language' : 'Add New Language'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Language Code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="en, he, ru, etc."
                  required
                  disabled={!!editingLanguage} // Don't allow editing code for existing languages
                />
                <Input
                  label="Language Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="English, Hebrew, Russian, etc."
                  required
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <label htmlFor="is_active" className="text-sm text-gray-700">
                  Active (available for selection)
                </label>
              </div>

              <div className="flex space-x-2">
                <Button
                  type="submit"
                  isLoading={createLanguageMutation.isPending || updateLanguageMutation.isPending}
                >
                  {editingLanguage ? 'Update Language' : 'Add Language'}
                </Button>
                <Button type="button" variant="outline" onClick={handleCloseForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Languages List */}
      <Card>
        <CardHeader>
          <CardTitle>Supported Languages ({languages.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {languages.length === 0 ? (
            <div className="text-center py-8">
              <Globe className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No languages</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by adding your first language.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {languages.map((language) => (
                <div
                  key={language.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-primary-600">
                          {language.code.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">
                        {language.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Code: {language.code}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        language.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {language.is_active ? 'Active' : 'Inactive'}
                    </span>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleLanguageStatus(language)}
                      className="text-xs"
                    >
                      {language.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(language)}
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
