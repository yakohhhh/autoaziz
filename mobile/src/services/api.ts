import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs d'authentification
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Ne pas rediriger si l'erreur vient de la page de login
    if (error.response?.status === 401 && !error.config.url.includes('/auth/login')) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userName');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Interfaces - Alignées avec le backend Prisma
export interface Appointment {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  vehicleType?: string;
  vehicleBrand?: string;
  vehicleModel?: string;
  vehicleRegistration?: string;
  appointmentDate: string;
  appointmentTime: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  source?: string;
  createdAt?: string;
  customer?: Customer;
}

export interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  notes?: string;
  vehicles?: Vehicle[];
  appointments?: Appointment[];
  totalAppointments?: number;
  lastVisit?: string;
  createdAt?: string;
}

export interface Vehicle {
  id: number;
  customerId: number;
  vehicleBrand: string;
  vehicleModel: string;
  licensePlate: string;
  year?: number;
}

export interface DashboardStats {
  totalAppointments: number;
  pendingAppointments: number;
  confirmedAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  revenue: number;
  newCustomers: number;
  appointmentsByMonth?: Array<{ month: string; count: number }>;
  revenueByWeek?: Array<{ week: string; amount: number }>;
}

// API Methods
export const appointmentService = {
  getAll: async () => {
    const response = await api.get('/admin/calendar/appointments');
    return response.data;
  },
  
  getById: async (id: number) => {
    const response = await api.get(`/admin/appointments/${id}`);
    return response.data;
  },
  
  create: async (appointment: any) => {
    const response = await api.post('/admin/calendar/appointments/manual', appointment);
    return response.data;
  },
  
  updateStatus: async (id: number, status: string) => {
    const response = await api.patch(`/admin/calendar/appointments/${id}/status`, { status });
    return response.data;
  },
  
  delete: async (id: number) => {
    const response = await api.delete(`/admin/calendar/appointments/${id}`);
    return response.data;
  },
};

export const customerService = {
  getAll: async () => {
    const response = await api.get('/admin/customers');
    return response.data;
  },
  
  getById: async (id: number) => {
    const response = await api.get(`/admin/customers/${id}`);
    return response.data;
  },
  
  create: async (customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    notes?: string;
    vehicleBrand?: string;
    vehicleModel?: string;
    licensePlate?: string;
  }) => {
    const response = await api.post('/admin/customers', customer);
    return response.data;
  },
  
  update: async (id: number, customer: Partial<Customer>) => {
    const response = await api.put(`/admin/customers/${id}`, customer);
    return response.data;
  },
  
  delete: async (id: number) => {
    const response = await api.delete(`/admin/customers/${id}`);
    return response.data;
  },
};

export const statsService = {
  getDashboard: async (range = 'month') => {
    const response = await api.get('/admin/stats/dashboard', { params: { range } });
    return response.data;
  },
};

export const authService = {
  login: async (email: string, password: string) => {
    console.log('Tentative de connexion avec:', email); // Debug
    const response = await api.post('/auth/login', { email, password });
    console.log('Réponse du serveur:', response.data); // Debug
    
    if (response.data.token) {
      console.log('Token reçu:', response.data.token); // Debug
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('userRole', response.data.user?.role || 'admin');
      localStorage.setItem('userName', response.data.user?.name || 'Admin');
      console.log('Token enregistré dans localStorage'); // Debug
    } else {
      console.error('Pas de token dans la réponse!'); // Debug
    }
    return response.data;
  },
  
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
  },
  
  isAuthenticated: () => {
    const token = localStorage.getItem('authToken');
    console.log('🔍 authService.isAuthenticated check. Token exists?', !!token);
    return !!token;
  },
};

export default api;
