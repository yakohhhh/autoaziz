import { Controller, Get, Post, Put, Param, Body, Query } from '@nestjs/common';
import { CustomersService } from './customers.service';

@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  async findAll(@Query('skip') skip?: string, @Query('take') take?: string) {
    return this.customersService.findAll(
      skip ? parseInt(skip) : 0,
      take ? parseInt(take) : 50,
    );
  }

  @Get('search')
  async search(@Query('q') query: string) {
    return this.customersService.search(query);
  }

  @Get('stats')
  async getStats() {
    return this.customersService.getStats();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.customersService.findOne(parseInt(id));
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: any) {
    return this.customersService.update(parseInt(id), data);
  }
}
