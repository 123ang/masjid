import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import Link from 'next/link';
import { Household } from '@/types';

interface HouseholdTableProps {
  households: Household[];
}

export default function HouseholdTable({ households }: HouseholdTableProps) {
  if (households.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg">
        <p className="text-gray-500">Tiada rekod dijumpai</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="overflow-x-auto -mx-6 sm:mx-0">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-x-auto">
            <Table className="min-w-[800px]">
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="min-w-[150px]">Nama</TableHead>
                  <TableHead className="min-w-[120px]">No. K/P</TableHead>
                  <TableHead className="min-w-[200px]">Alamat</TableHead>
                  <TableHead className="min-w-[100px] text-right">Pendapatan</TableHead>
                  <TableHead className="min-w-[100px]">Status</TableHead>
                  <TableHead className="min-w-[100px] text-center">Tanggungan</TableHead>
                  <TableHead className="min-w-[100px] text-center">Tindakan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {households.map((household) => (
                  <TableRow key={household.id}>
                    <TableCell className="font-medium min-w-[150px]">
                      {household.currentVersion?.applicantName || '-'}
                    </TableCell>
                    <TableCell className="font-mono text-sm min-w-[120px]">
                      {household.currentVersion?.icNo || '-'}
                    </TableCell>
                    <TableCell className="min-w-[200px] max-w-[300px]">
                      <div className="truncate" title={household.currentVersion?.address || ''}>
                        {household.currentVersion?.address || '-'}
                      </div>
                    </TableCell>
                    <TableCell className="text-right min-w-[100px]">
                      {household.currentVersion?.netIncome 
                        ? `RM${parseFloat(household.currentVersion.netIncome.toString()).toFixed(2)}` 
                        : '-'}
                    </TableCell>
                    <TableCell className="min-w-[100px]">
                      {household.currentVersion?.housingStatus === 'SENDIRI' ? 'Sendiri' : 
                       household.currentVersion?.housingStatus === 'SEWA' ? 'Sewa' : '-'}
                    </TableCell>
                    <TableCell className="text-center min-w-[100px]">
                      {household.currentVersion?.dependents?.length || 0}
                    </TableCell>
                    <TableCell className="text-center min-w-[100px]">
                      <Link href={`/isi-rumah/${household.id}`}>
                        <Button size="sm" variant="outline" className="whitespace-nowrap">
                          <Eye className="w-4 h-4 mr-1" />
                          <span className="hidden sm:inline">Lihat</span>
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
