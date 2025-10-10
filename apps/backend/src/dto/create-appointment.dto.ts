import { IsEmail, IsNotEmpty, IsString, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAppointmentDto {
  @ApiProperty({ example: 'Jean Dupont' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'jean.dupont@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '0612345678' })
  @IsNotEmpty()
  @IsString()
  phone: string;

  @ApiProperty({ example: 'AB-123-CD' })
  @IsNotEmpty()
  @IsString()
  vehicleRegistration: string;

  @ApiProperty({ example: 'Voiture' })
  @IsNotEmpty()
  @IsString()
  vehicleType: string;

  @ApiProperty({ example: '2024-01-15' })
  @IsDateString()
  appointmentDate: string;

  @ApiProperty({ example: '10:00' })
  @IsNotEmpty()
  @IsString()
  appointmentTime: string;
}
