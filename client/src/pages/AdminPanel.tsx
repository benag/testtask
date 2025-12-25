import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Users, BarChart3, Globe, Key } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { Card, CardContent } from '../components/ui/Card';
import { AdminStats } from '../components/admin/AdminStats';
import { UserManager } from '../components/admin/UserManager';
import { LanguageManager } from '../components/admin/LanguageManager';
import { TranslationKeyManager } from '../components/admin/TranslationKeyManager';

export const AdminPanel: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();

  const navigation = [
    {
      name: 'Dashboard',
      href: '/admin',
      icon: BarChart3,
      current: location.pathname === '/admin',
    },
    {
      name: 'Translation Keys',
      href: '/admin/keys',
      icon: Key,
      current: location.pathname === '/admin/keys',
    },
    {
      name: 'Languages',
      href: '/admin/languages',
      icon: Globe,
      current: location.pathname === '/admin/languages',
    },
    {
      name: 'Users',
      href: '/admin/users',
      icon: Users,
      current: location.pathname === '/admin/users',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t('page.admin.title')}</h1>
        <p className="text-gray-600">Manage your application settings and data</p>
      </div>

      {/* Navigation */}
      <Card>
        <CardContent className="p-4">
          <nav className="flex space-x-8">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    item.current
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </CardContent>
      </Card>

      {/* Content */}
      <Routes>
        <Route path="/" element={<AdminStats />} />
        <Route path="/keys" element={<TranslationKeyManager />} />
        <Route path="/languages" element={<LanguageManager />} />
        <Route path="/users" element={<UserManager />} />
      </Routes>
    </div>
  );
};
