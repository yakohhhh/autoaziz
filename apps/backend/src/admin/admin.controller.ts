import { Controller, Get } from '@nestjs/common';
import { AdminService } from './admin.service';
import { DashboardStatsDto } from '../dto/dashboard-stats.dto';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  async getStats(): Promise<DashboardStatsDto> {
    return this.adminService.getDashboardStats();
  }

  @Get('stats/dashboard')
  async getDashboardStats(): Promise<DashboardStatsDto> {
    return this.adminService.getDashboardStats();
  }

  @Get('appointments/recent')
  async getRecentAppointments() {
    return this.adminService.getRecentAppointments();
  }

  @Get('revenue/chart')
  async getRevenueChart() {
    return this.adminService.getRevenueChart();
  }

  @Get('stats/vehicle-types')
  async getVehicleTypeStats() {
    return this.adminService.getVehicleTypeStats();
  }

  @Get('stats/top-timeslots')
  async getTopTimeSlots() {
    return this.adminService.getTopTimeSlots();
  }
}
