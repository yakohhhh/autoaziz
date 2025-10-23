import { Injectable } from '@nestjs/common';
import { DashboardStatsDto } from '../dto/dashboard-stats.dto';
// TODO: Importer Repository/PrismaService pour les vraies requêtes
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { Appointment } from '../entities/appointment.entity';

@Injectable()
export class AdminService {
  // TODO: Injecter les repositories
  // constructor(
  //   @InjectRepository(Appointment)
  //   private appointmentRepository: Repository<Appointment>,
  // ) {}

  async getDashboardStats(range: string): Promise<DashboardStatsDto> {
    // TODO: Remplacer par de vraies requêtes en base de données
    // const startDate = this.getStartDateFromRange(range);
    // const totalAppointments = await this.appointmentRepository.count({
    //   where: { createdAt: MoreThanOrEqual(startDate) }
    // });

    // Données mockées pour le développement
    return {
      totalAppointments: 18421,
      pendingAppointments: 156,
      completedAppointments: 8242,
      cancelledAppointments: 45,
      revenue: 4804,
      newCustomers: 11228,
    };
  }

  async getRecentAppointments() {
    // TODO: Implémenter la récupération des rendez-vous récents
    // return this.appointmentRepository.find({
    //   take: 10,
    //   order: { createdAt: 'DESC' },
    //   relations: ['contact'],
    // });

    return [];
  }

  async getRevenueChart(range: string) {
    // TODO: Implémenter les données du graphique
    // Calculer les revenus par période selon le range
    return {
      labels: [
        'Jan',
        'Fév',
        'Mar',
        'Avr',
        'Mai',
        'Juin',
        'Juil',
        'Août',
        'Sep',
        'Oct',
        'Nov',
        'Déc',
      ],
      datasets: [
        {
          label: 'Année 2024',
          data: [150, 200, 180, 220, 240, 210, 230, 260, 250, 280, 270, 300],
        },
        {
          label: 'Année 2025',
          data: [180, 210, 200, 240, 260, 230, 250, 280, 270, 156, 0, 0],
        },
      ],
    };
  }

  // private getStartDateFromRange(range: string): Date {
  //   const now = new Date();
  //   switch (range) {
  //     case 'today':
  //       return new Date(now.setHours(0, 0, 0, 0));
  //     case 'week':
  //       return new Date(now.setDate(now.getDate() - 7));
  //     case 'month':
  //       return new Date(now.setMonth(now.getMonth() - 1));
  //     case 'year':
  //       return new Date(now.setFullYear(now.getFullYear() - 1));
  //     default:
  //       return new Date(now.setMonth(now.getMonth() - 1));
  //   }
  // }
}
