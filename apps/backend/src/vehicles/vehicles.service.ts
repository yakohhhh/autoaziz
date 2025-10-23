import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '../../../generated/prisma';

@Injectable()
export class VehiclesService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  // Créer ou récupérer un véhicule existant
  async findOrCreate(data: {
    registration: string;
    type: string;
    brand: string;
    model: string;
    fuelType?: string;
    customerId: number;
  }) {
    // Chercher par immatriculation
    let vehicle = await this.prisma.vehicle.findUnique({
      where: { registration: data.registration },
    });

    if (vehicle) {
      // Mettre à jour les infos et le propriétaire
      vehicle = await this.prisma.vehicle.update({
        where: { id: vehicle.id },
        data: {
          type: data.type,
          brand: data.brand,
          model: data.model,
          fuelType: data.fuelType,
          customerId: data.customerId,
          updatedAt: new Date(),
        },
      });
    } else {
      // Créer nouveau véhicule
      vehicle = await this.prisma.vehicle.create({
        data,
      });
    }

    return vehicle;
  }

  async findAll(skip = 0, take = 50) {
    const [vehicles, total] = await Promise.all([
      this.prisma.vehicle.findMany({
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
          _count: {
            select: { appointments: true, inspections: true },
          },
        },
      }),
      this.prisma.vehicle.count(),
    ]);

    return {
      vehicles,
      total,
      page: Math.floor(skip / take) + 1,
      totalPages: Math.ceil(total / take),
    };
  }

  async findOne(id: number) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
      include: {
        customer: true,
        appointments: {
          orderBy: { appointmentDate: 'desc' },
          take: 10,
        },
        inspections: {
          orderBy: { createdAt: 'desc' },
          include: { defects: true },
        },
      },
    });

    if (!vehicle) {
      throw new NotFoundException(`Véhicule #${id} introuvable`);
    }

    return vehicle;
  }

  async findByRegistration(registration: string) {
    return this.prisma.vehicle.findUnique({
      where: { registration },
      include: {
        customer: true,
        appointments: {
          orderBy: { appointmentDate: 'desc' },
          take: 5,
        },
      },
    });
  }

  async update(
    id: number,
    data: Partial<{
      type: string;
      brand: string;
      model: string;
      fuelType: string;
      year: number;
      color: string;
      vin: string;
    }>,
  ) {
    return this.prisma.vehicle.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  async getStats() {
    const total = await this.prisma.vehicle.count();

    const byType = await this.prisma.vehicle.groupBy({
      by: ['type'],
      _count: { type: true },
    });

    const byBrand = await this.prisma.vehicle.groupBy({
      by: ['brand'],
      _count: { brand: true },
      orderBy: { _count: { brand: 'desc' } },
      take: 10,
    });

    return { total, byType, byBrand };
  }

  async search(query: string) {
    return this.prisma.vehicle.findMany({
      where: {
        OR: [
          { registration: { contains: query, mode: 'insensitive' } },
          { brand: { contains: query, mode: 'insensitive' } },
          { model: { contains: query, mode: 'insensitive' } },
          { vin: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 20,
      include: {
        customer: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
    });
  }

  async onModuleDestroy() {
    await this.prisma.$disconnect();
  }
}
