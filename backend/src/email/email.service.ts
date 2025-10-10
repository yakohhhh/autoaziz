import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST'),
      port: this.configService.get('SMTP_PORT'),
      secure: false,
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASSWORD'),
      },
    });
  }

  async sendContactConfirmation(to: string, name: string) {
    await this.transporter.sendMail({
      from: this.configService.get('SMTP_FROM'),
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
  }

  async sendAppointmentConfirmation(
    to: string,
    name: string,
    appointmentDate: string,
    appointmentTime: string,
  ) {
    await this.transporter.sendMail({
      from: this.configService.get('SMTP_FROM'),
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
  }

  async notifyAdminNewContact(name: string, email: string, message: string) {
    await this.transporter.sendMail({
      from: this.configService.get('SMTP_FROM'),
      to: this.configService.get('SMTP_USER'),
      subject: 'Nouveau message de contact',
      html: `
        <h2>Nouveau message de contact</h2>
        <p><strong>Nom:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    });
  }

  async notifyAdminNewAppointment(
    name: string,
    email: string,
    phone: string,
    appointmentDate: string,
    appointmentTime: string,
    vehicleRegistration: string,
  ) {
    await this.transporter.sendMail({
      from: this.configService.get('SMTP_FROM'),
      to: this.configService.get('SMTP_USER'),
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
  }
}
