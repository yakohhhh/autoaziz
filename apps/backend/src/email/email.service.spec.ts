import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { EmailService } from './email.service';

describe('EmailService', () => {
  let service: EmailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string): string => {
              const config: Record<string, string> = {
                SMTP_HOST: 'smtp.gmail.com',
                SMTP_PORT: '587',
                SMTP_USER: 'test@example.com',
                SMTP_PASSWORD: 'test-password',
                FRONTEND_URL: 'http://localhost:3000',
              };
              return config[key] || '';
            }),
          },
        },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
