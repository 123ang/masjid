import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator';

export enum MasterAdminRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  SUPPORT = 'SUPPORT',
}

export class CreateMasterAdminDto {
  @IsEmail({}, { message: 'E-mel tidak sah' })
  @IsNotEmpty({ message: 'E-mel diperlukan' })
  email: string;

  @IsString({ message: 'Nama mesti dalam bentuk teks' })
  @IsNotEmpty({ message: 'Nama diperlukan' })
  name: string;

  @IsString({ message: 'Kata laluan mesti dalam bentuk teks' })
  @MinLength(8, { message: 'Kata laluan mesti sekurang-kurangnya 8 aksara' })
  @IsNotEmpty({ message: 'Kata laluan diperlukan' })
  password: string;

  @IsEnum(MasterAdminRole, { message: 'Peranan tidak sah' })
  @IsNotEmpty({ message: 'Peranan diperlukan' })
  role: MasterAdminRole;
}
