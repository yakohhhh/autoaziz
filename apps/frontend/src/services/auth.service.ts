import { apiService } from './api.service';

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  access_token: string;
  user: {
    id: number;
    email: string;
    name: string;
  };
}

export const authService = {
  login: (credentials: LoginCredentials) =>
    apiService.post<LoginResponse>('/auth/login', credentials),

  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
  },

  getCurrentUser: () => apiService.get('/auth/me'),
};
