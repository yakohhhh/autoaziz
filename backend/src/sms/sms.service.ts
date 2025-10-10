import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  constructor(private configService: ConfigService) {}

  async sendVerificationSms(phone: string, code: string): Promise<void> {
    try {
      // Pour l'instant, on simule l'envoi SMS
      // Dans un vrai projet, vous pourriez utiliser Twilio, AWS SNS, ou autre service SMS
      this.logger.log(
        `SMS Simulation - Sending to ${phone}: Votre code de vérification Auto Aziz est: ${code}`
      );

      // Simulation d'une attente réseau
      await new Promise(resolve => setTimeout(resolve, 100));

      // TODO: Implémenter un vrai service SMS
      // Exemple avec Twilio:
      // await this.twilioClient.messages.create({
      //   body: `Votre code de vérification Auto Aziz est: ${code}`,
      //   from: this.configService.get('TWILIO_PHONE_NUMBER'),
      //   to: phone
      // });

      // Pour les tests, on peut aussi utiliser une API gratuite comme SMS API
      // ou configurer un webhook pour recevoir les SMS sur une URL de test

      this.logger.log(`Verification SMS sent successfully to ${phone}`);
    } catch (error) {
      this.logger.error(
        `Failed to send SMS to ${phone}:`,
        (error as Error).message
      );
      throw new Error("Échec de l'envoi du SMS de vérification");
    }
  }

  async sendAppointmentReminder(
    phone: string,
    name: string,
    date: string,
    time: string
  ): Promise<void> {
    try {
      const message = `Bonjour ${name}, rappel de votre rendez-vous Auto Aziz le ${date} à ${time}. Merci !`;

      this.logger.log(`SMS Reminder - Sending to ${phone}: ${message}`);

      // Simulation d'une attente réseau
      await new Promise(resolve => setTimeout(resolve, 100));

      // TODO: Implémenter l'envoi réel

      this.logger.log(`Reminder SMS sent successfully to ${phone}`);
    } catch (error) {
      this.logger.error(
        `Failed to send reminder SMS to ${phone}:`,
        (error as Error).message
      );
      throw new Error("Échec de l'envoi du SMS de rappel");
    }
  }
}
