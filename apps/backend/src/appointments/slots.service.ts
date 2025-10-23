import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Appointment } from '../entities/appointment.entity';
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
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>
  ) {}

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
  private readonly CAPACITY_PER_SLOT = 2;
  async getAvailableSlots(
    weekOffset: number = 0
  ): Promise<AvailableSlotsResponseDto> {
    const now = dayjs().tz(this.TIMEZONE);
    const today = now.startOf('day');
    const startOfWeek = this.getStartOfWeek(today, weekOffset);
    const endOfWeek = startOfWeek.add(6, 'day');
    const appointments = await this.appointmentRepository.find({
      where: {
        appointmentDate: Between(startOfWeek.toDate(), endOfWeek.toDate()),
      },
    });
    const days: DaySlots[] = [];
    for (let i = 0; i < 7; i++) {
      const currentDate = startOfWeek.add(i, 'day');
      const daySlots = this.generateDaySlots(currentDate, now, appointments);
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
    appointments: Appointment[]
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
    const reservationsBySlot = new Map<string, number>();
    appointments
      .filter(apt => {
        const aptDate = dayjs(apt.appointmentDate).tz(this.TIMEZONE);
        return aptDate.format('YYYY-MM-DD') === dateString;
      })
      .forEach(apt => {
        const count = reservationsBySlot.get(apt.appointmentTime) || 0;
        reservationsBySlot.set(apt.appointmentTime, count + 1);
      });
    const isToday = date.isSame(today, 'day');
    const slots: TimeSlot[] = availableHours
      .map(time => {
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
    const appointmentDate = appointmentDateTime.toDate();
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
