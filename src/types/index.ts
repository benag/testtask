export interface User {
  id: string;
  email: string;
  password_hash: string;
  role: 'user' | 'admin';
  preferred_language: string;
  created_at: Date;
  updated_at: Date;
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  due_date?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface Language {
  id: string;
  code: string;
  name: string;
  is_active: boolean;
  created_at: Date;
}

export interface TranslationKey {
  id: string;
  key_name: string;
  description?: string;
  category?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Translation {
  id: string;
  translation_key_id: string;
  language_id: string;
  value: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  status?: 'todo' | 'in_progress' | 'done';
  priority?: 'low' | 'medium' | 'high';
  due_date?: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: 'todo' | 'in_progress' | 'done';
  priority?: 'low' | 'medium' | 'high';
  due_date?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  preferred_language?: string;
}

export interface AuthResponse {
  user: Omit<User, 'password_hash'>;
  token: string;
}

export interface CreateTranslationKeyRequest {
  key_name: string;
  description?: string;
  category?: string;
}

export interface UpdateTranslationRequest {
  value: string;
}

export interface TranslationWithDetails {
  id: string;
  key_name: string;
  description?: string;
  category?: string;
  translations: {
    language_code: string;
    language_name: string;
    value: string;
  }[];
}

export interface TaskFilters {
  status?: 'todo' | 'in_progress' | 'done';
  priority?: 'low' | 'medium' | 'high';
  search?: string;
  due_date_from?: string;
  due_date_to?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}
