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

  @Get('blocked-slots')
  async getBlockedSlots(
    @Query('start') start?: string,
    @Query('end') end?: string
  ) {
    return this.calendarService.getBlockedSlots(start, end);
  }

  @Post('blocked-slots')
  async createBlockedSlots(
    @Body()
    data: {
      slots: Array<{ date: string; time: string }>;
      reason?: string;
    }
  ) {
    return this.calendarService.createBlockedSlots(data.slots, data.reason);
  }

  @Delete('blocked-slots/:id')
  async deleteBlockedSlot(@Param('id') id: string) {
    return this.calendarService.deleteBlockedSlot(parseInt(id));
  }
}
