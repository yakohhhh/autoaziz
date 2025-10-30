import { Injectable, Logger } from '@nestjs/common';
import { EmailService } from '../email/email.service';
import { SmsService } from '../sms/sms.service';
import { PrismaClient } from '../../generated/prisma';

@Injectable()
export class VerificationService {
  private readonly logger = new Logger(VerificationService.name);
  private prisma: PrismaClient;

  constructor(
    private emailService: EmailService,
    private smsService: SmsService
  ) {
    this.prisma = new PrismaClient();
  }

  generateVerificationCode(): string {
    // Génère un code à 6 chiffres
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async initiateVerification(appointmentId: number): Promise<void> {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment) {
      throw new Error('Rendez-vous non trouvé');
    }

    // Génère un nouveau code de vérification
    const verificationCode = this.generateVerificationCode();
    const expiryTime = new Date();
    expiryTime.setMinutes(expiryTime.getMinutes() + 10); // Expire dans 10 minutes

    // Met à jour le rendez-vous avec le code (UNE SEULE BASE - Prisma)
    await this.prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        verificationCode,
        verificationCodeExpiry: expiryTime,
        emailVerified: false,
        phoneVerified: false,
        status: 'pending_verification',
      },
    });

    // Envoie le code par email et SMS
    const fullName = `${appointment.firstName} ${appointment.lastName}`;
    await Promise.all([
      this.emailService.sendVerificationEmail(
        appointment.email,
        fullName,
        verificationCode,
        appointmentId
      ),
      this.smsService.sendVerificationSms(appointment.phone, verificationCode),
    ]);

    this.logger.log(`Verification initiated for appointment ${appointmentId}`);
  }

  async verifyCode(
    appointmentId: number,
    code: string,
    verificationType: 'email' | 'phone'
  ): Promise<{ success: boolean; message: string }> {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment) {
      return { success: false, message: 'Rendez-vous non trouvé' };
    }

    // Vérifie si le code est valide
    if (appointment.verificationCode !== code) {
      return { success: false, message: 'Code de vérification incorrect' };
    }

    // Vérifie si le code n'a pas expiré
    if (
      !appointment.verificationCodeExpiry ||
      new Date() > appointment.verificationCodeExpiry
    ) {
      return { success: false, message: 'Code de vérification expiré' };
    }

    // Marque le type de vérification comme validé
    const updateData: any = {};
    if (verificationType === 'email') {
      updateData.emailVerified = true;
    } else {
      updateData.phoneVerified = true;
    }

    await this.prisma.appointment.update({
      where: { id: appointmentId },
      data: updateData,
    });

    // Vérifie si les deux vérifications sont complètes
    const updatedAppointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!updatedAppointment) {
      return {
        success: false,
        message: 'Rendez-vous non trouvé après mise à jour',
      };
    }

    if (updatedAppointment.emailVerified && updatedAppointment.phoneVerified) {
      // Toutes les vérifications sont complètes, confirme le rendez-vous
      await this.confirmAppointment(appointmentId);
      return {
        success: true,
        message: 'Rendez-vous confirmé avec succès !',
      };
    }

    const pendingVerification = updatedAppointment.emailVerified
      ? 'téléphone'
      : 'email';

    return {
      success: true,
      message: `Vérification ${verificationType} réussie. Veuillez également vérifier votre ${pendingVerification}.`,
    };
  }

  private async confirmAppointment(appointmentId: number): Promise<void> {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment) {
      throw new Error('Rendez-vous non trouvé pour confirmation');
    }

    // Met à jour le statut (UNE SEULE BASE - Prisma uniquement)
    await this.prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        status: 'confirmed',
        verificationCode: null, // Supprime le code pour sécurité
        verificationCodeExpiry: null,
        emailVerified: true,
        phoneVerified: true,
      },
    });

    console.log(`✅ Appointment ${appointmentId} confirmed in Prisma`);

    // Envoie l'email de confirmation final
    const fullName = `${appointment.firstName} ${appointment.lastName}`;
    await this.emailService.sendAppointmentConfirmedEmail(
      appointment.email,
      fullName,
      appointment.appointmentDate.toISOString().split('T')[0],
      appointment.appointmentTime
    );

    // Notifie l'admin
    await this.emailService.notifyAdminNewAppointment(
      fullName,
      appointment.email,
      appointment.phone,
      appointment.appointmentDate.toISOString().split('T')[0],
      appointment.appointmentTime,
      appointment.vehicleRegistration
    );

    this.logger.log(`Appointment ${appointmentId} confirmed successfully`);
  }

  async resendVerificationCode(appointmentId: number): Promise<void> {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment) {
      throw new Error('Rendez-vous non trouvé');
    }

    if (appointment.status === 'confirmed') {
      throw new Error('Ce rendez-vous est déjà confirmé');
    }

    // Génère un nouveau code
    await this.initiateVerification(appointmentId);
  }
}
