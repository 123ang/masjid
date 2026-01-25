import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateTenantDto {
  @IsString({ message: 'Slug mesti berupa teks' })
  @IsNotEmpty({ message: 'Slug diperlukan' })
  @MinLength(3, { message: 'Slug mestilah sekurang-kurangnya 3 aksara' })
  @MaxLength(30, { message: 'Slug mestilah tidak melebihi 30 aksara' })
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Slug hanya boleh mengandungi huruf kecil, nombor, dan tanda sempang',
  })
  slug: string;

  @IsString({ message: 'Nama mesti berupa teks' })
  @IsNotEmpty({ message: 'Nama diperlukan' })
  @MinLength(3, { message: 'Nama mestilah sekurang-kurangnya 3 aksara' })
  name: string;

  @IsOptional()
  @IsString()
  logo?: string;

  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'Warna mesti dalam format hex (#RRGGBB)' })
  primaryColor?: string;

  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'Warna mesti dalam format hex (#RRGGBB)' })
  secondaryColor?: string;

  @IsOptional()
  @IsEmail({}, { message: 'E-mel tidak sah' })
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  // Masjid details
  @IsOptional()
  @IsString()
  masjidName?: string;

  @IsOptional()
  @IsString()
  masjidAddress?: string;

  @IsOptional()
  @IsString()
  masjidPhone?: string;

  // Initial admin user
  @IsOptional()
  @IsString()
  adminName?: string;

  @IsOptional()
  @IsEmail({}, { message: 'E-mel admin tidak sah' })
  adminEmail?: string;

  @IsOptional()
  @IsString()
  @MinLength(6, { message: 'Kata laluan mestilah sekurang-kurangnya 6 aksara' })
  adminPassword?: string;
}

export class UpdateTenantDto {
  @IsOptional()
  @IsString({ message: 'Nama mesti berupa teks' })
  @MinLength(3, { message: 'Nama mestilah sekurang-kurangnya 3 aksara' })
  name?: string;

  @IsOptional()
  @IsString()
  logo?: string;

  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'Warna mesti dalam format hex (#RRGGBB)' })
  primaryColor?: string;

  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'Warna mesti dalam format hex (#RRGGBB)' })
  secondaryColor?: string;

  @IsOptional()
  @IsEmail({}, { message: 'E-mel tidak sah' })
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
}
