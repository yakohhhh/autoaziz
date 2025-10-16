import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Appointment } from '../entities/appointment.entity';
import {
  AvailableSlotsResponseDto,
  DaySlots,
  TimeSlot,
} from '../dto/available-slots.dto.js';

@Injectable()
export class SlotsService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>
  ) {}

  // Configuration des horaires d'ouverture
  private readonly OPENING_HOURS = {
    // Lundi à Vendredi
    weekday: [
      '08:00',
      '08:30',
      '09:00',
      '09:30',
      '10:00',
      '10:30',
      '11:00',
      '11:30',
      '14:00',
      '14:30',
      '15:00',
      '15:30',
      '16:00',
      '16:30',
      '17:00',
      '17:30',
    ],
    // Samedi
    saturday: [
      '08:00',
      '08:30',
      '09:00',
      '09:30',
      '10:00',
      '10:30',
      '11:00',
      '11:30',
    ],
    // Dimanche (fermé)
    sunday: [],
  };

  // Durée moyenne d'un contrôle technique (en minutes)
  private readonly SLOT_DURATION = 30;

  // Capacité par créneau (nombre de véhicules simultanés)
  private readonly CAPACITY_PER_SLOT = 2;

  /**
   * Récupère les créneaux disponibles pour une semaine donnée
   */
  async getAvailableSlots(
    weekOffset: number = 0
  ): Promise<AvailableSlotsResponseDto> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Calculer le début de la semaine (lundi)
    const startOfWeek = this.getStartOfWeek(today, weekOffset);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);

    // Récupérer tous les rendez-vous de la semaine
    const appointments = await this.appointmentRepository.find({
      where: {
        appointmentDate: Between(startOfWeek, endOfWeek),
      },
    });

    // Générer les créneaux pour chaque jour
    const days: DaySlots[] = [];
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startOfWeek);
      currentDate.setDate(currentDate.getDate() + i);
      const daySlots = this.generateDaySlots(currentDate, appointments);
      days.push(daySlots);
    }

    return {
      days,
      weekStart: startOfWeek.toISOString().split('T')[0],
      weekEnd: endOfWeek.toISOString().split('T')[0],
    };
  }

  /**
   * Génère les créneaux pour un jour donné
   */
  private generateDaySlots(date: Date, appointments: Appointment[]): DaySlots {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dateString = date.toISOString().split('T')[0];
    const dayOfWeek = date.getDay(); // 0 = Dimanche, 6 = Samedi

    // Déterminer les horaires selon le jour
    let availableHours: string[];
    if (dayOfWeek === 0) {
      availableHours = this.OPENING_HOURS.sunday;
    } else if (dayOfWeek === 6) {
      availableHours = this.OPENING_HOURS.saturday;
    } else {
      availableHours = this.OPENING_HOURS.weekday;
    }

    // Compter les réservations par créneau pour ce jour
    const reservationsBySlot = new Map<string, number>();
    appointments
      .filter(apt => {
        const aptDate = new Date(apt.appointmentDate);
        return aptDate.toISOString().split('T')[0] === dateString;
      })
      .forEach(apt => {
        const count = reservationsBySlot.get(apt.appointmentTime) || 0;
        reservationsBySlot.set(apt.appointmentTime, count + 1);
      });

    // Générer les créneaux
    const slots: TimeSlot[] = availableHours.map(time => {
      const reservationCount = reservationsBySlot.get(time) || 0;
      const isAvailable = reservationCount < this.CAPACITY_PER_SLOT;

      return {
        time,
        available: isAvailable,
        reserved: reservationCount > 0,
      };
    });

    const isPast = date < today;
    const isToday = dateString === today.toISOString().split('T')[0];
    const isWithin24Hours = date < tomorrow;

    return {
      date: dateString,
      dayName: this.getDayName(dayOfWeek),
      isToday,
      isPast,
      isWithin24Hours,
      slots,
    };
  }

  /**
   * Valide qu'un créneau est disponible et réservable
   */
  async validateSlot(
    date: string,
    time: string
  ): Promise<{ valid: boolean; message?: string }> {
    const appointmentDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Vérifier si la date est dans le passé
    if (appointmentDate < today) {
      return {
        valid: false,
        message: 'Impossible de réserver un rendez-vous dans le passé.',
      };
    }

    // Vérifier si c'est dans moins de 24h
    if (appointmentDate < tomorrow) {
      return {
        valid: false,
        message:
          "Les réservations doivent être faites au moins 24 heures à l'avance. Veuillez appeler le contrôle technique pour une réservation urgente.",
      };
    }

    // Vérifier si le jour est fermé (dimanche)
    const dayOfWeek = appointmentDate.getDay();
    if (dayOfWeek === 0) {
      return {
        valid: false,
        message: 'Le contrôle technique est fermé le dimanche.',
      };
    }

    // Vérifier si l'horaire est valide
    const availableHours =
      dayOfWeek === 6
        ? this.OPENING_HOURS.saturday
        : this.OPENING_HOURS.weekday;

    if (!availableHours.includes(time)) {
      return {
        valid: false,
        message: "Cet horaire n'est pas disponible.",
      };
    }

    // Vérifier la capacité
    const existingAppointments = await this.appointmentRepository.count({
      where: {
        appointmentDate: appointmentDate,
        appointmentTime: time,
      },
    });

    if (existingAppointments >= this.CAPACITY_PER_SLOT) {
      return {
        valid: false,
        message: 'Ce créneau est complet. Veuillez choisir un autre horaire.',
      };
    }

    return { valid: true };
  }

  /**
   * Retourne le nom du jour en français
   */
  private getDayName(dayOfWeek: number): string {
    const days = [
      'Dimanche',
      'Lundi',
      'Mardi',
      'Mercredi',
      'Jeudi',
      'Vendredi',
      'Samedi',
    ];
    return days[dayOfWeek];
  }

  /**
   * Calcule le début de la semaine (lundi)
   */
  private getStartOfWeek(date: Date, weekOffset: number = 0): Date {
    const result = new Date(date);
    const day = result.getDay();
    const diff = (day === 0 ? -6 : 1) - day; // Lundi = jour 1
    result.setDate(result.getDate() + diff + weekOffset * 7);
    result.setHours(0, 0, 0, 0);
    return result;
  }
}
