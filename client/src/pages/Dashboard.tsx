import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle, Clock, AlertCircle, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { tasksAPI } from '../lib/api';
import { useTranslation } from '../hooks/useTranslation';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import type { Task } from '../types';

export const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  
  const { data: tasksResponse, isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: tasksAPI.getTasks,
  });

  const tasks = tasksResponse?.data || [];

  const stats = {
    total: tasks.length,
    todo: tasks.filter((task: Task) => task.status === 'todo').length,
    inProgress: tasks.filter((task: Task) => task.status === 'in_progress').length,
    done: tasks.filter((task: Task) => task.status === 'done').length,
  };

  const recentTasks = tasks
    .sort((a: Task, b: Task) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

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
        <h1 className="text-3xl font-bold text-gray-900">{t('nav.dashboard')}</h1>
        <Link to="/tasks">
          <Button className="flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>New Task</span>
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">To Do</p>
                <p className="text-2xl font-bold text-gray-900">{stats.todo}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertCircle className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.done}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Tasks */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          {recentTasks.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">{t('message.no_tasks')}</p>
              <Link to="/tasks" className="mt-4 inline-block">
                <Button>Create Your First Task</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentTasks.map((task: Task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        task.status === 'done'
                          ? 'bg-green-500'
                          : task.status === 'in_progress'
                          ? 'bg-orange-500'
                          : 'bg-gray-400'
                      }`}
                    />
                    <div>
                      <h3 className="font-medium text-gray-900">{task.title}</h3>
                      <p className="text-sm text-gray-500">
                        {task.description && task.description.length > 50
                          ? `${task.description.substring(0, 50)}...`
                          : task.description}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        task.priority === 'high'
                          ? 'bg-red-100 text-red-800'
                          : task.priority === 'medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {t(`task.priority.${task.priority}`)}
                    </span>
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
