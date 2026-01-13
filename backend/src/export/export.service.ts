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
            disabilityMembers: { include: { person: true, disabilityType: true } },
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
      worksheet.addRow({
        applicantName: version?.applicantName || '-',
        icNo: version?.icNo || '-',
        phone: version?.phone || '-',
        address: version?.address || '-',
        netIncome: version?.netIncome ? parseFloat(version.netIncome.toString()) : 0,
        housingStatus: version?.housingStatus === 'SENDIRI' ? 'Sendiri' : version?.housingStatus === 'SEWA' ? 'Sewa' : '-',
        dependentsCount: version?.dependents?.length || 0,
        assistanceReceived: version?.assistanceReceived ? 'Ya' : 'Tidak',
        assistanceProvider: version?.assistanceProviderText || '-',
        disabilityInFamily: version?.disabilityInFamily ? 'Ya' : 'Tidak',
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
      ],
    });

    const records = households.map((household) => {
      const version = household.currentVersion;
      return {
        applicantName: version?.applicantName || '-',
        icNo: version?.icNo || '-',
        phone: version?.phone || '-',
        address: version?.address || '-',
        netIncome: version?.netIncome ? parseFloat(version.netIncome.toString()) : 0,
        housingStatus: version?.housingStatus === 'SENDIRI' ? 'Sendiri' : version?.housingStatus === 'SEWA' ? 'Sewa' : '-',
        dependentsCount: version?.dependents?.length || 0,
        assistanceReceived: version?.assistanceReceived ? 'Ya' : 'Tidak',
        assistanceProvider: version?.assistanceProviderText || '-',
        disabilityInFamily: version?.disabilityInFamily ? 'Ya' : 'Tidak',
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
