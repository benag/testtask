import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';

export const Unauthorized: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
              <Shield className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Access Denied
            </CardTitle>
            <p className="text-gray-600">
              You don't have permission to access this page
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-4">
                This page requires administrator privileges. Please contact your system administrator if you believe this is an error.
              </p>
              
              <div className="space-y-3">
                <Link to="/dashboard" className="w-full">
                  <Button className="w-full">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Return to Dashboard
                  </Button>
                </Link>
                
                <Link to="/admin/login" className="w-full">
                  <Button variant="outline" className="w-full">
                    Admin Login
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
