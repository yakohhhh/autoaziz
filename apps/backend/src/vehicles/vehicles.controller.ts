import { Controller, Get, Post, Put, Param, Body, Query } from '@nestjs/common';
import { VehiclesService } from './vehicles.service';

@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Get()
  async findAll(@Query('skip') skip?: string, @Query('take') take?: string) {
    return this.vehiclesService.findAll(
      skip ? parseInt(skip) : 0,
      take ? parseInt(take) : 50,
    );
  }

  @Get('search')
  async search(@Query('q') query: string) {
    return this.vehiclesService.search(query);
  }

  @Get('stats')
  async getStats() {
    return this.vehiclesService.getStats();
  }

  @Get('registration/:registration')
  async findByRegistration(@Param('registration') registration: string) {
    return this.vehiclesService.findByRegistration(registration);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.vehiclesService.findOne(parseInt(id));
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: any) {
    return this.vehiclesService.update(parseInt(id), data);
  }
}
