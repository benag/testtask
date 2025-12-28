import React, { useState, useEffect } from 'react';
import { Edit, Save, X, Globe } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { staticTranslations } from '../../locales';

interface UITextEditorProps {}

export const UITextEditor: React.FC<UITextEditorProps> = () => {
  const { currentLanguage, setLanguage, languages, t, refreshTranslations } = useTranslation();
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [localTranslations, setLocalTranslations] = useState<Record<string, string>>({});
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    // Load current language translations
    const currentTranslations = staticTranslations[currentLanguage] || {};
    setLocalTranslations(currentTranslations);
    setHasChanges(false);
  }, [currentLanguage]);

  const handleStartEdit = (key: string, currentValue: string) => {
    setEditingKey(key);
    setEditValue(currentValue);
  };

  const handleSaveEdit = () => {
    if (editingKey) {
      setLocalTranslations(prev => ({
        ...prev,
        [editingKey]: editValue
      }));
      setHasChanges(true);
      setEditingKey(null);
      setEditValue('');
    }
  };

  const handleCancelEdit = () => {
    setEditingKey(null);
    setEditValue('');
  };

  const handleSaveAllChanges = async () => {
    try {
      console.log('💾 Saving UI text changes:', localTranslations);
      
      const response = await fetch(`/api/static-translations/${currentLanguage}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          translations: localTranslations
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save static translations');
      }
      
      console.log('✅ Static translations saved:', data);
      
      // Update local state immediately
      setLocalTranslations(localTranslations);
      setHasChanges(false);
      
      // Refresh translations from API to get the latest changes
      console.log('🔄 Refreshing translations from API...');
      await refreshTranslations();
      
      // Show success message
      alert(`UI text changes saved for ${currentLanguage.toUpperCase()}!\n${data.data.updatedKeys} keys updated.\n\nChanges are now live!`);
    } catch (error) {
      console.error('Failed to save UI text changes:', error);
      alert(`Failed to save changes: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleDiscardChanges = () => {
    const originalTranslations = staticTranslations[currentLanguage] || {};
    setLocalTranslations(originalTranslations);
    setHasChanges(false);
    setEditingKey(null);
  };

  const translationKeys = Object.keys(localTranslations).sort();

  const getKeyCategory = (key: string) => {
    const parts = key.split('.');
    return parts[0] || 'other';
  };

  const groupedKeys = translationKeys.reduce((groups, key) => {
    const category = getKeyCategory(key);
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(key);
    return groups;
  }, {} as Record<string, string[]>);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              UI Text Editor
            </CardTitle>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                Current nav.tasks: <strong>{t('nav.tasks')}</strong>
              </div>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                size="sm"
              >
                Force Refresh
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              {/* Language Selector */}
              <select
                value={currentLanguage}
                onChange={(e) => setLanguage(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name} ({lang.code.toUpperCase()})
                  </option>
                ))}
              </select>
              
              {hasChanges && (
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDiscardChanges}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Discard
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveAllChanges}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Save className="w-4 h-4 mr-1" />
                    Save All Changes
                  </Button>
                </div>
              )}
            </div>
          </div>
          <p className="text-sm text-gray-600">
            Edit static UI text for the <strong>{currentLanguage.toUpperCase()}</strong> language.
            {hasChanges && <span className="text-orange-600 ml-2">• You have unsaved changes</span>}
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {Object.entries(groupedKeys).map(([category, keys]) => (
              <div key={category} className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3 capitalize">
                  {category.replace('_', ' ')} ({keys.length} items)
                </h3>
                <div className="space-y-3">
                  {keys.map((key) => {
                    const currentValue = localTranslations[key] || '';
                    const isEditing = editingKey === key;
                    const originalValue = staticTranslations[currentLanguage]?.[key] || '';
                    const hasChanged = currentValue !== originalValue;

                    return (
                      <div
                        key={key}
                        className={`flex items-center space-x-3 p-3 rounded-md border ${
                          hasChanged ? 'border-orange-200 bg-orange-50' : 'border-gray-200'
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-gray-500 mb-1 font-mono">
                            {key}
                          </div>
                          {isEditing ? (
                            <div className="flex space-x-2">
                              <Input
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="flex-1"
                                placeholder="Enter translation text..."
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleSaveEdit();
                                  } else if (e.key === 'Escape') {
                                    handleCancelEdit();
                                  }
                                }}
                              />
                              <Button
                                size="sm"
                                onClick={handleSaveEdit}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <Save className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={handleCancelEdit}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          ) : (
                            <div className="text-sm text-gray-900">
                              {currentValue || <span className="text-gray-400 italic">No translation</span>}
                              {hasChanged && (
                                <span className="ml-2 text-xs text-orange-600 font-medium">
                                  (Modified)
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        {!isEditing && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStartEdit(key, currentValue)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {translationKeys.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Globe className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No UI text found for this language.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
