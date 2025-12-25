import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, CheckSquare, Languages, Activity } from 'lucide-react';
import { adminAPI, tasksAPI } from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';

export const AdminStats: React.FC = () => {
  // Note: statsResponse is available for future use if backend implements detailed stats
  // const { data: statsResponse } = useQuery({
  //   queryKey: ['admin-stats'],
  //   queryFn: adminAPI.getStats,
  // });

  const { data: usersResponse } = useQuery({
    queryKey: ['admin-users'],
    queryFn: adminAPI.getUsers,
  });

  const { data: tasksResponse } = useQuery({
    queryKey: ['all-tasks'],
    queryFn: tasksAPI.getTasks,
  });

  const users = (usersResponse?.data as any)?.data || [];
  const tasks = (tasksResponse?.data as any)?.data || [];

  const stats = {
    totalUsers: users.length,
    adminUsers: users.filter((user: any) => user.role === 'admin').length,
    totalTasks: tasks.length,
    completedTasks: tasks.filter((task: any) => task.status === 'done').length,
    activeUsers: users.filter((user: any) => {
      // Users who have created tasks in the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return tasks.some((task: any) => 
        task.user_id === user.id && 
        new Date(task.created_at) > thirtyDaysAgo
      );
    }).length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
        <p className="text-gray-600">System statistics and metrics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckSquare className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalTasks}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Activity className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Languages className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Completed Tasks</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedTasks}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {users.slice(0, 5).map((user: any) => (
                <div key={user.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{user.email}</p>
                    <p className="text-sm text-gray-500">
                      Role: {user.role} • Language: {user.preferred_language}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(user.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Task Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">To Do</span>
                <span className="font-medium">
                  {tasks.filter((task: any) => task.status === 'todo').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">In Progress</span>
                <span className="font-medium">
                  {tasks.filter((task: any) => task.status === 'in_progress').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Completed</span>
                <span className="font-medium">
                  {stats.completedTasks}
                </span>
              </div>
              <div className="pt-2 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">Completion Rate</span>
                  <span className="font-bold text-green-600">
                    {stats.totalTasks > 0 
                      ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
                      : 0
                    }%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
