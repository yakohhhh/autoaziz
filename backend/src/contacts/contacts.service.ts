import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contact } from '../entities/contact.entity';
import { CreateContactDto } from '../dto/create-contact.dto';
import { EmailService } from '../email/email.service';

@Injectable()
export class ContactsService {
  constructor(
    @InjectRepository(Contact)
    private contactRepository: Repository<Contact>,
    private emailService: EmailService,
  ) {}

  async create(createContactDto: CreateContactDto): Promise<Contact> {
    const contact = this.contactRepository.create(createContactDto);
    const savedContact = await this.contactRepository.save(contact);

    // Send confirmation email to user
    await this.emailService.sendContactConfirmation(
      createContactDto.email,
      createContactDto.name,
    );

    // Notify admin
    await this.emailService.notifyAdminNewContact(
      createContactDto.name,
      createContactDto.email,
      createContactDto.message,
    );

    return savedContact;
  }

  async findAll(): Promise<Contact[]> {
    return this.contactRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Contact> {
    return this.contactRepository.findOne({ where: { id } });
  }
}
