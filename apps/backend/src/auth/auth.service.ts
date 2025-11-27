import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto, AuthResponseDto } from '../dto/auth.dto';
// TODO: Importer JwtService et PrismaService quand disponibles
// import { JwtService } from '@nestjs/jwt';
// import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  // TODO: Injecter les dépendances
  // constructor(
  //   private readonly prisma: PrismaService,
  //   private readonly jwtService: JwtService,
  // ) {}

  login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    console.log('Login attempt:', {
      email,
      passwordLength: password?.length,
      expectedEmail: 'admin@autosur.com',
      expectedPass: 'admin123',
      matchEmail: email === 'admin@autosur.com',
      matchPass: password === 'admin123',
    });

    // TODO: Remplacer par une vraie validation en base de données
    // const user = await this.prisma.user.findUnique({
    //   where: { email },
    // });

    // TODO: Vérifier le mot de passe hashé avec bcrypt
    // const isPasswordValid = await bcrypt.compare(password, user.password);

    // Validation temporaire pour le développement
    if (email === 'admin@autosur.com' && password === 'admin123') {
      // TODO: Générer un vrai token JWT
      // const token = this.jwtService.sign({
      //   sub: user.id,
      //   email: user.email,
      //   role: user.role,
      // });

      const mockToken = 'mock-jwt-token-' + Date.now();

      return Promise.resolve({
        token: mockToken,
        user: {
          id: '1',
          name: 'Administrateur',
          email: 'admin@autosur.com',
          role: 'admin',
        },
      });
    }

    throw new UnauthorizedException('Email ou mot de passe incorrect');
  }

  // TODO: Ajouter la méthode de validation du token
  // async validateToken(token: string) {
  //   try {
  //     const decoded = this.jwtService.verify(token);
  //     return decoded;
  //   } catch (error) {
  //     throw new UnauthorizedException('Token invalide');
  //   }
  // }
}
