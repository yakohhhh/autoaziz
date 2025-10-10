import { IsString, IsNumber, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyAppointmentDto {
  @ApiProperty({ description: 'ID du rendez-vous' })
  @IsNumber()
  appointmentId: number;

  @ApiProperty({ description: 'Code de vérification à 6 chiffres' })
  @IsString()
  verificationCode: string;

  @ApiProperty({
    description: 'Type de vérification',
    enum: ['email', 'phone'],
  })
  @IsString()
  @IsIn(['email', 'phone'])
  verificationType: 'email' | 'phone';
}
