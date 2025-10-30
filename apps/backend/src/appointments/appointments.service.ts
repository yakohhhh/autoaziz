import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateAppointmentDto } from '../dto/create-appointment.dto';
import { EmailService } from '../email/email.service';
import { VerificationService } from '../verification/verification.service';
import { SlotsService } from './slots.service';
import { PrismaClient } from '../../generated/prisma';

@Injectable()
export class AppointmentsService {
  private prisma: PrismaClient;

  constructor(
    private emailService: EmailService,
    private verificationService: VerificationService,
    private slotsService: SlotsService
  ) {
    this.prisma = new PrismaClient();
  }

  async create(createAppointmentDto: CreateAppointmentDto): Promise<any> {
    // Valider le créneau
    const slotValidation = await this.slotsService.validateSlot(
      createAppointmentDto.appointmentDate,
      createAppointmentDto.appointmentTime
    );
    if (!slotValidation.valid) {
      throw new BadRequestException(slotValidation.message);
    }

    // 1. Chercher ou créer le client
    let customer = await this.prisma.customer.findUnique({
      where: { email: createAppointmentDto.email },
    });

    if (!customer) {
      customer = await this.prisma.customer.create({
        data: {
          firstName: createAppointmentDto.firstName,
          lastName: createAppointmentDto.lastName,
          email: createAppointmentDto.email,
          phone: createAppointmentDto.phone,
          notes: `Client créé automatiquement lors de la réservation`,
        },
      });
      console.log(`✅ Client créé: ${customer.email}`);
    }

    // 2. Chercher ou créer le véhicule
    let vehicle = await this.prisma.vehicle.findFirst({
      where: {
        customerId: customer.id,
        licensePlate: createAppointmentDto.vehicleRegistration,
      },
    });

    if (!vehicle) {
      vehicle = await this.prisma.vehicle.create({
        data: {
          customerId: customer.id,
          licensePlate: createAppointmentDto.vehicleRegistration,
          vehicleType: createAppointmentDto.vehicleType,
          vehicleBrand: createAppointmentDto.vehicleBrand,
          vehicleModel: createAppointmentDto.vehicleModel,
          fuelType: createAppointmentDto.fuelType || null,
        },
      });
      console.log(`✅ Véhicule créé: ${vehicle.licensePlate}`);
    } else {
      // Mettre à jour les infos du véhicule si elles ont changé
      vehicle = await this.prisma.vehicle.update({
        where: { id: vehicle.id },
        data: {
          vehicleType: createAppointmentDto.vehicleType,
          vehicleBrand: createAppointmentDto.vehicleBrand,
          vehicleModel: createAppointmentDto.vehicleModel,
          fuelType: createAppointmentDto.fuelType || null,
        },
      });
    }

    // 3. Convertir la date au bon format
    const dateStr = createAppointmentDto.appointmentDate;
    const appointmentDateTime = new Date(
      `${dateStr}T${createAppointmentDto.appointmentTime}:00.000Z`
    );

    // 4. Créer le rendez-vous DIRECTEMENT dans Prisma (UNE SEULE BASE DE DONNÉES)
    const appointment = await this.prisma.appointment.create({
      data: {
        customerId: customer.id,
        vehicleId: vehicle.id,
        firstName: createAppointmentDto.firstName,
        lastName: createAppointmentDto.lastName,
        email: createAppointmentDto.email,
        phone: createAppointmentDto.phone,
        vehicleRegistration: createAppointmentDto.vehicleRegistration,
        vehicleType: createAppointmentDto.vehicleType,
        vehicleBrand: createAppointmentDto.vehicleBrand,
        vehicleModel: createAppointmentDto.vehicleModel,
        fuelType: createAppointmentDto.fuelType,
        appointmentDate: appointmentDateTime,
        appointmentTime: createAppointmentDto.appointmentTime,
        status: 'pending_verification',
        actualStatus: 'pending_verification',
        emailVerified: false,
        phoneVerified: false,
        source: 'online',
        notes: '',
      },
    });

    console.log(
      `✅ RDV #${appointment.id} créé pour ${customer.email} - ${vehicle.licensePlate}`
    );

    // 5. Initier la vérification
    await this.verificationService.initiateVerification(appointment.id);

    return appointment;
  }

  async findAll(): Promise<any[]> {
    return this.prisma.appointment.findMany({
      where: { deletedAt: null },
      orderBy: [{ appointmentDate: 'asc' }, { appointmentTime: 'asc' }],
    });
  }

  async findOne(id: number) {
    return this.prisma.appointment.findUnique({ where: { id } });
  }

  async updateStatus(id: number, status: string) {
    const updated = await this.prisma.appointment.update({
      where: { id },
      data: { status },
    });
    return updated;
  }
  async verifyAppointment(
    appointmentId: number,
    verificationCode: string,
    verificationType: 'email' | 'phone'
  ): Promise<{ success: boolean; message: string }> {
    return this.verificationService.verifyCode(
      appointmentId,
      verificationCode,
      verificationType
    );
  }
  async resendVerificationCode(appointmentId: number): Promise<void> {
    await this.verificationService.resendVerificationCode(appointmentId);
  }
}
