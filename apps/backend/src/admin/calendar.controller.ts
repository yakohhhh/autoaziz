import { Controller, Get, Patch, Param, Body, Query } from '@nestjs/common';
import { CalendarService } from './calendar.service';

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

  @Get('slots/availability')
  async getSlotAvailability(@Query('date') date: string) {
    return this.calendarService.getSlotAvailability(date);
  }
}
