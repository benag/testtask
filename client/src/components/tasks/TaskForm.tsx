import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { tasksAPI } from '../../lib/api';
import { useTranslation } from '../../hooks/useTranslation';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import type { Task, CreateTaskRequest } from '../../types';

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title is too long'),
  description: z.string().optional(),
  status: z.enum(['todo', 'in_progress', 'done']),
  priority: z.enum(['low', 'medium', 'high']),
  due_date: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface TaskFormProps {
  task?: Task | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const TaskForm: React.FC<TaskFormProps> = ({ task, onClose, onSuccess }) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: task ? {
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      due_date: task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : '',
    } : {
      status: 'todo',
      priority: 'medium',
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: tasksAPI.createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      onSuccess();
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateTaskRequest> }) =>
      tasksAPI.updateTask(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      onSuccess();
    },
  });

  const onSubmit = async (data: TaskFormData) => {
    const taskData: CreateTaskRequest = {
      title: data.title,
      description: data.description || undefined,
      status: data.status,
      priority: data.priority,
      due_date: data.due_date || undefined,
    };

    if (task) {
      await updateTaskMutation.mutateAsync({ id: task.id, data: taskData });
    } else {
      await createTaskMutation.mutateAsync(taskData);
    }
  };

  const isLoading = createTaskMutation.isPending || updateTaskMutation.isPending;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {task ? 'Edit Task' : 'Create New Task'}
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
              label={t('form.title')}
              {...register('title')}
              error={errors.title?.message}
              placeholder="Enter task title"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('form.description')}
              </label>
              <textarea
                {...register('description')}
                rows={3}
                className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Enter task description (optional)"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  {...register('status')}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                >
                  <option value="todo">{t('task.status.todo')}</option>
                  <option value="in_progress">{t('task.status.in_progress')}</option>
                  <option value="done">{t('task.status.done')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  {...register('priority')}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                >
                  <option value="low">{t('task.priority.low')}</option>
                  <option value="medium">{t('task.priority.medium')}</option>
                  <option value="high">{t('task.priority.high')}</option>
                </select>
              </div>
            </div>

            <Input
              label={t('form.dueDate')}
              type="date"
              {...register('due_date')}
              error={errors.due_date?.message}
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
                {task ? t('button.save') : t('button.create')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
