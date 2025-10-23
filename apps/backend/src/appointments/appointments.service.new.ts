import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaClient } from '../../../generated/prisma';
import { CreateAppointmentDto } from '../dto/create-appointment.dto';
import { EmailService } from '../email/email.service';
import { VerificationService } from '../verification/verification.service';
import { SlotsService } from './slots.service';
import { CustomersService } from '../customers/customers.service';
import { VehiclesService } from '../vehicles/vehicles.service';

@Injectable()
export class AppointmentsService {
  private prisma: PrismaClient;

  constructor(
    private emailService: EmailService,
    private verificationService: VerificationService,
    private slotsService: SlotsService,
    private customersService: CustomersService,
    private vehiclesService: VehiclesService,
  ) {
    this.prisma = new PrismaClient();
  }

  async create(createAppointmentDto: CreateAppointmentDto) {
    // 1. Valider le créneau
    const slotValidation = await this.slotsService.validateSlot(
      createAppointmentDto.appointmentDate,
      createAppointmentDto.appointmentTime,
    );

    if (!slotValidation.valid) {
      throw new BadRequestException(slotValidation.message);
    }

    // 2. Créer ou récupérer le client
    const customer = await this.customersService.findOrCreate({
      firstName: createAppointmentDto.firstName,
      lastName: createAppointmentDto.lastName,
      email: createAppointmentDto.email,
      phone: createAppointmentDto.phone,
    });

    // 3. Créer ou récupérer le véhicule
    const vehicle = await this.vehiclesService.findOrCreate({
      registration: createAppointmentDto.vehicleRegistration,
      type: createAppointmentDto.vehicleType,
      brand: createAppointmentDto.vehicleBrand,
      model: createAppointmentDto.vehicleModel,
      fuelType: createAppointmentDto.fuelType,
      customerId: customer.id,
    });

    // 4. Calculer le prix selon le type de véhicule
    const prices = {
      Voiture: 70,
      Moto: 60,
      Utilitaire: 80,
      '4x4': 75,
      'Camping-car': 90,
      Collection: 80,
    };
    const price = prices[createAppointmentDto.vehicleType] || 70;

    // 5. Créer le rendez-vous
    const appointment = await this.prisma.appointment.create({
      data: {
        appointmentDate: new Date(createAppointmentDto.appointmentDate),
        appointmentTime: createAppointmentDto.appointmentTime,
        customerId: customer.id,
        vehicleId: vehicle.id,
        price,
        notes: createAppointmentDto.notes,
        status: 'pending_verification',
        source: 'web',
      },
      include: {
        customer: true,
        vehicle: true,
      },
    });

    // 6. Initier la vérification email/SMS
    await this.verificationService.initiateVerification(appointment.id);

    return appointment;
  }

  async findAll() {
    return this.prisma.appointment.findMany({
      orderBy: [{ appointmentDate: 'asc' }, { appointmentTime: 'asc' }],
      include: {
        customer: true,
        vehicle: true,
      },
    });
  }

  async findOne(id: number) {
    return this.prisma.appointment.findUnique({
      where: { id },
      include: {
        customer: true,
        vehicle: true,
        inspection: {
          include: { defects: true },
        },
      },
    });
  }

  async updateStatus(id: number, status: string) {
    return this.prisma.appointment.update({
      where: { id },
      data: { status, updatedAt: new Date() },
      include: {
        customer: true,
        vehicle: true,
      },
    });
  }

  async getUpcoming(limit = 10) {
    return this.prisma.appointment.findMany({
      where: {
        appointmentDate: { gte: new Date() },
        status: { in: ['pending', 'confirmed'] },
      },
      take: limit,
      orderBy: [{ appointmentDate: 'asc' }, { appointmentTime: 'asc' }],
      include: {
        customer: true,
        vehicle: true,
      },
    });
  }

  async getByCustomer(customerId: number) {
    return this.prisma.appointment.findMany({
      where: { customerId },
      orderBy: { appointmentDate: 'desc' },
      include: {
        vehicle: true,
        inspection: true,
      },
    });
  }

  async getByVehicle(vehicleId: number) {
    return this.prisma.appointment.findMany({
      where: { vehicleId },
      orderBy: { appointmentDate: 'desc' },
      include: {
        customer: true,
        inspection: {
          include: { defects: true },
        },
      },
    });
  }

  async onModuleDestroy() {
    await this.prisma.$disconnect();
  }
}
