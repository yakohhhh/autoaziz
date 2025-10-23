import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '../../../generated/prisma';

@Injectable()
export class CalendarService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async getCalendarAppointments(
    start?: string,
    end?: string,
    status?: string
  ) {
    const where: any = {};

    if (start && end) {
      where.appointmentDate = {
        gte: new Date(start),
        lte: new Date(end),
      };
    }

    if (status) {
      where.status = status;
    }

    const appointments = await this.prisma.appointment.findMany({
      where,
      orderBy: { appointmentDate: 'asc' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        vehicleType: true,
        vehicleBrand: true,
        vehicleModel: true,
        vehicleRegistration: true,
        appointmentDate: true,
        appointmentTime: true,
        status: true,
        notes: true,
        createdAt: true,
      },
    });

    // Format pour react-big-calendar ou FullCalendar
    return appointments.map((apt) => ({
      id: apt.id,
      title: `${apt.firstName} ${apt.lastName} - ${apt.vehicleType}`,
      start: new Date(`${apt.appointmentDate.toISOString().split('T')[0]}T${apt.appointmentTime}`),
      end: new Date(`${apt.appointmentDate.toISOString().split('T')[0]}T${apt.appointmentTime}`),
      resource: {
        id: apt.id,
        customerName: `${apt.firstName} ${apt.lastName}`,
        email: apt.email,
        phone: apt.phone,
        vehicleType: apt.vehicleType,
        vehicleBrand: apt.vehicleBrand,
        vehicleModel: apt.vehicleModel,
        vehicleRegistration: apt.vehicleRegistration,
        time: apt.appointmentTime,
        status: apt.status,
        notes: apt.notes,
      },
    }));
  }

  async updateAppointmentStatus(id: number, status: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
    });

    if (!appointment) {
      throw new NotFoundException(`Rendez-vous #${id} introuvable`);
    }

    const updated = await this.prisma.appointment.update({
      where: { id },
      data: { status },
    });

    return {
      message: 'Statut mis à jour avec succès',
      appointment: updated,
    };
  }

  async getSlotAvailability(date: string) {
    const targetDate = new Date(date);
    
    // Récupérer tous les RDV du jour
    const appointments = await this.prisma.appointment.findMany({
      where: {
        appointmentDate: targetDate,
        status: { notIn: ['cancelled'] },
      },
      select: { appointmentTime: true },
    });

    // Tous les créneaux disponibles (de 8h à 18h)
    const allSlots = [
      '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
      '11:00', '11:30', '14:00', '14:30', '15:00', '15:30',
      '16:00', '16:30', '17:00', '17:30',
    ];

    const bookedSlots = appointments.map((apt) => apt.appointmentTime);
    const availableSlots = allSlots.filter((slot) => !bookedSlots.includes(slot));

    return {
      date,
      totalSlots: allSlots.length,
      bookedSlots: bookedSlots.length,
      availableSlots: availableSlots.length,
      slots: allSlots.map((slot) => ({
        time: slot,
        available: !bookedSlots.includes(slot),
      })),
    };
  }

  async onModuleDestroy() {
    await this.prisma.$disconnect();
  }
}
