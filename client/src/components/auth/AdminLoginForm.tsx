import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useTranslation } from '../../hooks/useTranslation';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Shield } from 'lucide-react';

const adminLoginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type AdminLoginFormData = z.infer<typeof adminLoginSchema>;

export const AdminLoginForm: React.FC = () => {
  const { login, isLoading, error } = useAuthStore();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminLoginFormData>({
    resolver: zodResolver(adminLoginSchema),
  });

  const onSubmit = async (data: AdminLoginFormData) => {
    try {
      await login(data);
      // Check if user is admin after login
      const user = useAuthStore.getState().user;
      if (user?.role === 'admin') {
        navigate('/admin');
      } else {
        // If not admin, logout and show error
        useAuthStore.getState().logout();
        throw new Error('Admin access required');
      }
    } catch (error) {
      // Error is handled by the store
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card>
          <CardHeader>
            <div className="flex flex-col items-center space-y-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-red-600" />
              </div>
              <CardTitle className="text-center text-2xl">
                Admin Access
              </CardTitle>
              <p className="text-sm text-gray-600 text-center">
                Administrator login required
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              <Input
                label="Admin Email"
                type="email"
                {...register('email')}
                error={errors.email?.message}
                placeholder="admin@example.com"
              />

              <Input
                label="Admin Password"
                type="password"
                {...register('password')}
                error={errors.password?.message}
                placeholder="••••••••"
              />

              <Button
                type="submit"
                className="w-full"
                isLoading={isLoading}
              >
                Access Admin Panel
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Need regular access?{' '}
                <button
                  onClick={() => navigate('/login')}
                  className="font-medium text-primary-600 hover:text-primary-500"
                >
                  User Login
                </button>
              </p>
            </div>

            <div className="mt-4 p-3 bg-gray-50 rounded-md">
              <p className="text-xs text-gray-600 mb-2">Admin credentials:</p>
              <p className="text-xs text-gray-600">Email: admin@test.com</p>
              <p className="text-xs text-gray-600">Password: admin123</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
