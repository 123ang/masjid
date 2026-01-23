import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsEnum,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { HousingStatus } from '@prisma/client';

class DependentDto {
  @IsString()
  fullName: string;

  @IsOptional()
  @IsString()
  icNo?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  relationship?: string;

  @IsOptional()
  @IsString()
  occupation?: string;
}

class DisabilityMemberDto {
  @IsString()
  fullName: string;

  @IsOptional()
  @IsString()
  icNo?: string;

  @IsOptional()
  @IsString()
  disabilityTypeId?: string;

  @IsOptional()
  @IsString()
  notesText?: string;
}

class EmergencyContactDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  icNo?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  relationship?: string;
}

export class CreateHouseholdDto {
  @IsOptional()
  @IsString()
  applicantName?: string;

  @IsOptional()
  @IsString()
  icNo?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  poskod?: string;

  @IsOptional()
  @IsString()
  daerah?: string;

  @IsOptional()
  @IsString()
  negeri?: string;

  @IsOptional()
  @IsString()
  village?: string;

  @IsOptional()
  @IsNumber()
  netIncome?: number;

  @IsOptional()
  @IsEnum(HousingStatus)
  housingStatus?: HousingStatus;

  @IsBoolean()
  assistanceReceived: boolean;

  @IsOptional()
  @IsString()
  assistanceProviderText?: string;

  @IsBoolean()
  disabilityInFamily: boolean;

  @IsOptional()
  @IsString()
  disabilityNotesText?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DependentDto)
  dependents: DependentDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DisabilityMemberDto)
  disabilityMembers: DisabilityMemberDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EmergencyContactDto)
  emergencyContacts: EmergencyContactDto[];
}
