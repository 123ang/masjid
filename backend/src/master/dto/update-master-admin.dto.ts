import { IsEmail, IsEnum, IsOptional, IsString, IsBoolean, MinLength } from 'class-validator';

export enum MasterAdminRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  SUPPORT = 'SUPPORT',
}

export class UpdateMasterAdminDto {
  @IsEmail({}, { message: 'E-mel tidak sah' })
  @IsOptional()
  email?: string;

  @IsString({ message: 'Nama mesti dalam bentuk teks' })
  @IsOptional()
  name?: string;

  @IsString({ message: 'Kata laluan mesti dalam bentuk teks' })
  @MinLength(8, { message: 'Kata laluan mesti sekurang-kurangnya 8 aksara' })
  @IsOptional()
  password?: string;

  @IsEnum(MasterAdminRole, { message: 'Peranan tidak sah' })
  @IsOptional()
  role?: MasterAdminRole;

  @IsBoolean({ message: 'Status aktif mesti boolean' })
  @IsOptional()
  isActive?: boolean;
}
