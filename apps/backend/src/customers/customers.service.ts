import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '../../../generated/prisma';

@Injectable()
export class CustomersService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  // Créer ou récupérer un client existant
  async findOrCreate(data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  }) {
    // Chercher par email ou téléphone
    let customer = await this.prisma.customer.findFirst({
      where: {
        OR: [{ email: data.email }, { phone: data.phone }],
      },
    });

    if (customer) {
      // Mettre à jour les infos si différentes
      customer = await this.prisma.customer.update({
        where: { id: customer.id },
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          updatedAt: new Date(),
        },
      });
    } else {
      // Créer nouveau client
      customer = await this.prisma.customer.create({
        data,
      });
    }

    return customer;
  }

  async findAll(skip = 0, take = 50) {
    const [customers, total] = await Promise.all([
      this.prisma.customer.findMany({
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { appointments: true, vehicles: true },
          },
        },
      }),
      this.prisma.customer.count(),
    ]);

    return { customers, total, page: Math.floor(skip / take) + 1, totalPages: Math.ceil(total / take) };
  }

  async findOne(id: number) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: {
        vehicles: true,
        appointments: {
          orderBy: { appointmentDate: 'desc' },
          take: 10,
          include: { vehicle: true },
        },
      },
    });

    if (!customer) {
      throw new NotFoundException(`Client #${id} introuvable`);
    }

    return customer;
  }

  async update(id: number, data: Partial<{
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
  }>) {
    return this.prisma.customer.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  async getStats() {
    const total = await this.prisma.customer.count();
    const thisMonth = await this.prisma.customer.count({
      where: {
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    });

    const topCustomers = await this.prisma.customer.findMany({
      take: 10,
      include: {
        _count: { select: { appointments: true } },
      },
      orderBy: {
        appointments: { _count: 'desc' },
      },
    });

    return { total, thisMonth, topCustomers };
  }

  async search(query: string) {
    return this.prisma.customer.findMany({
      where: {
        OR: [
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
          { phone: { contains: query } },
        ],
      },
      take: 20,
      include: {
        _count: { select: { appointments: true, vehicles: true } },
      },
    });
  }

  async onModuleDestroy() {
    await this.prisma.$disconnect();
  }
}
