import axios from 'axios';
import type { 
  AuthResponse, 
  ApiResponse, 
  Task, 
  CreateTaskRequest, 
  UpdateTaskRequest,
  LoginRequest,
  RegisterRequest,
  User,
  Language,
  Translation,
  TranslationKey,
  TranslationRequest
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  me: async (): Promise<ApiResponse<User>> => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  logout: async (): Promise<ApiResponse> => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
};

// Tasks API
export const tasksAPI = {
  getTasks: async (): Promise<ApiResponse<Task[]>> => {
    const response = await api.get('/tasks');
    return response.data;
  },

  getTask: async (id: string): Promise<ApiResponse<Task>> => {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  },

  createTask: async (task: CreateTaskRequest): Promise<ApiResponse<Task>> => {
    const response = await api.post('/tasks', task);
    return response.data;
  },

  updateTask: async (id: string, task: Partial<UpdateTaskRequest>): Promise<ApiResponse<Task>> => {
    const response = await api.put(`/tasks/${id}`, task);
    return response.data;
  },

  deleteTask: async (id: string): Promise<ApiResponse> => {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  },
};

// Translations API
export const translationsAPI = {
  getTranslations: async (languageCode?: string): Promise<ApiResponse<Translation[]>> => {
    const endpoint = languageCode ? `/translations/${languageCode}` : '/translations/en';
    const response = await api.get(endpoint);
    return response.data;
  },

  getLanguages: async (): Promise<ApiResponse<Language[]>> => {
    const response = await api.get('/translations/languages');
    return response.data;
  },
};

// Admin API
export const adminAPI = {
  getStats: async (): Promise<ApiResponse<any>> => {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  getUsers: async (): Promise<ApiResponse<User[]>> => {
    const response = await api.get('/admin/users');
    return response.data;
  },

  getTranslationKeys: async (): Promise<ApiResponse<TranslationKey[]>> => {
    const response = await api.get('/admin/translation-keys');
    return response.data;
  },

  createTranslationKey: async (keyData: Partial<TranslationKey>): Promise<ApiResponse<TranslationKey>> => {
    const response = await api.post('/admin/translation-keys', keyData);
    return response.data;
  },

  updateTranslationKey: async (id: string, keyData: Partial<TranslationKey>): Promise<ApiResponse<TranslationKey>> => {
    const response = await api.put(`/admin/translation-keys/${id}`, keyData);
    return response.data;
  },

  deleteTranslationKey: async (id: string): Promise<ApiResponse> => {
    const response = await api.delete(`/admin/translation-keys/${id}`);
    return response.data;
  },

  getTranslations: async (): Promise<ApiResponse<Translation[]>> => {
    const response = await api.get('/admin/translations');
    return response.data;
  },

  createTranslation: async (translation: TranslationRequest): Promise<ApiResponse<Translation>> => {
    const response = await api.post('/admin/translations', translation);
    return response.data;
  },

  updateTranslation: async (id: string, translation: Partial<TranslationRequest>): Promise<ApiResponse<Translation>> => {
    const response = await api.put(`/admin/translations/${id}`, translation);
    return response.data;
  },

  deleteTranslation: async (id: string): Promise<ApiResponse> => {
    const response = await api.delete(`/admin/translations/${id}`);
    return response.data;
  },

  createLanguage: async (language: { code: string; name: string }): Promise<ApiResponse<Language>> => {
    const response = await api.post('/admin/languages', language);
    return response.data;
  },

  updateLanguage: async (id: string, language: Partial<Language>): Promise<ApiResponse<Language>> => {
    const response = await api.put(`/admin/languages/${id}`, language);
    return response.data;
  },

  exportTranslations: async (): Promise<ApiResponse<any>> => {
    const response = await api.get('/admin/translations/export');
    return response.data;
  },

  importTranslations: async (data: any): Promise<ApiResponse> => {
    const response = await api.post('/admin/translations/import', data);
    return response.data;
  },
};

// Health check
export const healthAPI = {
  check: async (): Promise<ApiResponse> => {
    const response = await api.get('/health');
    return response.data;
  },
};

export default api;
