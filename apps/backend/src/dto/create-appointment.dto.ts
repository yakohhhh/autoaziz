import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsDateString,
  IsOptional,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAppointmentDto {
  @ApiProperty({ example: 'Jean' })
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Dupont' })
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiProperty({ example: 'jean.dupont@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '+33612345678' })
  @IsNotEmpty()
  @IsString()
  @Matches(/^\+33[1-9]\d{8}$/, {
    message:
      'Le numéro de téléphone doit être au format français: +33 suivi de 9 chiffres',
  })
  phone: string;

  @ApiProperty({ example: 'AB-123-CD' })
  @IsNotEmpty()
  @IsString()
  vehicleRegistration: string;

  @ApiProperty({
    example: 'Voiture',
    description: 'Type de véhicule: Voiture, Moto, Camionnette, Collection',
  })
  @IsNotEmpty()
  @IsString()
  vehicleType: string;

  @ApiProperty({ example: 'Renault', description: 'Marque du véhicule' })
  @IsNotEmpty()
  @IsString()
  vehicleBrand: string;

  @ApiProperty({ example: 'Clio', description: 'Modèle du véhicule' })
  @IsNotEmpty()
  @IsString()
  vehicleModel: string;

  @ApiProperty({
    example: 'Essence',
    description: 'Type de carburant',
    required: false,
  })
  @IsOptional()
  @IsString()
  fuelType?: string;

  @ApiProperty({ example: '2024-01-15' })
  @IsDateString()
  appointmentDate: string;

  @ApiProperty({ example: '10:00' })
  @IsNotEmpty()
  @IsString()
  appointmentTime: string;

  @ApiProperty({ example: 'Première visite', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
