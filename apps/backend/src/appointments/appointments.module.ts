import { Module } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';
import { SlotsService } from './slots.service';
import { EmailModule } from '../email/email.module';
import { VerificationModule } from '../verification/verification.module';

@Module({
  imports: [EmailModule, VerificationModule],
  providers: [AppointmentsService, SlotsService],
  controllers: [AppointmentsController],
})
export class AppointmentsModule {}
