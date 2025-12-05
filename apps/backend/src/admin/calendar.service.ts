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
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

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

    // Retourner les données brutes pour le planning hebdomadaire
    return appointments;
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
    const TIMEZONE = 'Europe/Paris';
    const appointmentDateTime = dayjs(dto.appointmentDate).tz(TIMEZONE);
    const appointmentTime = appointmentDateTime.format('HH:mm');
    // Create UTC midnight date for storage
    const appointmentDate = new Date(appointmentDateTime.format('YYYY-MM-DD'));

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
        `Le créneau ${appointmentTime} du ${appointmentDateTime.format('DD/MM/YYYY')} est déjà réservé`
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

  async updateAppointment(
    id: number,
    updateData: {
      firstName?: string;
      lastName?: string;
      email?: string;
      phone?: string;
      vehicleType?: string;
      vehicleBrand?: string;
      vehicleModel?: string;
      vehicleRegistration?: string;
      status?: string;
      notes?: string;
      appointmentDate?: string;
      selectedTime?: string;
      vehicleId?: number;
      price?: number;
    }
  ) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
    });

    if (!appointment) {
      throw new NotFoundException(`Rendez-vous #${id} introuvable`);
    }

    const data: any = {};

    // Mise à jour des informations client
    if (updateData.firstName) data.firstName = updateData.firstName;
    if (updateData.lastName) data.lastName = updateData.lastName;
    if (updateData.email) data.email = updateData.email;
    if (updateData.phone) data.phone = updateData.phone;

    // Mise à jour des informations véhicule
    if (updateData.vehicleType) data.vehicleType = updateData.vehicleType;
    if (updateData.vehicleBrand) data.vehicleBrand = updateData.vehicleBrand;
    if (updateData.vehicleModel) data.vehicleModel = updateData.vehicleModel;
    if (updateData.vehicleRegistration)
      data.vehicleRegistration = updateData.vehicleRegistration;

    // Mise à jour du statut
    if (updateData.status) {
      data.status = updateData.status;
      data.actualStatus = updateData.status; // Synchroniser actualStatus
    }

    // Mise à jour de la date si fournie
    if (updateData.appointmentDate) {
      const newDate = new Date(updateData.appointmentDate);
      data.appointmentDate = new Date(newDate.toDateString());
    }

    // Mise à jour de l'heure si fournie
    if (updateData.selectedTime) {
      data.appointmentTime = updateData.selectedTime;
    }

    // Mise à jour des notes si fournies
    if (updateData.notes !== undefined) {
      data.notes = updateData.notes;
    }

    // Mise à jour du prix si fourni
    if (updateData.price !== undefined) {
      data.price = updateData.price;
    }

    // Mise à jour du véhicule si fourni
    if (updateData.vehicleId !== undefined) {
      // Vérifier que le véhicule existe
      const vehicle = await this.prisma.vehicle.findUnique({
        where: { id: updateData.vehicleId },
      });

      if (!vehicle) {
        throw new NotFoundException(
          `Véhicule #${updateData.vehicleId} introuvable`
        );
      }

      data.vehicleId = updateData.vehicleId;
      // Mettre à jour aussi les champs dénormalisés du véhicule
      data.vehicleRegistration = vehicle.licensePlate;
      data.vehicleType = vehicle.vehicleType;
      data.vehicleBrand = vehicle.vehicleBrand;
      data.vehicleModel = vehicle.vehicleModel;
      data.fuelType = vehicle.fuelType;
    }

    // Si on change la date ou l'heure, vérifier que le nouveau créneau est disponible
    if (data.appointmentDate || data.appointmentTime) {
      const checkDate = data.appointmentDate || appointment.appointmentDate;
      const checkTime = data.appointmentTime || appointment.appointmentTime;

      const conflictingAppointment = await this.prisma.appointment.findFirst({
        where: {
          appointmentDate: checkDate,
          appointmentTime: checkTime,
          status: { notIn: ['cancelled'] },
          deletedAt: null,
          id: { not: id }, // Exclure le rendez-vous actuel
        },
      });

      if (conflictingAppointment) {
        throw new BadRequestException(
          `Le créneau ${checkTime} du ${checkDate.toLocaleDateString('fr-FR')} est déjà réservé`
        );
      }
    }

    const updated = await this.prisma.appointment.update({
      where: { id },
      data,
    });

    return {
      success: true,
      message: 'Rendez-vous mis à jour avec succès',
      appointment: updated,
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

  async getBlockedSlots(start?: string, end?: string) {
    const where: {
      date?: { gte: Date; lte: Date };
      deletedAt?: null;
    } = {
      deletedAt: null,
    };

    if (start && end) {
      where.date = {
        gte: new Date(start),
        lte: new Date(end),
      };
    }

    const blockedSlots = await this.prisma.blockedSlot.findMany({
      where,
      orderBy: [{ date: 'asc' }, { time: 'asc' }],
      select: {
        id: true,
        date: true,
        time: true,
        reason: true,
        blockedBy: true,
        createdAt: true,
      },
    });

    return blockedSlots.map(slot => ({
      id: slot.id,
      date: slot.date.toISOString().split('T')[0],
      time: slot.time,
      reason: slot.reason,
      blockedBy: slot.blockedBy,
      createdAt: slot.createdAt,
    }));
  }

  async createBlockedSlots(
    slots: Array<{ date: string; time: string }>,
    reason?: string
  ) {
    const created: any[] = [];

    for (const slot of slots) {
      try {
        const blockedSlot = await this.prisma.blockedSlot.create({
          data: {
            date: new Date(slot.date),
            time: slot.time,
            reason: reason || "Créneau bloqué par l'administrateur",
            blockedBy: 'admin',
          },
        });
        created.push(blockedSlot);
      } catch {
        // Si le créneau existe déjà, on continue
        console.log(`Créneau ${slot.date} ${slot.time} déjà bloqué`);
      }
    }

    return {
      success: true,
      message: `${created.length} créneau(x) bloqué(s) avec succès`,
      blocked: created.length,
    };
  }

  async deleteBlockedSlot(id: number) {
    const slot = await this.prisma.blockedSlot.findUnique({
      where: { id },
    });

    if (!slot) {
      throw new NotFoundException(`Créneau bloqué #${id} introuvable`);
    }

    await this.prisma.blockedSlot.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return {
      success: true,
      message: 'Créneau débloqué avec succès',
    };
  }

  async onModuleDestroy() {
    await this.prisma.$disconnect();
  }
}
