import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateContactDto {
  @ApiProperty({ example: 'Jean Dupont' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'jean.dupont@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '0612345678' })
  @IsNotEmpty()
  @IsString()
  phone: string;

  @ApiProperty({ example: 'Je souhaite obtenir des informations sur vos services.' })
  @IsNotEmpty()
  @IsString()
  @MinLength(10)
  message: string;
}
