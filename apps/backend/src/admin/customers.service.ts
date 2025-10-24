import { Injectable } from '@nestjs/common';
import { PrismaClient } from '../../generated/prisma';

@Injectable()
export class CustomersService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async getAllCustomers() {
    const customers = await this.prisma.customer.findMany({
      include: {
        vehicles: true,
        appointments: {
          orderBy: { appointmentDate: 'desc' },
          take: 10,
        },
        _count: {
          select: {
            appointments: true,
            vehicles: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return customers.map(customer => ({
      id: customer.id,
      firstName: customer.firstName,
      lastName: customer.lastName,
      fullName: `${customer.firstName} ${customer.lastName}`,
      email: customer.email,
      phone: customer.phone,
      notes: customer.notes,
      statistics: {
        totalVisits: customer.totalVisits,
        totalCancellations: customer.totalCancellations,
        totalNoShows: customer.totalNoShows,
        totalSpent: customer.totalSpent,
        totalAppointments: customer._count.appointments,
        totalVehicles: customer._count.vehicles,
      },
      vehicles: customer.vehicles,
      recentAppointments: customer.appointments,
      createdAt: customer.createdAt,
    }));
  }

  async getCustomerById(id: number) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: {
        vehicles: true,
        appointments: {
          orderBy: { appointmentDate: 'desc' },
        },
      },
    });

    if (!customer) {
      return null;
    }

    return {
      id: customer.id,
      firstName: customer.firstName,
      lastName: customer.lastName,
      fullName: `${customer.firstName} ${customer.lastName}`,
      email: customer.email,
      phone: customer.phone,
      notes: customer.notes,
      statistics: {
        totalVisits: customer.totalVisits,
        totalCancellations: customer.totalCancellations,
        totalNoShows: customer.totalNoShows,
        totalSpent: customer.totalSpent,
      },
      vehicles: customer.vehicles,
      appointments: customer.appointments,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
    };
  }

  async searchCustomers(query: string) {
    const customers = await this.prisma.customer.findMany({
      where: {
        OR: [
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
          { phone: { contains: query } },
        ],
      },
      include: {
        vehicles: true,
        _count: {
          select: { appointments: true },
        },
      },
      take: 10,
    });

    return customers.map(customer => ({
      id: customer.id,
      firstName: customer.firstName,
      lastName: customer.lastName,
      fullName: `${customer.firstName} ${customer.lastName}`,
      email: customer.email,
      phone: customer.phone,
      vehicles: customer.vehicles,
      totalAppointments: customer._count.appointments,
    }));
  }

  async updateCustomerNotes(id: number, notes: string) {
    const customer = await this.prisma.customer.update({
      where: { id },
      data: { notes },
    });

    return {
      success: true,
      message: 'Notes mises à jour',
      customer,
    };
  }

  async updateCustomerStatistics(
    customerId: number,
    appointmentStatus: string,
  ) {
    const updates: Record<string, { increment: number }> = {};

    if (appointmentStatus === 'completed') {
      updates.totalVisits = { increment: 1 };
    } else if (appointmentStatus === 'cancelled') {
      updates.totalCancellations = { increment: 1 };
    } else if (appointmentStatus === 'no_show') {
      updates.totalNoShows = { increment: 1 };
    }

    if (Object.keys(updates).length > 0) {
      return await this.prisma.customer.update({
        where: { id: customerId },
        data: updates,
      });
    }
  }

  async onModuleDestroy() {
    await this.prisma.$disconnect();
  }
}
