import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
// TODO: Importer les modules nécessaires
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { Appointment } from '../entities/appointment.entity';

@Module({
  // TODO: Ajouter les imports nécessaires
  // imports: [TypeOrmModule.forFeature([Appointment])],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
