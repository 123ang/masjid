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
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>Nama</TableHead>
              <TableHead>No. K/P</TableHead>
              <TableHead>Alamat</TableHead>
              <TableHead className="text-right">Pendapatan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Tanggungan</TableHead>
              <TableHead className="text-center">Tindakan</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {households.map((household) => (
              <TableRow key={household.id}>
                <TableCell className="font-medium">
                  {household.currentVersion?.applicantName || '-'}
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {household.currentVersion?.icNo || '-'}
                </TableCell>
                <TableCell className="max-w-xs truncate">
                  {household.currentVersion?.address || '-'}
                </TableCell>
                <TableCell className="text-right">
                  {household.currentVersion?.netIncome 
                    ? `RM${parseFloat(household.currentVersion.netIncome.toString()).toFixed(2)}` 
                    : '-'}
                </TableCell>
                <TableCell>
                  {household.currentVersion?.housingStatus === 'SENDIRI' ? 'Sendiri' : 
                   household.currentVersion?.housingStatus === 'SEWA' ? 'Sewa' : '-'}
                </TableCell>
                <TableCell className="text-center">
                  {household.currentVersion?.dependents?.length || 0}
                </TableCell>
                <TableCell className="text-center">
                  <Link href={`/isi-rumah/${household.id}`}>
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4 mr-1" />
                      Lihat
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
