import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VerificationService } from './verification.service';
import { Appointment } from '../entities/appointment.entity';
import { EmailModule } from '../email/email.module';
import { SmsModule } from '../sms/sms.module';

@Module({
  imports: [TypeOrmModule.forFeature([Appointment]), EmailModule, SmsModule],
  providers: [VerificationService],
  exports: [VerificationService],
})
export class VerificationModule {}
