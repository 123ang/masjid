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
  // Filter form state (not applied until user clicks "Cari")
  const [search, setSearch] = useState('');
  const [housingStatus, setHousingStatus] = useState<string>('ALL');
  const [nameFilter, setNameFilter] = useState('');
  const [icFilter, setIcFilter] = useState('');
  const [addressFilter, setAddressFilter] = useState('');
  const [incomeMin, setIncomeMin] = useState('');
  const [incomeMax, setIncomeMax] = useState('');
  const [dependentsMin, setDependentsMin] = useState('');
  const [dependentsMax, setDependentsMax] = useState('');

  const [appliedFilters, setAppliedFilters] = useState(() => ({
    search: '',
    housingStatus: 'ALL',
    applicantName: '',
    icNo: '',
    address: '',
    incomeMin: '',
    incomeMax: '',
    dependentsMin: '',
    dependentsMax: '',
  }));
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchHouseholds();
  }, [page, appliedFilters]);

  const fetchHouseholds = async () => {
    setLoading(true);
    setError('');
    try {
      const params: any = { page, limit: 20 };
      if (appliedFilters.search) params.search = appliedFilters.search;
      if (appliedFilters.housingStatus && appliedFilters.housingStatus !== 'ALL') {
        params.housingStatus = appliedFilters.housingStatus;
      }
      if (appliedFilters.applicantName) params.applicantName = appliedFilters.applicantName;
      if (appliedFilters.icNo) params.icNo = appliedFilters.icNo;
      if (appliedFilters.address) params.address = appliedFilters.address;
      if (appliedFilters.incomeMin) params.incomeMin = appliedFilters.incomeMin;
      if (appliedFilters.incomeMax) params.incomeMax = appliedFilters.incomeMax;
      if (appliedFilters.dependentsMin) params.dependentsMin = appliedFilters.dependentsMin;
      if (appliedFilters.dependentsMax) params.dependentsMax = appliedFilters.dependentsMax;

      // Clean empty strings
      Object.keys(params).forEach((k) => {
        if (params[k] === '') delete params[k];
      });

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

  const handleApplyFilters = () => {
    const nextApplied = {
      search: search.trim(),
      housingStatus,
      applicantName: nameFilter.trim(),
      icNo: icFilter.trim(),
      address: addressFilter.trim(),
      incomeMin: incomeMin.trim(),
      incomeMax: incomeMax.trim(),
      dependentsMin: dependentsMin.trim(),
      dependentsMax: dependentsMax.trim(),
    };
    setAppliedFilters(nextApplied);
    setPage(1);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleApplyFilters();
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

        <Button onClick={handleApplyFilters} className="bg-green-600 hover:bg-green-700">
          Cari
        </Button>
      </div>

      {/* Column Filters (server-side) */}
      <div className="border rounded-lg p-4 bg-white space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
          <div className="md:col-span-1">
            <Input
              placeholder="Nama"
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              onKeyPress={handleKeyPress}
            />
          </div>
          <div className="md:col-span-1">
            <Input
              placeholder="No. K/P"
              value={icFilter}
              onChange={(e) => setIcFilter(e.target.value)}
              onKeyPress={handleKeyPress}
            />
          </div>
          <div className="md:col-span-2">
            <Input
              placeholder="Alamat"
              value={addressFilter}
              onChange={(e) => setAddressFilter(e.target.value)}
              onKeyPress={handleKeyPress}
            />
          </div>
          <div className="md:col-span-1">
            <div className="grid grid-cols-2 gap-2">
              <Input
                inputMode="decimal"
                placeholder="RM min"
                value={incomeMin}
                onChange={(e) => setIncomeMin(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <Input
                inputMode="decimal"
                placeholder="RM max"
                value={incomeMax}
                onChange={(e) => setIncomeMax(e.target.value)}
                onKeyPress={handleKeyPress}
              />
            </div>
          </div>
          <div className="md:col-span-1">
            <div className="grid grid-cols-2 gap-2">
              <Input
                inputMode="numeric"
                placeholder="T min"
                value={dependentsMin}
                onChange={(e) => setDependentsMin(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <Input
                inputMode="numeric"
                placeholder="T max"
                value={dependentsMax}
                onChange={(e) => setDependentsMax(e.target.value)}
                onKeyPress={handleKeyPress}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-gray-600">
            Semua tapisan ini ditanya terus dari pangkalan data (server-side) dan akan reset halaman ke 1.
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setSearch('');
                setHousingStatus('ALL');
                setNameFilter('');
                setIcFilter('');
                setAddressFilter('');
                setIncomeMin('');
                setIncomeMax('');
                setDependentsMin('');
                setDependentsMax('');
                setAppliedFilters({
                  search: '',
                  housingStatus: 'ALL',
                  applicantName: '',
                  icNo: '',
                  address: '',
                  incomeMin: '',
                  incomeMax: '',
                  dependentsMin: '',
                  dependentsMax: '',
                });
                setPage(1);
              }}
            >
              Reset
            </Button>
            <Button onClick={handleApplyFilters} className="bg-green-600 hover:bg-green-700">
              Tapis
            </Button>
          </div>
        </div>
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
