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
  @Column()
  vehicleRegistration: string;

  @ApiProperty()
  @Column()
  vehicleType: string;

  @ApiProperty()
  @Column('date')
  appointmentDate: Date;

  @ApiProperty()
  @Column()
  appointmentTime: string;

  @ApiProperty()
  @Column({ default: 'pending_verification' })
  status: string;

  @ApiProperty()
  @Column({ nullable: true })
  verificationCode: string;

  @ApiProperty()
  @Column({ nullable: true })
  emailVerified: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  phoneVerified: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  verificationCodeExpiry: Date;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;
}
