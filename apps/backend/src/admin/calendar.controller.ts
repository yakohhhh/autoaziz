import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { CreateManualAppointmentDto } from '../dto/create-manual-appointment.dto';

@Controller('admin/calendar')
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Get('appointments')
  async getCalendarAppointments(
    @Query('start') start?: string,
    @Query('end') end?: string,
    @Query('status') status?: string
  ) {
    return this.calendarService.getCalendarAppointments(start, end, status);
  }

  @Patch('appointments/:id/status')
  async updateAppointmentStatus(
    @Param('id') id: string,
    @Body('status') status: string
  ) {
    return this.calendarService.updateAppointmentStatus(parseInt(id), status);
  }

  @Patch('appointments/:id')
  async updateAppointment(
    @Param('id') id: string,
    @Body()
    updateData: {
      appointmentDate?: string;
      selectedTime?: string;
      notes?: string;
      vehicleId?: number;
      price?: number;
    }
  ) {
    return this.calendarService.updateAppointment(parseInt(id), updateData);
  }

  @Delete('appointments/:id')
  async deleteAppointment(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @Body('note') note?: string,
    @Body('deletedBy') deletedBy?: string
  ) {
    return this.calendarService.deleteAppointment(
      parseInt(id),
      reason,
      note,
      deletedBy
    );
  }

  @Get('slots/availability')
  async getSlotAvailability(@Query('date') date: string) {
    return this.calendarService.getSlotAvailability(date);
  }

  @Post('appointments/manual')
  async createManualAppointment(@Body() dto: CreateManualAppointmentDto) {
    return this.calendarService.createManualAppointment(dto);
  }
}
