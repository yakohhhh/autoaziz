import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppointmentsService } from './appointments.service';
import { Appointment } from '../entities/appointment.entity';
import { EmailService } from '../email/email.service';
import { VerificationService } from '../verification/verification.service';
import { SlotsService } from './slots.service';

describe('AppointmentsService', () => {
  let service: AppointmentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppointmentsService,
        {
          provide: getRepositoryToken(Appointment),
          useClass: Repository,
        },
        {
          provide: EmailService,
          useValue: {
            sendVerificationEmail: jest.fn(),
          },
        },
        {
          provide: VerificationService,
          useValue: {
            generateVerificationCode: jest.fn(),
            verifyCode: jest.fn(),
          },
        },
        {
          provide: SlotsService,
          useValue: {
            getAvailableSlots: jest.fn(),
            isSlotAvailable: jest.fn(),
            reserveSlot: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AppointmentsService>(AppointmentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
