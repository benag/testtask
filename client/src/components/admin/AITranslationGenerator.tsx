import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Wand2, Loader2, Check, X, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

interface AITranslationGeneratorProps {
  translationKey: string;
  sourceText: string;
  sourceLanguage: string;
  targetLanguage: string;
  onTranslationGenerated: (key: string, translation: string) => void;
}

export const AITranslationGenerator: React.FC<AITranslationGeneratorProps> = ({
  translationKey,
  sourceText,
  sourceLanguage,
  targetLanguage,
  onTranslationGenerated,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTranslation, setGeneratedTranslation] = useState('');
  const [error, setError] = useState('');
  const [showResult, setShowResult] = useState(false);
  const { token } = useAuthStore();

  const generateTranslation = async () => {
    setIsGenerating(true);
    setError('');
    setShowResult(false);

    try {
      const response = await fetch('/api/ai-translations/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          key: translationKey,
          sourceLanguage,
          targetLanguage,
          context: 'Task management application UI element'
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate translation');
      }

      setGeneratedTranslation(data.data.translation);
      setShowResult(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate translation');
    } finally {
      setIsGenerating(false);
    }
  };

  const acceptTranslation = async () => {
    try {
      const response = await fetch('/api/ai-translations/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          key: translationKey,
          translation: generatedTranslation,
          targetLanguage,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save translation');
      }

      onTranslationGenerated(translationKey, generatedTranslation);
      setShowResult(false);
      setGeneratedTranslation('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save translation');
    }
  };

  const rejectTranslation = () => {
    setShowResult(false);
    setGeneratedTranslation('');
    setError('');
  };

  return (
    <div className="space-y-4">
      {/* Generate Button */}
      <Button
        onClick={generateTranslation}
        disabled={isGenerating || !sourceText}
        variant="secondary"
        size="sm"
        className="flex items-center space-x-2"
      >
        {isGenerating ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Wand2 className="w-4 h-4" />
        )}
        <span>
          {isGenerating ? 'Generating...' : 'Generate AI Translation'}
        </span>
      </Button>

      {/* Error Display */}
      {error && (
        <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
          <AlertCircle className="w-4 h-4 text-red-600" />
          <span className="text-sm text-red-700">{error}</span>
        </div>
      )}

      {/* Generated Translation Result */}
      {showResult && generatedTranslation && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-blue-900">
              AI Generated Translation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="text-xs text-gray-600">
                <strong>Source ({sourceLanguage}):</strong> {sourceText}
              </div>
              <div className="text-sm font-medium text-blue-900">
                <strong>Generated ({targetLanguage}):</strong> {generatedTranslation}
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button
                onClick={acceptTranslation}
                size="sm"
                className="flex items-center space-x-1"
              >
                <Check className="w-4 h-4" />
                <span>Accept & Save</span>
              </Button>
              <Button
                onClick={rejectTranslation}
                variant="outline"
                size="sm"
                className="flex items-center space-x-1"
              >
                <X className="w-4 h-4" />
                <span>Reject</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AITranslationGenerator;
