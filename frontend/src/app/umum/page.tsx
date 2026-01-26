'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import axios from 'axios';
import api from '@/lib/api';
import { useTenant } from '@/context/TenantContext';
import StatCard from '@/components/dashboard/StatCard';
import IncomeChart from '@/components/dashboard/IncomeChart';
import HousingChart from '@/components/dashboard/HousingChart';
import GenderChart from '@/components/dashboard/GenderChart';
import PublicDashboardCarousel, { PublicDashboardSlide } from '@/components/dashboard/PublicDashboardCarousel';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Users, TrendingUp, Home, Building, Heart, Accessibility } from 'lucide-react';
import type { AnalyticsSummary, IncomeDistribution, GenderDistribution } from '@/types';

export default function UmumDashboardPage() {
  const { branding, isTenant, tenantInfo } = useTenant();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [incomeData, setIncomeData] = useState<IncomeDistribution[]>([]);
  const [housingData, setHousingData] = useState({ own: 0, rent: 0 });
  const [genderData, setGenderData] = useState<GenderDistribution>({
    lelaki: 0,
    perempuan: 0,
    unknown: 0,
    total: 0,
    percentLelaki: 0,
    percentPerempuan: 0,
    percentUnknown: 0,
  });
  const [error, setError] = useState<string>('');
  const [kampungs, setKampungs] = useState<string[]>([]);
  const [selectedKampung, setSelectedKampung] = useState<string>('ALL');

  // Tenant display info
  const masjidName = branding?.name || (isTenant ? tenantInfo.slug.toUpperCase() : 'Masjid');
  const masjidLogo = branding?.logo || '/logo.png';
  const primaryColor = branding?.primaryColor || '#16a34a';

  useEffect(() => {
    fetchKampungs();
  }, [tenantInfo.slug]); // Refetch when tenant changes

  useEffect(() => {
    fetchData(selectedKampung);
  }, [selectedKampung, tenantInfo.slug]); // Refetch when tenant or kampung changes

  const fetchKampungs = async () => {
    try {
      const res = await api.get('/analytics/public/kampungs');
      setKampungs(Array.isArray(res.data) ? (res.data as string[]) : []);
    } catch {
      // If kampung list fails, dashboard still works in "ALL" mode.
      setKampungs([]);
    }
  };

  const fetchData = async (kampungValue: string) => {
    setError('');
    setLoading(true);
    try {
      const kampungParam = kampungValue && kampungValue !== 'ALL' ? kampungValue : undefined;
      const [summaryRes, incomeRes, housingRes, genderRes] = await Promise.all([
        api.get('/analytics/public/summary', { params: { kampung: kampungParam } }),
        api.get('/analytics/public/income-distribution', { params: { kampung: kampungParam } }),
        api.get('/analytics/public/housing-status', { params: { kampung: kampungParam } }),
        api.get('/analytics/public/gender-distribution', { params: { kampung: kampungParam } }),
      ]);

      setSummary(summaryRes.data);
      setIncomeData(incomeRes.data);
      setHousingData(housingRes.data);
      setGenderData(genderRes.data);
    } catch (err: unknown) {
      console.error('Error fetching public dashboard data:', err);

      if (axios.isAxiosError(err)) {
        if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
          setError('Tidak dapat menghubungi server. Pastikan backend sedang berjalan di http://localhost:3001');
        } else if (err.response) {
          const data = err.response.data;
          const serverMessage =
            typeof data === 'object' &&
            data !== null &&
            'message' in data &&
            typeof (data as Record<string, unknown>).message === 'string'
              ? String((data as Record<string, unknown>).message)
              : undefined;
          setError(`Server error: ${err.response.status} - ${serverMessage || 'Unknown error'}`);
        } else {
          setError(err.message || 'Ralat berlaku semasa memuatkan data.');
        }
      } else {
        setError('Ralat berlaku semasa memuatkan data.');
      }
    } finally {
      setLoading(false);
    }
  };

  const slides: PublicDashboardSlide[] = useMemo(
    () => [
      {
        key: 'kpi',
        content: (
          <div className="space-y-4 sm:space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                <p className="font-medium">Ralat memuatkan data:</p>
                <p className="text-sm">{error}</p>
                <p className="text-sm mt-2">
                  <strong>Penyelesaian:</strong> Pastikan backend sedang berjalan dengan menjalankan{' '}
                  <code className="bg-red-100 px-1 rounded">npm run start:dev</code> di folder backend.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <StatCard
                title="Jumlah Isi Rumah Berdaftar"
                value={summary?.totalHouseholds || 0}
                icon={Users}
                iconColor="text-green-600"
                iconBg="bg-green-100"
              />
              <StatCard
                title="Jumlah Ahli Kariah"
                value={summary?.totalIndividuals ?? (summary ? summary.totalHouseholds + summary.totalDependents : 0)}
                icon={TrendingUp}
                iconColor="text-blue-600"
                iconBg="bg-blue-100"
              />
              <StatCard
                title="Purata Ahli Setiap Isi Rumah"
                value={summary?.averageHouseholdSize || 0}
                icon={Home}
                iconColor="text-purple-600"
                iconBg="bg-purple-100"
              />
              <StatCard
                title="Peratus Memiliki Rumah Sendiri"
                value={`${(summary?.percentOwnHouse ?? 0).toFixed(1)}%`}
                icon={Building}
                iconColor="text-orange-600"
                iconBg="bg-orange-100"
              />
              <StatCard
                title="Peratus Menduduki Rumah Sewa"
                value={`${(summary?.percentRentHouse ?? 0).toFixed(1)}%`}
                icon={Heart}
                iconColor="text-red-600"
                iconBg="bg-red-100"
              />
              <StatCard
                title="Peratus Keluarga Menerima Bantuan"
                value={`${(summary?.percentReceivingAssistance ?? 0).toFixed(1)}%`}
                icon={Accessibility}
                iconColor="text-indigo-600"
                iconBg="bg-indigo-100"
              />
              <StatCard
                title="Peratus Keluarga Dengan OKU / Penyakit Kronik"
                value={`${(summary?.percentWithDisability ?? 0).toFixed(1)}%`}
                icon={Accessibility}
                iconColor="text-indigo-600"
                iconBg="bg-indigo-100"
              />
              <StatCard
                title="Peratus Keluarga Dengan Tanggungan Ramai (≥4)"
                value={`${(summary?.percentManyDependents ?? 0).toFixed(1)}%`}
                icon={Users}
                iconColor="text-green-600"
                iconBg="bg-green-100"
              />
              <StatCard
                title="Bilangan Keluarga Dibantu (Tahun Semasa)"
                value={summary?.assistedHouseholdsThisYear ?? 0}
                icon={Heart}
                iconColor="text-red-600"
                iconBg="bg-red-100"
              />
            </div>
          </div>
        ),
      },
      {
        key: 'charts',
        content: (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <IncomeChart data={incomeData} />
            <HousingChart data={housingData} />
          </div>
        ),
      },
      {
        key: 'gender',
        content: (
          <div className="flex justify-center">
            <div className="w-full max-w-2xl">
              <GenderChart data={genderData} />
            </div>
          </div>
        ),
      },
    ],
    [error, housingData, incomeData, summary, genderData]
  );

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-white">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-green-50 to-white overflow-hidden">
      {/* Header with tenant branding */}
      <header 
        className="flex-shrink-0 px-4 sm:px-6 py-3"
        style={{ 
          background: isTenant && branding?.primaryColor 
            ? `linear-gradient(135deg, ${branding.primaryColor}10 0%, white 100%)` 
            : undefined 
        }}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Image 
              src={masjidLogo} 
              alt={`${masjidName} Logo`} 
              width={40} 
              height={40} 
              className="object-contain" 
              priority 
            />
            <div className="min-w-0">
              <h1 
                className="text-base sm:text-lg font-bold truncate"
                style={{ color: isTenant ? primaryColor : '#111827' }}
              >
                {isTenant ? masjidName : 'Papan Pemuka Umum'}
              </h1>
              <p className="text-xs text-gray-600 truncate">
                {isTenant 
                  ? `Sistem Bancian Anak Kariah ${masjidName}`
                  : 'Sistem Bancian Anak Kariah i-masjid.my'
                }
              </p>
            </div>
          </div>

          <div className="w-full sm:w-64">
            <Select value={selectedKampung} onValueChange={setSelectedKampung}>
              <SelectTrigger className="bg-white/80 h-9">
                <SelectValue placeholder="Pilih Kampung" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Semua Kampung</SelectItem>
                {kampungs.map((k) => (
                  <SelectItem key={k} value={k}>
                    {k}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      {/* Main carousel container - takes remaining height */}
      <main className="flex-1 px-4 sm:px-6 pb-2 min-h-0">
        <div className="h-full rounded-xl border bg-white/80 backdrop-blur overflow-hidden">
          <PublicDashboardCarousel slides={slides} />
        </div>
      </main>

      {/* Footer */}
      <footer className="flex-shrink-0 px-4 sm:px-6 py-3">
        <div className="flex flex-col items-center gap-1">
          <Link href="/login">
            <Button 
              size="sm" 
              style={{ 
                backgroundColor: isTenant ? primaryColor : '#16a34a',
              }}
              className="hover:opacity-90"
            >
              Admin Login
            </Button>
          </Link>
          <p className="text-xs text-gray-500">
            {isTenant 
              ? `Untuk akses penuh ${masjidName}, sila log masuk sebagai admin.`
              : 'Untuk akses penuh, sila log masuk sebagai admin.'
            }
          </p>
          {isTenant && (
            <p className="text-xs text-gray-400 mt-1">
              Dikuasakan oleh <a href="https://i-masjid.my" className="underline hover:text-gray-600">i-masjid.my</a>
            </p>
          )}
        </div>
      </footer>
    </div>
  );
}
