import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { CalendarController } from './calendar.controller';
import { CalendarService } from './calendar.service';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';

@Module({
  controllers: [AdminController, CalendarController, CustomersController],
  providers: [AdminService, CalendarService, CustomersService],
  exports: [AdminService, CalendarService, CustomersService],
})
export class AdminModule {}
