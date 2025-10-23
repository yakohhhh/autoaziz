import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST'),
      port: parseInt(this.configService.get<string>('SMTP_PORT') || '587'),
      secure: this.configService.get<string>('SMTP_PORT') === '465',
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASSWORD'),
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
    void this.verifyConnection();
  }

  private async verifyConnection(): Promise<void> {
    try {
      await this.transporter.verify();
      this.logger.log('SMTP connection verified successfully');
    } catch (error) {
      this.logger.error('SMTP connection failed:', (error as Error).message);
      this.logger.error('Please check your email configuration in .env file');
      this.logger.error(
        'For Gmail, you need to use an App Password instead of your regular password'
      );
    }
  }

  async sendContactConfirmation(to: string, name: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.configService.get<string>('SMTP_FROM'),
        to,
        subject: 'Confirmation de votre message',
        html: `
          <h2>Bonjour ${name},</h2>
          <p>Nous avons bien reçu votre message et nous vous répondrons dans les plus brefs délais.</p>
          <p>Merci de nous avoir contactés.</p>
          <br>
          <p>L'équipe Auto Aziz</p>
        `,
      });
      this.logger.log(`Contact confirmation email sent to ${to}`);
    } catch (error) {
      this.logger.error(
        `Failed to send contact confirmation email: ${(error as Error).message}`
      );
      throw error;
    }
  }

  async sendAppointmentConfirmation(
    to: string,
    name: string,
    appointmentDate: string,
    appointmentTime: string
  ): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.configService.get<string>('SMTP_FROM'),
        to,
        subject: 'Confirmation de votre rendez-vous',
        html: `
          <h2>Bonjour ${name},</h2>
          <p>Votre rendez-vous a été confirmé pour le <strong>${appointmentDate}</strong> à <strong>${appointmentTime}</strong>.</p>
          <p>Merci de vous présenter 10 minutes avant l'heure du rendez-vous.</p>
          <p>À bientôt,</p>
          <br>
          <p>L'équipe Auto Aziz</p>
        `,
      });
      this.logger.log(`Appointment confirmation email sent to ${to}`);
    } catch (error) {
      this.logger.error(
        `Failed to send appointment confirmation email: ${(error as Error).message}`
      );
      throw error;
    }
  }

  async notifyAdminNewContact(
    name: string,
    email: string,
    message: string
  ): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.configService.get<string>('SMTP_FROM'),
        to: this.configService.get<string>('SMTP_USER'),
        subject: 'Nouveau message de contact',
        html: `
          <h2>Nouveau message de contact</h2>
          <p><strong>Nom:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong></p>
          <p>${message}</p>
        `,
      });
      this.logger.log('Admin notification email sent for new contact');
    } catch (error) {
      this.logger.error(
        `Failed to send admin contact notification: ${(error as Error).message}`
      );
      throw error;
    }
  }

  async notifyAdminNewAppointment(
    name: string,
    email: string,
    phone: string,
    appointmentDate: string,
    appointmentTime: string,
    vehicleRegistration: string
  ): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.configService.get<string>('SMTP_FROM'),
        to: this.configService.get<string>('SMTP_USER'),
        subject: 'Nouveau rendez-vous',
        html: `
          <h2>Nouveau rendez-vous</h2>
          <p><strong>Nom:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Téléphone:</strong> ${phone}</p>
          <p><strong>Date:</strong> ${appointmentDate}</p>
          <p><strong>Heure:</strong> ${appointmentTime}</p>
          <p><strong>Immatriculation:</strong> ${vehicleRegistration}</p>
        `,
      });
      this.logger.log('Admin notification email sent for new appointment');
    } catch (error) {
      this.logger.error(
        `Failed to send admin appointment notification: ${(error as Error).message}`
      );
      throw error;
    }
  }

  async sendVerificationEmail(
    to: string,
    name: string,
    verificationCode: string,
    appointmentId: number
  ): Promise<void> {
    try {
      const verificationUrl = `${this.configService.get<string>('FRONTEND_URL')}/verify-appointment?id=${appointmentId}&code=${verificationCode}`;

      await this.transporter.sendMail({
        from: this.configService.get<string>('SMTP_FROM'),
        to,
        subject: 'Vérification de votre rendez-vous - Auto Aziz',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Vérification de votre rendez-vous</h2>
            <p>Bonjour <strong>${name}</strong>,</p>
            <p>Pour confirmer votre rendez-vous, vous devez vérifier votre adresse email et votre numéro de téléphone.</p>

            <div style="background-color: #f3f4f6; padding: 20px; margin: 20px 0; border-radius: 8px; text-align: center;">
              <h3 style="color: #1f2937; margin-bottom: 10px;">Votre code de vérification :</h3>
              <div style="font-size: 32px; font-weight: bold; color: #2563eb; letter-spacing: 4px;">${verificationCode}</div>
            </div>

            <p>Vous pouvez également cliquer sur ce lien pour vérifier automatiquement :</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Vérifier mon rendez-vous
              </a>
            </div>

            <p><strong>Important :</strong></p>
            <ul>
              <li>Ce code expire dans 10 minutes</li>
              <li>Vous recevrez également un SMS avec le même code</li>
              <li>Votre rendez-vous ne sera confirmé qu'après vérification complète</li>
            </ul>

            <p>Si vous n'avez pas demandé ce rendez-vous, veuillez ignorer cet email.</p>

            <br>
            <p>Cordialement,<br>L'équipe Auto Aziz</p>
          </div>
        `,
      });
      this.logger.log(`Verification email sent to ${to}`);
    } catch (error) {
      this.logger.error(
        `Failed to send verification email: ${(error as Error).message}`
      );
      throw error;
    }
  }

  async sendAppointmentConfirmedEmail(
    to: string,
    name: string,
    appointmentDate: string,
    appointmentTime: string
  ): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.configService.get<string>('SMTP_FROM'),
        to,
        subject: '✅ Rendez-vous confirmé - Auto Aziz',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #16a34a;">✅ Rendez-vous confirmé !</h2>
            <p>Bonjour <strong>${name}</strong>,</p>
            <p>Félicitations ! Votre rendez-vous a été confirmé avec succès.</p>
            
            <div style="background-color: #f0f9ff; border-left: 4px solid #2563eb; padding: 20px; margin: 20px 0;">
              <h3 style="color: #1f2937; margin-top: 0;">📅 Détails de votre rendez-vous</h3>
              <p style="margin: 8px 0;"><strong>Date :</strong> ${appointmentDate}</p>
              <p style="margin: 8px 0;"><strong>Heure :</strong> ${appointmentTime}</p>
              <p style="margin: 8px 0;"><strong>Adresse :</strong> Auto Aziz - [Votre adresse complète]</p>
              <p style="margin: 8px 0;"><strong>Statut :</strong> <span style="color: #16a34a; font-weight: bold;">✓ Confirmé</span></p>
            </div>
            
            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0;">
              <h3 style="color: #92400e; margin-top: 0;">📋 Documents à apporter</h3>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li><strong>Carte grise</strong> du véhicule (obligatoire)</li>
                <li>Vos papiers d'identité</li>
              </ul>
            </div>
            
            <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; margin: 20px 0;">
              <h3 style="color: #991b1b; margin-top: 0;">⚠️ Important - Véhicule Diesel</h3>
              <p style="margin: 8px 0;"><strong>Si votre véhicule est diesel :</strong></p>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>Merci de <strong>laisser chauffer votre véhicule à l'extérieur</strong> avant le contrôle</li>
                <li>Cela permet d'obtenir des mesures plus précises lors du test antipollution</li>
              </ul>
            </div>
            
            <div style="background-color: #f3f4f6; padding: 20px; margin: 20px 0; border-radius: 8px;">
              <h3 style="color: #1f2937; margin-top: 0;">📌 Rappels pratiques</h3>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>Merci de vous présenter <strong>10 minutes avant</strong> l'heure du rendez-vous</li>
                <li>Vous recevrez un SMS de rappel 24h avant</li>
                <li>En cas d'empêchement, merci de nous prévenir au plus tôt</li>
              </ul>
            </div>
            
            <p style="margin-top: 30px;">Merci de votre confiance !</p>
            <br>
            <p><strong>L'équipe Auto Aziz</strong></p>
          </div>
        `,
      });
      this.logger.log(`Appointment confirmed email sent to ${to}`);
    } catch (error) {
      this.logger.error(
        `Failed to send appointment confirmed email: ${(error as Error).message}`
      );
      throw error;
    }
  }
}
