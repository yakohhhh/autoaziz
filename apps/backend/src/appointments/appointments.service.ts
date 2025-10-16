import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment } from '../entities/appointment.entity';
import { CreateAppointmentDto } from '../dto/create-appointment.dto';
import { EmailService } from '../email/email.service';
import { VerificationService } from '../verification/verification.service';
import { SlotsService } from './slots.service';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
    private emailService: EmailService,
    private verificationService: VerificationService,
    private slotsService: SlotsService
  ) {}

  async create(
    createAppointmentDto: CreateAppointmentDto
  ): Promise<Appointment> {
    // Valider le créneau avant de créer le rendez-vous
    const slotValidation = await this.slotsService.validateSlot(
      createAppointmentDto.appointmentDate,
      createAppointmentDto.appointmentTime
    );

    if (!slotValidation.valid) {
      throw new BadRequestException(slotValidation.message);
    }

    // Crée le rendez-vous avec le statut "pending_verification"
    const appointmentData = {
      ...createAppointmentDto,
      status: 'pending_verification',
      emailVerified: false,
      phoneVerified: false,
    };

    const appointment = this.appointmentRepository.create(appointmentData);
    const savedAppointment = await this.appointmentRepository.save(appointment);

    // Lance le processus de vérification
    await this.verificationService.initiateVerification(savedAppointment.id);

    return savedAppointment;
  }

  async findAll(): Promise<Appointment[]> {
    return this.appointmentRepository.find({
      order: { appointmentDate: 'ASC', appointmentTime: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Appointment | null> {
    return this.appointmentRepository.findOne({ where: { id } });
  }

  async updateStatus(id: number, status: string): Promise<Appointment | null> {
    await this.appointmentRepository.update(id, { status });
    return this.findOne(id);
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
