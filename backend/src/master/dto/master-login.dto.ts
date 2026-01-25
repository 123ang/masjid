import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class MasterLoginDto {
  @IsEmail({}, { message: 'E-mel tidak sah' })
  @IsNotEmpty({ message: 'E-mel diperlukan' })
  email: string;

  @IsString({ message: 'Kata laluan mesti berupa teks' })
  @IsNotEmpty({ message: 'Kata laluan diperlukan' })
  @MinLength(6, { message: 'Kata laluan mestilah sekurang-kurangnya 6 aksara' })
  password: string;
}
