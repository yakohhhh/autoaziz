import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { CalendarController } from './calendar.controller';
import { CalendarService } from './calendar.service';

@Module({
  controllers: [AdminController, CalendarController],
  providers: [AdminService, CalendarService],
  exports: [AdminService, CalendarService],
})
export class AdminModule {}
