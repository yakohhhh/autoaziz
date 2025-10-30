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

  @Get('search-by-name')
  async searchCustomersByName(
    @Query('firstName') firstName?: string,
    @Query('lastName') lastName?: string
  ) {
    return this.customersService.searchCustomersByName(firstName, lastName);
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

  @Patch(':id')
  async updateCustomer(
    @Param('id') id: string,
    @Body()
    updateData: {
      firstName?: string;
      lastName?: string;
      email?: string;
      phone?: string;
      notes?: string;
    }
  ) {
    return this.customersService.updateCustomer(parseInt(id), updateData);
  }

  @Post(':id/vehicles')
  async addVehicle(
    @Param('id') customerId: string,
    @Body()
    vehicleData: {
      licensePlate: string;
      vehicleType: string;
      vehicleBrand: string;
      vehicleModel: string;
      fuelType?: string;
    }
  ) {
    return this.customersService.addVehicle(parseInt(customerId), vehicleData);
  }

  @Patch(':customerId/vehicles/:vehicleId')
  async updateVehicle(
    @Param('customerId') customerId: string,
    @Param('vehicleId') vehicleId: string,
    @Body()
    vehicleData: {
      licensePlate?: string;
      vehicleType?: string;
      vehicleBrand?: string;
      vehicleModel?: string;
      fuelType?: string;
    }
  ) {
    return this.customersService.updateVehicle(
      parseInt(vehicleId),
      vehicleData
    );
  }

  @Delete(':customerId/vehicles/:vehicleId')
  async deleteVehicle(
    @Param('customerId') customerId: string,
    @Param('vehicleId') vehicleId: string
  ) {
    return this.customersService.deleteVehicle(parseInt(vehicleId));
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
