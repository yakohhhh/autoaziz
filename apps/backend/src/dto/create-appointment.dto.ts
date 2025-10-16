import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsDateString,
  IsOptional,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
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

  @ApiProperty({ example: 2020, description: 'Année de mise en circulation' })
  @IsNotEmpty()
  @IsNumber()
  @Min(1950)
  @Max(new Date().getFullYear() + 1)
  vehicleYear: number;

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
