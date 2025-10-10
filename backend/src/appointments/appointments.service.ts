import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment } from '../entities/appointment.entity';
import { CreateAppointmentDto } from '../dto/create-appointment.dto';
import { EmailService } from '../email/email.service';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
    private emailService: EmailService,
  ) {}

  async create(createAppointmentDto: CreateAppointmentDto): Promise<Appointment> {
    const appointment = this.appointmentRepository.create(createAppointmentDto);
    const savedAppointment = await this.appointmentRepository.save(appointment);

    // Send confirmation email to user
    await this.emailService.sendAppointmentConfirmation(
      createAppointmentDto.email,
      createAppointmentDto.name,
      createAppointmentDto.appointmentDate,
      createAppointmentDto.appointmentTime,
    );

    // Notify admin
    await this.emailService.notifyAdminNewAppointment(
      createAppointmentDto.name,
      createAppointmentDto.email,
      createAppointmentDto.phone,
      createAppointmentDto.appointmentDate,
      createAppointmentDto.appointmentTime,
      createAppointmentDto.vehicleRegistration,
    );

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
}
