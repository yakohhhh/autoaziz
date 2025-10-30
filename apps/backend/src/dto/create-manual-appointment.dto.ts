import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  Matches,
} from 'class-validator';

export enum ManualAppointmentSource {
  PHONE = 'phone',
  CENTER = 'manual',
}

export enum VehicleType {
  VOITURE = 'Voiture',
  MOTO = 'Moto',
  QUAD = 'Quad',
  SCOOTER = 'Scooter',
  UTILITAIRE = 'Utilitaire léger',
}

export enum FuelType {
  ESSENCE = 'Essence',
  DIESEL = 'Diesel',
  HYBRIDE = 'Hybride',
  ELECTRIQUE = 'Électrique',
  GPL = 'GPL',
}

export class CreateManualAppointmentDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/, {
    message: 'Le numéro de téléphone doit être un numéro français valide',
  })
  phone: string;

  @IsString()
  @IsNotEmpty()
  licensePlate: string;

  @IsEnum(VehicleType)
  @IsNotEmpty()
  vehicleType: VehicleType;

  @IsString()
  @IsNotEmpty()
  vehicleBrand: string;

  @IsString()
  @IsNotEmpty()
  vehicleModel: string;

  @IsEnum(FuelType)
  @IsNotEmpty()
  fuelType: FuelType;

  @IsString()
  @IsNotEmpty()
  appointmentDate: string; // Format: ISO 8601

  @IsEnum(ManualAppointmentSource)
  @IsNotEmpty()
  source: ManualAppointmentSource;

  @IsString()
  @IsOptional()
  notes?: string;
}
