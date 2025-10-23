import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
// TODO: Importer JwtModule quand configuré
// import { JwtModule } from '@nestjs/jwt';

@Module({
  // TODO: Configurer JwtModule
  // imports: [
  //   JwtModule.register({
  //     secret: process.env.JWT_SECRET || 'your-secret-key',
  //     signOptions: { expiresIn: '24h' },
  //   }),
  // ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
