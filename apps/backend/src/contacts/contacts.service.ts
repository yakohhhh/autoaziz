import { Injectable } from '@nestjs/common';
import { CreateContactDto } from '../dto/create-contact.dto';
import { EmailService } from '../email/email.service';
import { PrismaClient } from '../../generated/prisma';

@Injectable()
export class ContactsService {
  private prisma: PrismaClient;

  constructor(private emailService: EmailService) {
    this.prisma = new PrismaClient();
  }

  async create(createContactDto: CreateContactDto) {
    const contact = await this.prisma.contact.create({
      data: {
        name: createContactDto.name,
        email: createContactDto.email,
        message: createContactDto.message,
      },
    });

    await this.emailService.sendContactConfirmation(
      createContactDto.email,
      createContactDto.name
    );

    await this.emailService.notifyAdminNewContact(
      createContactDto.name,
      createContactDto.email,
      createContactDto.message
    );

    return contact;
  }

  async findAll() {
    return this.prisma.contact.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    return this.prisma.contact.findUnique({ where: { id } });
  }
}
