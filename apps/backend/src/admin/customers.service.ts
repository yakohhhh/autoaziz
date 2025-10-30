import { Injectable } from '@nestjs/common';
import { PrismaClient } from '../../generated/prisma';

@Injectable()
export class CustomersService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async createCustomer(createCustomerDto: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    notes?: string;
    vehicleBrand?: string;
    vehicleModel?: string;
    licensePlate?: string;
  }) {
    // Crée le client
    const newCustomer = await this.prisma.customer.create({
      data: {
        firstName: createCustomerDto.firstName,
        lastName: createCustomerDto.lastName,
        email: createCustomerDto.email,
        phone: createCustomerDto.phone,
        notes: createCustomerDto.notes || '',
      },
    });

    // Si des informations de véhicule sont fournies, crée le véhicule
    let vehicle: {
      id: number;
      vehicleBrand: string;
      vehicleModel: string;
      licensePlate: string;
    } | null = null;
    if (
      createCustomerDto.vehicleBrand ||
      createCustomerDto.vehicleModel ||
      createCustomerDto.licensePlate
    ) {
      vehicle = await this.prisma.vehicle.create({
        data: {
          customerId: newCustomer.id,
          vehicleBrand: createCustomerDto.vehicleBrand || '',
          vehicleModel: createCustomerDto.vehicleModel || '',
          licensePlate: createCustomerDto.licensePlate || '',
          vehicleType: 'Voiture',
          fuelType: null,
        },
      });
    }

    return {
      id: newCustomer.id,
      firstName: newCustomer.firstName,
      lastName: newCustomer.lastName,
      fullName: `${newCustomer.firstName} ${newCustomer.lastName}`,
      email: newCustomer.email,
      phone: newCustomer.phone,
      notes: newCustomer.notes ?? '',
      vehicle: vehicle
        ? {
            id: vehicle.id,
            vehicleBrand: String(vehicle.vehicleBrand),
            vehicleModel: String(vehicle.vehicleModel),
            licensePlate: String(vehicle.licensePlate),
          }
        : null,
      createdAt: newCustomer.createdAt,
    };
  }

  async getAllCustomers() {
    const customers = await this.prisma.customer.findMany({
      include: {
        vehicles: true,
        appointments: {
          where: {
            deletedAt: null, // Exclure les RDV supprimés
          },
          orderBy: { appointmentDate: 'desc' },
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

    return customers.map(customer => {
      // Calcul des statistiques réelles basées sur actualStatus
      const completedCount = customer.appointments.filter(
        apt => apt.actualStatus === 'completed'
      ).length;
      const cancelledCount = customer.appointments.filter(
        apt => apt.actualStatus === 'cancelled'
      ).length;
      const noShowCount = customer.appointments.filter(
        apt => apt.actualStatus === 'no_show'
      ).length;

      return {
        id: customer.id,
        firstName: customer.firstName,
        lastName: customer.lastName,
        fullName: `${customer.firstName} ${customer.lastName}`,
        email: customer.email,
        phone: customer.phone,
        notes: customer.notes,
        statistics: {
          totalVisits: completedCount,
          totalCancellations: cancelledCount,
          totalNoShows: noShowCount,
          totalSpent: customer.totalSpent,
          totalAppointments: customer.appointments.length,
          totalVehicles: customer._count.vehicles,
        },
        vehicles: customer.vehicles,
        appointments: customer.appointments,
        createdAt: customer.createdAt,
      };
    });
  }

  async getCustomerById(id: number) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: {
        vehicles: true,
        appointments: {
          where: {
            deletedAt: null, // Exclure les RDV supprimés
          },
          orderBy: { appointmentDate: 'desc' },
        },
      },
    });

    if (!customer) {
      return null;
    }

    // Calcul des statistiques réelles basées sur actualStatus
    const completedCount = customer.appointments.filter(
      apt => apt.actualStatus === 'completed'
    ).length;
    const cancelledCount = customer.appointments.filter(
      apt => apt.actualStatus === 'cancelled'
    ).length;
    const noShowCount = customer.appointments.filter(
      apt => apt.actualStatus === 'no_show'
    ).length;

    return {
      id: customer.id,
      firstName: customer.firstName,
      lastName: customer.lastName,
      fullName: `${customer.firstName} ${customer.lastName}`,
      email: customer.email,
      phone: customer.phone,
      notes: customer.notes,
      statistics: {
        totalVisits: completedCount,
        totalCancellations: cancelledCount,
        totalNoShows: noShowCount,
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

  async searchCustomersByName(firstName?: string, lastName?: string) {
    if (!firstName && !lastName) {
      return [];
    }

    const where: any = {};
    const conditions: any[] = [];

    if (firstName) {
      conditions.push({
        firstName: { contains: firstName, mode: 'insensitive' },
      });
    }

    if (lastName) {
      conditions.push({
        lastName: { contains: lastName, mode: 'insensitive' },
      });
    }

    // Chercher les clients qui matchent le prénom OU le nom (ou les deux)
    if (conditions.length > 0) {
      where.OR = conditions;
    }

    const customers = await this.prisma.customer.findMany({
      where,
      include: {
        vehicles: true,
        appointments: {
          where: {
            deletedAt: null,
          },
          orderBy: { appointmentDate: 'desc' },
          take: 5, // Limiter aux 5 derniers RDV
        },
        _count: {
          select: { appointments: true },
        },
      },
      take: 10, // Max 10 suggestions
      orderBy: { createdAt: 'desc' },
    });

    return customers.map(customer => ({
      id: customer.id,
      firstName: customer.firstName,
      lastName: customer.lastName,
      fullName: `${customer.firstName} ${customer.lastName}`,
      email: customer.email,
      phone: customer.phone,
      vehicles: customer.vehicles.map(v => ({
        id: v.id,
        licensePlate: v.licensePlate,
        vehicleType: v.vehicleType,
        vehicleBrand: v.vehicleBrand,
        vehicleModel: v.vehicleModel,
        fuelType: v.fuelType,
      })),
      lastAppointments: customer.appointments.map(apt => ({
        id: apt.id,
        date: apt.appointmentDate,
        time: apt.appointmentTime,
        status: apt.status,
      })),
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
    appointmentStatus: string
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

  async deleteCustomer(
    id: number,
    reason: string,
    note?: string,
    deletedBy?: string
  ) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: {
        appointments: true,
        vehicles: true,
      },
    });

    if (!customer) {
      throw new Error(`Client #${id} introuvable`);
    }

    // Enregistrer la suppression dans la table de tracking
    await this.prisma.customerDeletion.create({
      data: {
        customerId: id,
        customerName: `${customer.firstName} ${customer.lastName}`,
        email: customer.email,
        phone: customer.phone,
        deletionReason: reason,
        deletionNote: note || '',
        appointmentsCount: customer.appointments.length,
        deletedBy: deletedBy || 'Admin',
      },
    });

    // Supprimer tous les RDV du client (soft delete)
    await this.prisma.appointment.updateMany({
      where: { customerId: id },
      data: {
        deletedAt: new Date(),
        deletionReason: 'client_deleted',
        deletionNote: `Client supprimé: ${reason}`,
        status: 'cancelled', // Libère les créneaux
      },
    });

    // Supprimer le client et ses véhicules (cascade)
    await this.prisma.customer.delete({
      where: { id },
    });

    return {
      success: true,
      message: 'Client supprimé avec succès',
      reason,
      customerName: `${customer.firstName} ${customer.lastName}`,
      appointmentsFreed: customer.appointments.length,
      vehiclesDeleted: customer.vehicles.length,
    };
  }

  async updateCustomer(
    id: number,
    updateData: {
      firstName?: string;
      lastName?: string;
      email?: string;
      phone?: string;
      notes?: string;
    }
  ) {
    const customer = await this.prisma.customer.update({
      where: { id },
      data: updateData,
    });

    return {
      success: true,
      message: 'Client mis à jour avec succès',
      customer: {
        id: customer.id,
        firstName: customer.firstName,
        lastName: customer.lastName,
        fullName: `${customer.firstName} ${customer.lastName}`,
        email: customer.email,
        phone: customer.phone,
        notes: customer.notes,
      },
    };
  }

  async addVehicle(
    customerId: number,
    vehicleData: {
      licensePlate: string;
      vehicleType: string;
      vehicleBrand: string;
      vehicleModel: string;
      fuelType?: string;
    }
  ) {
    const vehicle = await this.prisma.vehicle.create({
      data: {
        customerId,
        ...vehicleData,
      },
    });

    return {
      success: true,
      message: 'Véhicule ajouté avec succès',
      vehicle,
    };
  }

  async updateVehicle(
    vehicleId: number,
    vehicleData: {
      licensePlate?: string;
      vehicleType?: string;
      vehicleBrand?: string;
      vehicleModel?: string;
      fuelType?: string;
    }
  ) {
    const vehicle = await this.prisma.vehicle.update({
      where: { id: vehicleId },
      data: vehicleData,
    });

    return {
      success: true,
      message: 'Véhicule mis à jour avec succès',
      vehicle,
    };
  }

  async deleteVehicle(vehicleId: number) {
    await this.prisma.vehicle.delete({
      where: { id: vehicleId },
    });

    return {
      success: true,
      message: 'Véhicule supprimé avec succès',
    };
  }

  async onModuleDestroy() {
    await this.prisma.$disconnect();
  }
}
