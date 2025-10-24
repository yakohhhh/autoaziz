import { Controller, Get, Param, Query, Patch, Body } from '@nestjs/common';
import { CustomersService } from './customers.service';

@Controller('admin/customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  async getAllCustomers() {
    return this.customersService.getAllCustomers();
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
}
