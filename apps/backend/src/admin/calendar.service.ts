import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaClient } from '../../generated/prisma';
import {
  CreateManualAppointmentDto,
  ManualAppointmentSource,
} from '../dto/create-manual-appointment.dto';

@Injectable()
export class CalendarService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async getCalendarAppointments(start?: string, end?: string, status?: string) {
    const where: {
      appointmentDate?: { gte: Date; lte: Date };
      status?: string;
      deletedAt?: null;
    } = {
      deletedAt: null, // Exclure les rendez-vous supprimés
    };

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
    return appointments.map(apt => {
      const dateStr = apt.appointmentDate.toISOString().split('T')[0];
      const startDate = new Date(`${dateStr}T${apt.appointmentTime}`);
      const endDate = new Date(startDate);
      endDate.setMinutes(endDate.getMinutes() + 30); // Durée de 30 minutes pour un contrôle technique

      return {
        id: apt.id,
        title: `${apt.firstName} ${apt.lastName} - ${apt.vehicleType}`,
        start: startDate,
        end: endDate,
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
      };
    });
  }

  async updateAppointmentStatus(id: number, status: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: { customer: true },
    });

    if (!appointment) {
      throw new NotFoundException(`Rendez-vous #${id} introuvable`);
    }

    // Mise à jour du statut ET de actualStatus dans Prisma (UNE SEULE BASE)
    const updated = await this.prisma.appointment.update({
      where: { id },
      data: {
        status,
        actualStatus: status, // Synchroniser actualStatus avec status
      },
    });

    console.log(`✅ Appointment ${id} status updated to ${status}`);

    return {
      message: 'Statut mis à jour avec succès',
      appointment: updated,
    };
  }

  async getSlotAvailability(date: string) {
    const targetDate = new Date(date);

    // Récupérer tous les RDV du jour (non supprimés et non annulés)
    const appointments = await this.prisma.appointment.findMany({
      where: {
        appointmentDate: targetDate,
        status: { notIn: ['cancelled'] },
        deletedAt: null, // Exclure les rendez-vous supprimés
      },
      select: { appointmentTime: true },
    });

    // Tous les créneaux disponibles (de 8h à 18h)
    const allSlots = [
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
    ];

    const bookedSlots = appointments.map(apt => apt.appointmentTime);
    const availableSlots = allSlots.filter(slot => !bookedSlots.includes(slot));

    return {
      date,
      totalSlots: allSlots.length,
      bookedSlots: bookedSlots.length,
      availableSlots: availableSlots.length,
      slots: allSlots.map(slot => ({
        time: slot,
        available: !bookedSlots.includes(slot),
      })),
    };
  }

  async createManualAppointment(dto: CreateManualAppointmentDto) {
    const appointmentDateTime = new Date(dto.appointmentDate);
    const appointmentDate = new Date(appointmentDateTime.toDateString());
    const appointmentTime = appointmentDateTime.toTimeString().slice(0, 5);

    // Vérifier si le créneau est déjà pris
    const existingAppointment = await this.prisma.appointment.findFirst({
      where: {
        appointmentDate,
        appointmentTime,
        status: { notIn: ['cancelled'] },
      },
    });

    if (existingAppointment) {
      throw new BadRequestException(
        `Le créneau ${appointmentTime} du ${appointmentDate.toLocaleDateString('fr-FR')} est déjà réservé`
      );
    }

    // Chercher ou créer le client
    let customer = await this.prisma.customer.findUnique({
      where: { email: dto.email },
    });

    if (!customer) {
      customer = await this.prisma.customer.create({
        data: {
          firstName: dto.firstName,
          lastName: dto.lastName,
          email: dto.email,
          phone: dto.phone,
        },
      });
    }

    // Chercher ou créer le véhicule
    let vehicle = await this.prisma.vehicle.findFirst({
      where: {
        customerId: customer.id,
        licensePlate: dto.licensePlate,
      },
    });

    if (!vehicle) {
      // Nouveau véhicule pour ce client
      vehicle = await this.prisma.vehicle.create({
        data: {
          customerId: customer.id,
          licensePlate: dto.licensePlate,
          vehicleType: dto.vehicleType,
          vehicleBrand: dto.vehicleBrand,
          vehicleModel: dto.vehicleModel,
          fuelType: dto.fuelType,
        },
      });
    } else {
      // Véhicule existe : mettre à jour les infos si elles ont changé
      vehicle = await this.prisma.vehicle.update({
        where: { id: vehicle.id },
        data: {
          vehicleType: dto.vehicleType,
          vehicleBrand: dto.vehicleBrand,
          vehicleModel: dto.vehicleModel,
          fuelType: dto.fuelType,
        },
      });
    }

    // Créer la note avec le tag [MANUEL] et la source
    const sourceLabel =
      dto.source === ManualAppointmentSource.PHONE ? 'Téléphone' : 'Au Centre';
    const notes = `[MANUEL] Pris par ${sourceLabel}${dto.notes ? ' - ' + dto.notes : ''}`;

    // Créer le rendez-vous avec toutes les informations du véhicule
    const appointment = await this.prisma.appointment.create({
      data: {
        customerId: customer.id,
        vehicleId: vehicle.id,
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        phone: dto.phone,
        vehicleRegistration: dto.licensePlate,
        vehicleType: dto.vehicleType,
        vehicleBrand: dto.vehicleBrand,
        vehicleModel: dto.vehicleModel,
        fuelType: dto.fuelType,
        appointmentDate,
        appointmentTime,
        status: 'confirmed', // RDV manuel = confirmé directement
        emailVerified: true, // Pris manuellement donc vérifié
        phoneVerified: true,
        source: dto.source,
        notes,
      },
    });

    return {
      success: true,
      message: 'Rendez-vous créé avec succès',
      appointment: {
        id: appointment.id,
        customerId: customer.id,
        vehicleId: vehicle.id,
        firstName: appointment.firstName,
        lastName: appointment.lastName,
        email: appointment.email,
        phone: appointment.phone,
        vehicleType: appointment.vehicleType,
        vehicleBrand: appointment.vehicleBrand,
        vehicleModel: appointment.vehicleModel,
        vehicleRegistration: appointment.vehicleRegistration,
        fuelType: appointment.fuelType,
        appointmentDate: appointment.appointmentDate,
        appointmentTime: appointment.appointmentTime,
        source: dto.source,
      },
    };
  }

  async deleteAppointment(
    id: number,
    reason: string,
    note?: string,
    deletedBy?: string
  ) {
    // Validation du reason
    if (!reason || reason.trim() === '') {
      throw new Error('La raison de suppression est obligatoire');
    }

    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: {
        customer: true,
      },
    });

    if (!appointment) {
      throw new NotFoundException(`Rendez-vous #${id} introuvable`);
    }

    // Enregistrer la suppression dans la table de tracking
    await this.prisma.appointmentDeletion.create({
      data: {
        appointmentId: id,
        customerId: appointment.customerId,
        customerName: `${appointment.firstName} ${appointment.lastName}`,
        appointmentDate: appointment.appointmentDate,
        appointmentTime: appointment.appointmentTime,
        deletionReason: reason,
        deletionNote: note || '',
        deletedBy: deletedBy || 'Admin',
      },
    });

    // Soft delete dans Prisma (UNE SEULE BASE - libère le créneau immédiatement)
    await this.prisma.appointment.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletionReason: reason,
        deletionNote: note || '',
        status: 'cancelled',
      },
    });

    console.log(`✅ Appointment ${id} deleted - slot freed for booking`);

    return {
      success: true,
      message: 'Rendez-vous supprimé avec succès',
      reason,
      slotFreed: true,
      appointmentDetails: {
        id: appointment.id,
        customerName: `${appointment.firstName} ${appointment.lastName}`,
        date: appointment.appointmentDate,
        time: appointment.appointmentTime,
      },
    };
  }

  async onModuleDestroy() {
    await this.prisma.$disconnect();
  }
}
