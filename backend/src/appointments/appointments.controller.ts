import { Controller, Get, Post, Body, Patch, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from '../dto/create-appointment.dto';
import { VerifyAppointmentDto } from '../dto/verify-appointment.dto';
import { Appointment } from '../entities/appointment.entity';

@ApiTags('appointments')
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un nouveau rendez-vous' })
  @ApiResponse({
    status: 201,
    description: 'Rendez-vous créé avec succès',
    type: Appointment,
  })
  create(
    @Body() createAppointmentDto: CreateAppointmentDto
  ): Promise<Appointment> {
    return this.appointmentsService.create(createAppointmentDto);
  }

  @Post('verify')
  @ApiOperation({
    summary: 'Vérifier un rendez-vous avec le code reçu par email/SMS',
  })
  @ApiResponse({
    status: 200,
    description: 'Résultat de la vérification',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
      },
    },
  })
  async verifyAppointment(@Body() verifyDto: VerifyAppointmentDto) {
    return this.appointmentsService.verifyAppointment(
      verifyDto.appointmentId,
      verifyDto.verificationCode,
      verifyDto.verificationType
    );
  }

  @Post(':id/resend-code')
  @ApiOperation({ summary: 'Renvoyer le code de vérification' })
  @ApiResponse({ status: 200, description: 'Code renvoyé avec succès' })
  async resendVerificationCode(@Param('id') id: string) {
    await this.appointmentsService.resendVerificationCode(+id);
    return { message: 'Code de vérification renvoyé avec succès' };
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer tous les rendez-vous' })
  @ApiResponse({
    status: 200,
    description: 'Liste des rendez-vous',
    type: [Appointment],
  })
  findAll(): Promise<Appointment[]> {
    return this.appointmentsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un rendez-vous par ID' })
  @ApiResponse({
    status: 200,
    description: 'Rendez-vous trouvé',
    type: Appointment,
  })
  findOne(@Param('id') id: string): Promise<Appointment | null> {
    return this.appointmentsService.findOne(+id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: "Mettre à jour le statut d'un rendez-vous" })
  @ApiResponse({
    status: 200,
    description: 'Statut mis à jour',
    type: Appointment,
  })
  updateStatus(
    @Param('id') id: string,
    @Body() updateData: { status: string }
  ): Promise<Appointment | null> {
    return this.appointmentsService.updateStatus(+id, updateData.status);
  }
}
