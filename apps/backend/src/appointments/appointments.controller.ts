import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { AppointmentsService } from './appointments.service';
import { SlotsService } from './slots.service';
import { CreateAppointmentDto } from '../dto/create-appointment.dto';
import { VerifyAppointmentDto } from '../dto/verify-appointment.dto';
import { AvailableSlotsResponseDto } from '../dto/available-slots.dto';

@ApiTags('appointments')
@Controller('appointments')
export class AppointmentsController {
  constructor(
    private readonly appointmentsService: AppointmentsService,
    private readonly slotsService: SlotsService
  ) {}

  @Get('available-slots')
  @ApiOperation({
    summary: 'Récupérer les créneaux disponibles pour une semaine',
  })
  @ApiQuery({
    name: 'weekOffset',
    required: false,
    type: Number,
    description:
      'Décalage en semaines (0 = semaine actuelle, 1 = semaine suivante, etc.)',
  })
  @ApiResponse({
    status: 200,
    description: 'Créneaux disponibles',
    type: AvailableSlotsResponseDto,
  })
  async getAvailableSlots(
    @Query('weekOffset') weekOffset?: string
  ): Promise<AvailableSlotsResponseDto> {
    const offset = weekOffset ? parseInt(weekOffset, 10) : 0;
    return this.slotsService.getAvailableSlots(offset);
  }

  @Post()
  @ApiOperation({ summary: 'Créer un nouveau rendez-vous' })
  @ApiResponse({
    status: 201,
    description: 'Rendez-vous créé avec succès',
  })
  async create(@Body() createAppointmentDto: CreateAppointmentDto) {
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
  })
  findAll() {
    return this.appointmentsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un rendez-vous par ID' })
  @ApiResponse({
    status: 200,
    description: 'Rendez-vous trouvé',
  })
  findOne(@Param('id') id: string) {
    return this.appointmentsService.findOne(+id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: "Mettre à jour le statut d'un rendez-vous" })
  @ApiResponse({
    status: 200,
    description: 'Statut mis à jour',
  })
  updateStatus(
    @Param('id') id: string,
    @Body() updateData: { status: string }
  ) {
    return this.appointmentsService.updateStatus(+id, updateData.status);
  }
}
