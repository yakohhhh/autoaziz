import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('appointments')
export class Appointment {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column()
  name: string;

  @ApiProperty()
  @Column()
  email: string;

  @ApiProperty()
  @Column()
  phone: string;

  @ApiProperty()
  @Column({ name: 'vehicleRegistration' })
  vehicleRegistration: string;

  @ApiProperty()
  @Column({ name: 'vehicleType' })
  vehicleType: string;

  @ApiProperty()
  @Column({ name: 'vehicleBrand' })
  vehicleBrand: string;

  @ApiProperty()
  @Column({ name: 'vehicleModel' })
  vehicleModel: string;

  @ApiProperty()
  @Column({ name: 'vehicleYear' })
  vehicleYear: number;

  @ApiProperty()
  @Column({ name: 'fuelType', nullable: true })
  fuelType: string;

  @ApiProperty()
  @Column({ type: 'date', name: 'appointmentDate' })
  appointmentDate: Date;

  @ApiProperty()
  @Column({ name: 'appointmentTime' })
  appointmentTime: string;

  @ApiProperty()
  @Column({ default: 'pending_verification' })
  status: string;

  @ApiProperty()
  @Column({ name: 'verificationCode', nullable: true })
  verificationCode: string;

  @ApiProperty()
  @Column({ name: 'emailVerified', nullable: true })
  emailVerified: boolean;

  @ApiProperty()
  @Column({ name: 'phoneVerified', nullable: true })
  phoneVerified: boolean;

  @ApiProperty()
  @Column({ name: 'verificationCodeExpiry', nullable: true })
  verificationCodeExpiry: Date;

  @ApiProperty()
  @Column({ type: 'text', nullable: true })
  notes: string;

  @ApiProperty()
  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;
}
