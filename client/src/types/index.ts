export interface User {
  id: string;
  email: string;
  role: 'user' | 'admin';
  preferred_language: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  due_date?: string;
  created_at: string;
  updated_at: string;
}

export interface Language {
  id: string;
  code: string;
  name: string;
  is_active: boolean;
  created_at: string;
}

export interface TranslationKey {
  id: string;
  key_name: string;
  description?: string;
  category?: string;
  created_at: string;
  updated_at: string;
}

export interface Translation {
  id: string;
  translation_key_id: string;
  language_id: string;
  value: string;
  created_at: string;
  updated_at: string;
  key?: TranslationKey;
  language?: Language;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: User;
  error?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  status?: 'todo' | 'in_progress' | 'done';
  priority?: 'low' | 'medium' | 'high';
  due_date?: string;
}

export interface UpdateTaskRequest extends Partial<CreateTaskRequest> {
  id: string;
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

export interface TranslationRequest {
  key_name: string;
  language_code: string;
  value: string;
  description?: string;
  category?: string;
}
