import { Injectable } from '@nestjs/common';
import { PrismaClient } from '../../../generated/prisma';
import { DashboardStatsDto } from '../dto/dashboard-stats.dto';

@Injectable()
export class AdminService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async getDashboardStats(): Promise<DashboardStatsDto> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Stats globales
    const totalAppointments = await this.prisma.appointment.count();
    const pendingAppointments = await this.prisma.appointment.count({
      where: { 
        status: { in: ['pending_verification', 'pending'] } 
      },
    });
    const completedAppointments = await this.prisma.appointment.count({
      where: { status: 'completed' },
    });
    const cancelledAppointments = await this.prisma.appointment.count({
      where: { status: 'cancelled' },
    });

    // Revenus (basés sur le type de véhicule)
    const appointments = await this.prisma.appointment.findMany({
      where: { 
        status: 'completed',
        createdAt: { gte: startOfMonth }
      },
      select: { vehicleType: true },
    });

    const revenue = appointments.reduce((total, apt) => {
      const prices = {
        'Voiture': 70,
        'Moto': 60,
        'Utilitaire': 80,
        '4x4': 75,
        'Camping-car': 90,
        'Collection': 80,
      };
      return total + (prices[apt.vehicleType] || 70);
    }, 0);

    // Nouveaux clients (basé sur les emails uniques)
    const newCustomers = await this.prisma.appointment.groupBy({
      by: ['email'],
      where: { createdAt: { gte: startOfMonth } },
    });

    return {
      totalAppointments,
      pendingAppointments,
      completedAppointments,
      cancelledAppointments,
      revenue,
      newCustomers: newCustomers.length,
    };
  }

  async getRecentAppointments() {
    const appointments = await this.prisma.appointment.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        vehicleType: true,
        vehicleBrand: true,
        appointmentDate: true,
        appointmentTime: true,
        status: true,
        createdAt: true,
      },
    });

    return appointments.map(apt => ({
      ...apt,
      fullName: `${apt.firstName} ${apt.lastName}`,
    }));
  }

  async getRevenueChart() {
    const currentYear = new Date().getFullYear();
    const lastYear = currentYear - 1;

    // Récupérer les données des 2 dernières années
    const appointments = await this.prisma.appointment.findMany({
      where: {
        status: 'completed',
        appointmentDate: {
          gte: new Date(`${lastYear}-01-01`),
        },
      },
      select: {
        appointmentDate: true,
        vehicleType: true,
      },
    });

    // Calcul du prix par véhicule
    const prices = {
      'Voiture': 70,
      'Moto': 60,
      'Utilitaire': 80,
      '4x4': 75,
      'Camping-car': 90,
      'Collection': 80,
    };

    // Initialiser les données mensuelles
    const monthlyRevenue = {
      [lastYear]: Array(12).fill(0),
      [currentYear]: Array(12).fill(0),
    };

    // Calculer les revenus par mois
    appointments.forEach(apt => {
      const date = new Date(apt.appointmentDate);
      const year = date.getFullYear();
      const month = date.getMonth();
      const price = prices[apt.vehicleType] || 70;
      
      if (monthlyRevenue[year]) {
        monthlyRevenue[year][month] += price;
      }
    });

    return {
      labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'],
      datasets: [
        {
          label: `Année ${lastYear}`,
          data: monthlyRevenue[lastYear],
        },
        {
          label: `Année ${currentYear}`,
          data: monthlyRevenue[currentYear],
        },
      ],
    };
  }

  async getVehicleTypeStats() {
    const appointments = await this.prisma.appointment.groupBy({
      by: ['vehicleType'],
      _count: { vehicleType: true },
    });

    return appointments.map(item => ({
      type: item.vehicleType,
      count: item._count.vehicleType,
    }));
  }

  async getTopTimeSlots() {
    const appointments = await this.prisma.appointment.groupBy({
      by: ['appointmentTime'],
      _count: { appointmentTime: true },
      orderBy: { _count: { appointmentTime: 'desc' } },
      take: 5,
    });

    return appointments.map(item => ({
      time: item.appointmentTime,
      count: item._count.appointmentTime,
    }));
  }

  async onModuleDestroy() {
    await this.prisma.$disconnect();
  }
}
