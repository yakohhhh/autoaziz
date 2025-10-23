// Common types for the application

export interface User {
  id: number;
  email: string;
  name: string;
  role?: 'admin' | 'user';
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
