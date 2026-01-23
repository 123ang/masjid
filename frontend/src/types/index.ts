// Masjid Kariah Census System - TypeScript Types

export enum UserRole {
  ADMIN = 'ADMIN',
  IMAM = 'IMAM',
  PENGURUSAN = 'PENGURUSAN',
}

export enum HousingStatus {
  SENDIRI = 'SENDIRI',
  SEWA = 'SEWA',
}

export interface Masjid {
  id: string;
  name: string;
  address?: string;
  phone?: string;
}

export interface User {
  id: string;
  masjidId: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  masjid?: Masjid;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface Person {
  id: string;
  fullName: string;
  icNo?: string;
  phone?: string;
}

export interface HouseholdVersionDependent {
  id?: string;
  personId?: string;
  fullName?: string;
  icNo?: string;
  phone?: string;
  relationship?: string;
  occupation?: string;
  person?: Person; // Nested person object from API
}

export interface DisabilityMember {
  id?: string;
  personId?: string;
  fullName?: string;
  icNo?: string;
  disabilityTypeId?: string;
  disabilityTypeName?: string;
  disabilityType?: { id: string; name: string };
  notesText?: string;
  person?: Person; // Nested person object from API
}

export interface EmergencyContact {
  id?: string;
  name: string;
  icNo?: string;
  phone?: string;
  relationship?: string;
}

export interface HouseholdVersion {
  id: string;
  householdId: string;
  versionNo: number;
  createdByUserId: string;
  createdAt: string;
  applicantName?: string;
  icNo?: string;
  phone?: string;
  address?: string;
  poskod?: string;
  daerah?: string;
  negeri?: string;
  village?: string;
  netIncome?: number;
  housingStatus?: HousingStatus;
  assistanceReceived: boolean;
  assistanceProviderText?: string;
  disabilityInFamily: boolean;
  disabilityNotesText?: string;
  dependents?: HouseholdVersionDependent[];
  disabilityMembers?: DisabilityMember[];
  emergencyContacts?: EmergencyContact[];
  createdByUser?: User;
}

export interface Household {
  id: string;
  masjidId: string;
  currentVersionId?: string;
  createdAt: string;
  updatedAt: string;
  currentVersion?: HouseholdVersion;
  versions?: HouseholdVersion[];
}

export interface CreateHouseholdDto {
  applicantName?: string;
  icNo?: string;
  phone?: string;
  address?: string;
  poskod?: string;
  daerah?: string;
  negeri?: string;
  village?: string;
  netIncome?: number;
  housingStatus?: HousingStatus;
  assistanceReceived: boolean;
  assistanceProviderText?: string;
  disabilityInFamily: boolean;
  disabilityNotesText?: string;
  dependents: HouseholdVersionDependent[];
  disabilityMembers: DisabilityMember[];
  emergencyContacts: EmergencyContact[];
}

export interface UpdateHouseholdDto extends CreateHouseholdDto {
  householdId: string;
}

export interface DisabilityType {
  id: string;
  name: string;
}

export interface AnalyticsSummary {
  totalHouseholds: number;
  totalDependents: number;
  totalIndividuals?: number;
  averageHouseholdSize: number;
  totalOwnHouse: number;
  totalRentHouse: number;
  totalReceivingAssistance: number;
  totalWithDisability: number;
  totalManyDependentsHouseholds?: number;
  assistedHouseholdsThisYear?: number;
  percentOwnHouse?: number;
  percentRentHouse?: number;
  percentReceivingAssistance?: number;
  percentWithDisability?: number;
  percentManyDependents?: number;
  averageIncome: number;
  householdsThisMonth: number;
  staleRecords: number;
}

export interface IncomeDistribution {
  range: string;
  count: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

export interface HouseholdSearchParams {
  search?: string;
  housingStatus?: HousingStatus;
  incomeMin?: number;
  incomeMax?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
