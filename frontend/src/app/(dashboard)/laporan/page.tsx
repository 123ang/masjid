'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet, FileText, Download, Loader2 } from 'lucide-react';
import api from '@/lib/api';

export default function ReportsPage() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleExportExcel = async () => {
    setLoading('excel');
    try {
      const response = await api.get('/export/excel', {
        responseType: 'blob',
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'senarai-isi-rumah.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting Excel:', error);
      alert('Ralat berlaku semasa eksport Excel');
    } finally {
      setLoading(null);
    }
  };

  const handleExportCSV = async () => {
    setLoading('csv');
    try {
      const response = await api.get('/export/csv', {
        responseType: 'blob',
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'senarai-isi-rumah.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Ralat berlaku semasa eksport CSV');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Laporan & Eksport</h1>
        <p className="text-gray-600 mt-1">Muat turun data isi rumah dalam pelbagai format</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Excel Export */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <FileSpreadsheet className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <CardTitle>Eksport Excel</CardTitle>
                <CardDescription>Format Microsoft Excel (.xlsx)</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Muat turun semua data isi rumah dalam format Excel. Sesuai untuk analisis data dan pembuatan laporan lanjut.
            </p>
            <ul className="text-sm text-gray-600 mb-4 space-y-1">
              <li>✓ Semua maklumat isi rumah</li>
              <li>✓ Maklumat tanggungan</li>
              <li>✓ Status bantuan dan OKU</li>
              <li>✓ Format mudah dibaca</li>
            </ul>
            <Button 
              onClick={handleExportExcel}
              disabled={loading !== null}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {loading === 'excel' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memuat turun...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Muat Turun Excel
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* CSV Export */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <CardTitle>Eksport CSV</CardTitle>
                <CardDescription>Comma-Separated Values (.csv)</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Muat turun data dalam format CSV. Sesuai untuk import ke sistem lain atau pemprosesan data automatik.
            </p>
            <ul className="text-sm text-gray-600 mb-4 space-y-1">
              <li>✓ Format universal</li>
              <li>✓ Ringan dan cepat</li>
              <li>✓ Mudah diproses</li>
              <li>✓ Compatible dengan Excel</li>
            </ul>
            <Button 
              onClick={handleExportCSV}
              disabled={loading !== null}
              variant="outline"
              className="w-full"
            >
              {loading === 'csv' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memuat turun...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Muat Turun CSV
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Information Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <div className="text-blue-600">ℹ️</div>
            <div className="space-y-2 text-sm">
              <p className="font-medium text-blue-900">Maklumat Eksport</p>
              <ul className="text-blue-800 space-y-1">
                <li>• Fail yang dimuat turun mengandungi data terkini sahaja (versi semasa)</li>
                <li>• Data sejarah versi tidak termasuk dalam eksport</li>
                <li>• Fail akan dimuat turun ke folder Downloads anda</li>
                <li>• Pastikan anda mempunyai aplikasi yang sesuai untuk membuka fail (Excel atau text editor)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
