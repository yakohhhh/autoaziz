// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:3001',
  TIMEOUT: 30000,
} as const;

// Application routes
export const ROUTES = {
  HOME: '/',
  SERVICES: '/services',
  PRICING: '/tarifs',
  APPOINTMENTS: '/rendez-vous',
  CONTACT: '/contact',
  LOGIN: '/login',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_PLANNING: '/admin/planning',
  VERIFY_APPOINTMENT: '/verify/:token',
} as const;

// Appointment status labels
export const APPOINTMENT_STATUS_LABELS = {
  pending: 'En attente',
  confirmed: 'Confirmé',
  completed: 'Terminé',
  cancelled: 'Annulé',
} as const;

// Time slots
export const TIME_SLOTS = [
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
] as const;

// Vehicle types
export const VEHICLE_TYPES = [
  'Voiture',
  'Moto',
  'Camion',
  'SUV',
  'Utilitaire',
] as const;
