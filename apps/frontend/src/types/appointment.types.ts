// Appointment related types

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
  status: AppointmentStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type AppointmentStatus =
  | 'pending'
  | 'confirmed'
  | 'completed'
  | 'cancelled';

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

export interface UpdateAppointmentDto extends Partial<CreateAppointmentDto> {
  status?: AppointmentStatus;
}
