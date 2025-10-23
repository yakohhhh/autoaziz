import { Controller, Get, Query } from '@nestjs/common';
import { AdminService } from './admin.service';
import { DashboardStatsDto } from '../dto/dashboard-stats.dto';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  async getStats(
    @Query('range') range: string = 'month',
  ): Promise<DashboardStatsDto> {
    return this.adminService.getDashboardStats(range);
  }

  @Get('appointments/recent')
  async getRecentAppointments() {
    return this.adminService.getRecentAppointments();
  }

  @Get('revenue/chart')
  async getRevenueChart(@Query('range') range: string = 'month') {
    return this.adminService.getRevenueChart(range);
  }
}
