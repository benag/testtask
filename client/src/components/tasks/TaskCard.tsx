import React from 'react';
import { Calendar, Edit, Trash2, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import type { Task } from '../../types';

interface TaskCardProps {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete }) => {
  const { t } = useTranslation();

  const getStatusIcon = () => {
    switch (task.status) {
      case 'done':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 text-orange-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getPriorityColor = () => {
    switch (task.priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              {getStatusIcon()}
              <h3 className="font-medium text-gray-900 truncate">{task.title}</h3>
            </div>
            <div className="flex items-center space-x-1">
              <Button
                variant="outline"
                size="sm"
                onClick={onEdit}
                className="p-1 h-8 w-8"
              >
                <Edit className="w-3 h-3" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onDelete}
                className="p-1 h-8 w-8 text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>

          {/* Description */}
          {task.description && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {task.description}
            </p>
          )}

          {/* Status and Priority */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {t(`task.status.${task.status}`)}
            </span>
            <span
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor()}`}
            >
              {t(`task.priority.${task.priority}`)}
            </span>
          </div>

          {/* Due Date */}
          {task.due_date && (
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(task.due_date)}</span>
            </div>
          )}

          {/* Created Date */}
          <div className="text-xs text-gray-400">
            Created {formatDate(task.created_at)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
