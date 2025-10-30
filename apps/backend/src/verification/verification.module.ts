import { Module } from '@nestjs/common';
import { VerificationService } from './verification.service';
import { EmailModule } from '../email/email.module';
import { SmsModule } from '../sms/sms.module';

@Module({
  imports: [EmailModule, SmsModule],
  providers: [VerificationService],
  exports: [VerificationService],
})
export class VerificationModule {}
