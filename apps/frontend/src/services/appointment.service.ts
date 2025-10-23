import { apiService } from './api.service';

export interface Appointment {
  id: number;
  customerName: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  vehicleType: string;
  vehicleBrand: string;
  vehicleModel: string;
  vehicleRegistration?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAppointmentDto {
  customerName: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  vehicleType: string;
  vehicleBrand: string;
  vehicleModel: string;
  vehicleRegistration?: string;
  notes?: string;
}

export const appointmentService = {
  getAll: () => apiService.get<Appointment[]>('/appointments'),

  getById: (id: number) => apiService.get<Appointment>(`/appointments/${id}`),

  create: (data: CreateAppointmentDto) =>
    apiService.post<Appointment>('/appointments', data),

  update: (id: number, data: Partial<CreateAppointmentDto>) =>
    apiService.patch<Appointment>(`/appointments/${id}`, data),

  updateStatus: (id: number, status: Appointment['status']) =>
    apiService.patch<Appointment>(`/appointments/${id}/status`, { status }),

  delete: (id: number) => apiService.delete(`/appointments/${id}`),

  getAvailableSlots: (date: string) =>
    apiService.get<string[]>(`/appointments/available-slots?date=${date}`),
};
