import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as ExcelJS from 'exceljs';
import { createObjectCsvWriter } from 'csv-writer';
import { join } from 'path';
import { existsSync, mkdirSync, unlinkSync } from 'fs';

@Injectable()
export class ExportService {
  constructor(private prisma: PrismaService) {}

  async exportToExcel(masjidId: string): Promise<string> {
    const households = await this.prisma.household.findMany({
      where: { masjidId },
      include: {
        currentVersion: {
          include: {
            dependents: { include: { person: true } },
            disabilityMembers: {
              include: { person: true, disabilityType: true },
            },
            emergencyContacts: true,
          },
        },
      },
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Senarai Isi Rumah');

    // Headers
    worksheet.columns = [
      { header: 'Nama', key: 'applicantName', width: 30 },
      { header: 'No. K/P', key: 'icNo', width: 15 },
      { header: 'Telefon', key: 'phone', width: 15 },
      { header: 'Alamat', key: 'address', width: 40 },
      { header: 'Pendapatan (RM)', key: 'netIncome', width: 15 },
      { header: 'Status Kediaman', key: 'housingStatus', width: 15 },
      { header: 'Jumlah Tanggungan', key: 'dependentsCount', width: 15 },
      { header: 'Bantuan Bulanan', key: 'assistanceReceived', width: 15 },
      { header: 'Pemberi Bantuan', key: 'assistanceProvider', width: 30 },
      { header: 'OKU', key: 'disabilityInFamily', width: 10 },
      { header: 'Tanggungan1', key: 'dependent1', width: 25 },
      { header: 'Tanggungan2', key: 'dependent2', width: 25 },
      { header: 'Tanggungan3', key: 'dependent3', width: 25 },
      { header: 'Tanggungan4', key: 'dependent4', width: 25 },
      { header: 'Tanggungan5', key: 'dependent5', width: 25 },
      { header: 'Tanggungan6', key: 'dependent6', width: 25 },
      { header: 'Tanggungan7', key: 'dependent7', width: 25 },
      { header: 'Tanggungan8', key: 'dependent8', width: 25 },
      { header: 'Tanggungan9', key: 'dependent9', width: 25 },
      { header: 'Tanggungan10', key: 'dependent10', width: 25 },
    ];

    // Style header
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF059669' },
    };

    // Add data
    households.forEach((household) => {
      const version = household.currentVersion;
      const dependentNames = (version?.dependents ?? [])
        .map((d) => d.person?.fullName)
        .filter((n): n is string => Boolean(n))
        .slice(0, 10);

      worksheet.addRow({
        applicantName: version?.applicantName || '-',
        icNo: version?.icNo || '-',
        phone: version?.phone || '-',
        address: version?.address || '-',
        netIncome: version?.netIncome
          ? parseFloat(version.netIncome.toString())
          : 0,
        housingStatus:
          version?.housingStatus === 'SENDIRI'
            ? 'Sendiri'
            : version?.housingStatus === 'SEWA'
              ? 'Sewa'
              : '-',
        dependentsCount: version?.dependents?.length || 0,
        assistanceReceived: version?.assistanceReceived ? 'Ya' : 'Tidak',
        assistanceProvider: version?.assistanceProviderText || '-',
        disabilityInFamily: version?.disabilityInFamily ? 'Ya' : 'Tidak',
        dependent1: dependentNames[0] || '-',
        dependent2: dependentNames[1] || '-',
        dependent3: dependentNames[2] || '-',
        dependent4: dependentNames[3] || '-',
        dependent5: dependentNames[4] || '-',
        dependent6: dependentNames[5] || '-',
        dependent7: dependentNames[6] || '-',
        dependent8: dependentNames[7] || '-',
        dependent9: dependentNames[8] || '-',
        dependent10: dependentNames[9] || '-',
      });
    });

    // Save file
    const tempDir = join(process.cwd(), 'temp');
    if (!existsSync(tempDir)) {
      mkdirSync(tempDir);
    }

    const fileName = `senarai-isi-rumah-${Date.now()}.xlsx`;
    const filePath = join(tempDir, fileName);
    await workbook.xlsx.writeFile(filePath);

    return filePath;
  }

  async exportToCSV(masjidId: string): Promise<string> {
    const households = await this.prisma.household.findMany({
      where: { masjidId },
      include: {
        currentVersion: {
          include: {
            dependents: { include: { person: true } },
          },
        },
      },
    });

    const tempDir = join(process.cwd(), 'temp');
    if (!existsSync(tempDir)) {
      mkdirSync(tempDir);
    }

    const fileName = `senarai-isi-rumah-${Date.now()}.csv`;
    const filePath = join(tempDir, fileName);

    const csvWriter = createObjectCsvWriter({
      path: filePath,
      header: [
        { id: 'applicantName', title: 'Nama' },
        { id: 'icNo', title: 'No. K/P' },
        { id: 'phone', title: 'Telefon' },
        { id: 'address', title: 'Alamat' },
        { id: 'netIncome', title: 'Pendapatan (RM)' },
        { id: 'housingStatus', title: 'Status Kediaman' },
        { id: 'dependentsCount', title: 'Jumlah Tanggungan' },
        { id: 'assistanceReceived', title: 'Bantuan Bulanan' },
        { id: 'assistanceProvider', title: 'Pemberi Bantuan' },
        { id: 'disabilityInFamily', title: 'OKU' },
        { id: 'dependent1', title: 'Tanggungan1' },
        { id: 'dependent2', title: 'Tanggungan2' },
        { id: 'dependent3', title: 'Tanggungan3' },
        { id: 'dependent4', title: 'Tanggungan4' },
        { id: 'dependent5', title: 'Tanggungan5' },
        { id: 'dependent6', title: 'Tanggungan6' },
        { id: 'dependent7', title: 'Tanggungan7' },
        { id: 'dependent8', title: 'Tanggungan8' },
        { id: 'dependent9', title: 'Tanggungan9' },
        { id: 'dependent10', title: 'Tanggungan10' },
      ],
    });

    const records = households.map((household) => {
      const version = household.currentVersion;
      const dependentNames = (version?.dependents ?? [])
        .map((d) => d.person?.fullName)
        .filter((n): n is string => Boolean(n))
        .slice(0, 10);

      return {
        applicantName: version?.applicantName || '-',
        icNo: version?.icNo || '-',
        phone: version?.phone || '-',
        address: version?.address || '-',
        netIncome: version?.netIncome
          ? parseFloat(version.netIncome.toString())
          : 0,
        housingStatus:
          version?.housingStatus === 'SENDIRI'
            ? 'Sendiri'
            : version?.housingStatus === 'SEWA'
              ? 'Sewa'
              : '-',
        dependentsCount: version?.dependents?.length || 0,
        assistanceReceived: version?.assistanceReceived ? 'Ya' : 'Tidak',
        assistanceProvider: version?.assistanceProviderText || '-',
        disabilityInFamily: version?.disabilityInFamily ? 'Ya' : 'Tidak',
        dependent1: dependentNames[0] || '-',
        dependent2: dependentNames[1] || '-',
        dependent3: dependentNames[2] || '-',
        dependent4: dependentNames[3] || '-',
        dependent5: dependentNames[4] || '-',
        dependent6: dependentNames[5] || '-',
        dependent7: dependentNames[6] || '-',
        dependent8: dependentNames[7] || '-',
        dependent9: dependentNames[8] || '-',
        dependent10: dependentNames[9] || '-',
      };
    });

    await csvWriter.writeRecords(records);
    return filePath;
  }

  cleanupFile(filePath: string) {
    try {
      if (existsSync(filePath)) {
        unlinkSync(filePath);
      }
    } catch (error) {
      console.error('Error cleaning up file:', error);
    }
  }
}
