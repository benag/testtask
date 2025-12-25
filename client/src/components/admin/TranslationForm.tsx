import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { adminAPI } from '../../lib/api';
import { useTranslation } from '../../hooks/useTranslation';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import type { Translation, TranslationRequest } from '../../types';

const translationSchema = z.object({
  key_name: z.string().min(1, 'Key name is required'),
  language_code: z.string().min(2, 'Language code is required'),
  value: z.string().min(1, 'Translation value is required'),
  description: z.string().optional(),
  category: z.string().optional(),
});

type TranslationFormData = z.infer<typeof translationSchema>;

interface TranslationFormProps {
  translation?: Translation | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const TranslationForm: React.FC<TranslationFormProps> = ({
  translation,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { data: languagesResponse } = useQuery({
    queryKey: ['languages'],
    queryFn: () => adminAPI.getTranslations().then(res => {
      // Extract unique languages from translations
      const languages = new Set();
      res.data?.forEach((trans: Translation) => {
        if (trans.language) {
          languages.add(trans.language.code);
        }
      });
      return { success: true, data: Array.from(languages) };
    }),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TranslationFormData>({
    resolver: zodResolver(translationSchema),
    defaultValues: translation ? {
      key_name: translation.key?.key_name || '',
      language_code: translation.language?.code || '',
      value: translation.value,
      description: translation.key?.description || '',
      category: translation.key?.category || '',
    } : {
      language_code: 'en',
    },
  });

  const createTranslationMutation = useMutation({
    mutationFn: adminAPI.createTranslation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-translations'] });
      queryClient.invalidateQueries({ queryKey: ['admin-translation-keys'] });
      onSuccess();
    },
  });

  const updateTranslationMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TranslationRequest> }) =>
      adminAPI.updateTranslation(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-translations'] });
      queryClient.invalidateQueries({ queryKey: ['admin-translation-keys'] });
      onSuccess();
    },
  });

  const onSubmit = async (data: TranslationFormData) => {
    const translationData: TranslationRequest = {
      key_name: data.key_name,
      language_code: data.language_code,
      value: data.value,
      description: data.description || undefined,
      category: data.category || undefined,
    };

    if (translation) {
      await updateTranslationMutation.mutateAsync({
        id: translation.id,
        data: translationData,
      });
    } else {
      await createTranslationMutation.mutateAsync(translationData);
    }
  };

  const isLoading = createTranslationMutation.isPending || updateTranslationMutation.isPending;
  const languages = languagesResponse?.data || ['en', 'he', 'ru'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {translation ? 'Edit Translation' : 'Create New Translation'}
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="p-1 h-8 w-8"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Translation Key"
              {...register('key_name')}
              error={errors.key_name?.message}
              placeholder="e.g., task.status.todo"
              helperText="Use dot notation for nested keys"
              disabled={!!translation} // Don't allow editing key for existing translations
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Language
              </label>
              <select
                {...register('language_code')}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                disabled={!!translation} // Don't allow editing language for existing translations
              >
                {languages.map((lang: string) => (
                  <option key={lang} value={lang}>
                    {lang.toUpperCase()} - {lang === 'en' ? 'English' : lang === 'he' ? 'Hebrew' : lang === 'ru' ? 'Russian' : lang}
                  </option>
                ))}
              </select>
              {errors.language_code && (
                <p className="mt-1 text-sm text-red-600">{errors.language_code.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Translation Value
              </label>
              <textarea
                {...register('value')}
                rows={3}
                className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Enter the translated text"
              />
              {errors.value && (
                <p className="mt-1 text-sm text-red-600">{errors.value.message}</p>
              )}
            </div>

            <Input
              label="Category (Optional)"
              {...register('category')}
              error={errors.category?.message}
              placeholder="e.g., task_status, errors, messages"
              helperText="Group related translations together"
            />

            <Input
              label="Description (Optional)"
              {...register('description')}
              error={errors.description?.message}
              placeholder="Brief description of this translation"
              helperText="Help other admins understand the context"
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                {t('button.cancel')}
              </Button>
              <Button
                type="submit"
                isLoading={isLoading}
              >
                {translation ? t('button.save') : t('button.create')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
