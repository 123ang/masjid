'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import HouseholdTable from '@/components/household/HouseholdTable';
import { Search, Loader2 } from 'lucide-react';
import { Household, HousingStatus } from '@/types';

export default function HouseholdListPage() {
  const [households, setHouseholds] = useState<Household[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [housingStatus, setHousingStatus] = useState<string>('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchHouseholds();
  }, [page, housingStatus]);

  const fetchHouseholds = async () => {
    setLoading(true);
    setError('');
    try {
      const params: any = { page, limit: 20 };
      if (search) params.search = search;
      // Only send housingStatus if it's not "ALL" or empty
      if (housingStatus && housingStatus !== 'ALL') {
        params.housingStatus = housingStatus;
      }

      const response = await api.get('/household', { params });
      setHouseholds(response.data.data || []);
      setTotalPages(response.data.totalPages || 1);
      setTotal(response.data.total || 0);
    } catch (error: any) {
      console.error('Error fetching households:', error);
      // Show more detailed error information
      if (error.response) {
        const errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
        setError(errorMessage);
        console.error('Response error:', error.response.data);
        console.error('Status:', error.response.status);
      } else if (error.request) {
        setError('Tidak dapat menghubungi server. Pastikan backend sedang berjalan.');
        console.error('Request error:', error.request);
      } else {
        setError(error.message || 'Ralat berlaku semasa memuatkan data.');
        console.error('Error:', error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchHouseholds();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Senarai Isi Rumah</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">
          Jumlah: {total} rekod
        </p>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Cari nama, No. K/P, atau alamat..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-10"
            />
          </div>
        </div>

        <Select value={housingStatus} onValueChange={setHousingStatus}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Status Kediaman" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Semua</SelectItem>
            <SelectItem value="SENDIRI">Sendiri</SelectItem>
            <SelectItem value="SEWA">Sewa</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={handleSearch} className="bg-green-600 hover:bg-green-700">
          Cari
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p className="font-medium">Ralat:</p>
          <p>{error}</p>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        </div>
      ) : (
        <>
          <HouseholdTable households={households} />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-full sm:w-auto"
              >
                Sebelumnya
              </Button>
              
              {/* Page Numbers - scrollable on mobile */}
              <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto justify-center pb-2 sm:pb-0">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <Button
                    key={pageNum}
                    variant={page === pageNum ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPage(pageNum)}
                    className={
                      page === pageNum
                        ? 'bg-green-600 hover:bg-green-700 text-white flex-shrink-0'
                        : 'flex-shrink-0'
                    }
                  >
                    {pageNum}
                  </Button>
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-full sm:w-auto"
              >
                Seterusnya
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
