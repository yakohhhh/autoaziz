import { Injectable } from '@nestjs/common';
import { PrismaClient } from '../../generated/prisma';
import {
  AvailableSlotsResponseDto,
  DaySlots,
  TimeSlot,
} from '../dto/available-slots.dto.js';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import 'dayjs/locale/fr';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale('fr');

@Injectable()
export class SlotsService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  private readonly TIMEZONE = 'Europe/Paris';
  private readonly OPENING_HOURS = {
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
    sunday: [],
  };
  private readonly SLOT_DURATION = 30;
  private readonly CAPACITY_PER_SLOT = 1; // 1 créneau = 1 client uniquement
  async getAvailableSlots(
    weekOffset: number = 0
  ): Promise<AvailableSlotsResponseDto> {
    const now = dayjs().tz(this.TIMEZONE);
    const today = now.startOf('day');
    const startOfWeek = this.getStartOfWeek(today, weekOffset);
    const endOfWeek = startOfWeek.add(6, 'day');

    const appointments = await this.prisma.appointment.findMany({
      where: {
        appointmentDate: {
          gte: startOfWeek.toDate(),
          lte: endOfWeek.toDate(),
        },
        status: { not: 'cancelled' }, // Exclure les rendez-vous annulés
        deletedAt: null, // Exclure les rendez-vous supprimés
      },
    });

    // Récupérer les créneaux bloqués pour la semaine
    const blockedSlots = await this.prisma.blockedSlot.findMany({
      where: {
        date: {
          gte: startOfWeek.toDate(),
          lte: endOfWeek.toDate(),
        },
        deletedAt: null,
      },
    });

    const days: DaySlots[] = [];
    for (let i = 0; i < 7; i++) {
      const currentDate = startOfWeek.add(i, 'day');
      const daySlots = this.generateDaySlots(
        currentDate,
        now,
        appointments,
        blockedSlots
      );
      days.push(daySlots);
    }
    return {
      days,
      weekStart: startOfWeek.format('YYYY-MM-DD'),
      weekEnd: endOfWeek.format('YYYY-MM-DD'),
    };
  }

  private generateDaySlots(
    date: dayjs.Dayjs,
    now: dayjs.Dayjs,
    appointments: any[],
    blockedSlots: any[]
  ): DaySlots {
    const today = now.startOf('day');
    const dateString = date.format('YYYY-MM-DD');
    const dayOfWeek = date.day();
    let availableHours: string[];
    if (dayOfWeek === 0) {
      availableHours = this.OPENING_HOURS.sunday;
    } else if (dayOfWeek === 6) {
      availableHours = this.OPENING_HOURS.saturday;
    } else {
      availableHours = this.OPENING_HOURS.weekday;
    }

    // Créer un Set des créneaux bloqués pour ce jour
    const blockedTimesForDay = new Set(
      blockedSlots
        .filter(slot => {
          const slotDate = dayjs(slot.date as Date)
            .tz(this.TIMEZONE)
            .startOf('day');
          const currentDateDay = date.startOf('day');
          return slotDate.isSame(currentDateDay, 'day');
        })
        .map(slot => slot.time)
    );

    const reservationsBySlot = new Map<string, number>();
    appointments
      .filter(apt => {
        const aptDate = dayjs(apt.appointmentDate as Date).tz(this.TIMEZONE);
        return aptDate.format('YYYY-MM-DD') === dateString;
      })
      .forEach(apt => {
        const timeStr = apt.appointmentTime as string;
        const count = reservationsBySlot.get(timeStr) || 0;
        reservationsBySlot.set(timeStr, count + 1);
      });
    const isToday = date.isSame(today, 'day');
    const slots: TimeSlot[] = availableHours
      .map(time => {
        // Si le créneau est bloqué, il n'est pas disponible
        if (blockedTimesForDay.has(time)) {
          return {
            time,
            available: false,
            reserved: false,
          };
        }

        const reservationCount = reservationsBySlot.get(time) || 0;
        const isAvailable = reservationCount < this.CAPACITY_PER_SLOT;
        if (isToday) {
          const [hours, minutes] = time.split(':').map(Number);
          const slotTime = date.hour(hours).minute(minutes);
          if (slotTime.isBefore(now)) {
            return null;
          }
        }
        return {
          time,
          available: isAvailable,
          reserved: reservationCount > 0,
        };
      })
      .filter(slot => slot !== null) as TimeSlot[];
    const isPast = date.isBefore(today, 'day');
    return {
      date: dateString,
      dayName: this.getDayName(dayOfWeek),
      isToday,
      isPast,
      isWithin24Hours: false,
      slots,
    };
  }

  async validateSlot(
    date: string,
    time: string
  ): Promise<{ valid: boolean; message?: string }> {
    const now = dayjs().tz(this.TIMEZONE);
    const appointmentDateTime = dayjs.tz(`${date} ${time}`, this.TIMEZONE);
    if (appointmentDateTime.isBefore(now)) {
      return {
        valid: false,
        message: 'Impossible de réserver un rendez-vous dans le passé.',
      };
    }
    const dayOfWeek = appointmentDateTime.day();
    if (dayOfWeek === 0) {
      return {
        valid: false,
        message: 'Le contrôle technique est fermé le dimanche.',
      };
    }
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

    // Vérifier si le créneau est bloqué
    const appointmentDateOnly = appointmentDateTime.startOf('day').toDate();
    const blockedSlot = await this.prisma.blockedSlot.findFirst({
      where: {
        date: appointmentDateOnly,
        time: time,
        deletedAt: null,
      },
    });

    if (blockedSlot) {
      return {
        valid: false,
        message: 'Ce créneau est actuellement indisponible.',
      };
    }

    const appointmentDate = appointmentDateTime.toDate();
    const existingAppointments = await this.prisma.appointment.count({
      where: {
        appointmentDate: appointmentDate,
        appointmentTime: time,
        status: { not: 'cancelled' }, // Exclure les rendez-vous annulés
        deletedAt: null, // Exclure les rendez-vous supprimés
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

  private getStartOfWeek(
    date: dayjs.Dayjs,
    weekOffset: number = 0
  ): dayjs.Dayjs {
    const dayOfWeek = date.day();
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    return date.subtract(daysToMonday, 'day').add(weekOffset * 7, 'day');
  }
}
