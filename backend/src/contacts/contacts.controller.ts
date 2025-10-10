import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ContactsService } from './contacts.service';
import { CreateContactDto } from '../dto/create-contact.dto';
import { Contact } from '../entities/contact.entity';

@ApiTags('contacts')
@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new contact message' })
  @ApiResponse({ status: 201, description: 'Contact created successfully', type: Contact })
  create(@Body() createContactDto: CreateContactDto): Promise<Contact> {
    return this.contactsService.create(createContactDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all contact messages' })
  @ApiResponse({ status: 200, description: 'List of all contacts', type: [Contact] })
  findAll(): Promise<Contact[]> {
    return this.contactsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a contact message by id' })
  @ApiResponse({ status: 200, description: 'Contact details', type: Contact })
  findOne(@Param('id') id: string): Promise<Contact> {
    return this.contactsService.findOne(+id);
  }
}
