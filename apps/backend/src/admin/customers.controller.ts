import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Patch,
  Body,
} from '@nestjs/common';
import { CustomersService } from './customers.service';

@Controller('admin/customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  async getAllCustomers() {
    return this.customersService.getAllCustomers();
  }

  @Post()
  async createCustomer(
    @Body()
    createCustomerDto: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      notes?: string;
      vehicleBrand?: string;
      vehicleModel?: string;
      licensePlate?: string;
    }
  ) {
    return this.customersService.createCustomer(createCustomerDto);
  }

  @Get('search')
  async searchCustomers(@Query('q') query: string) {
    return this.customersService.searchCustomers(query);
  }

  @Get(':id')
  async getCustomerById(@Param('id') id: string) {
    return this.customersService.getCustomerById(parseInt(id));
  }

  @Patch(':id/notes')
  async updateCustomerNotes(
    @Param('id') id: string,
    @Body('notes') notes: string
  ) {
    return this.customersService.updateCustomerNotes(parseInt(id), notes);
  }

  @Delete(':id')
  async deleteCustomer(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @Body('note') note?: string,
    @Body('deletedBy') deletedBy?: string
  ) {
    return this.customersService.deleteCustomer(
      parseInt(id),
      reason,
      note,
      deletedBy
    );
  }
}
