'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import StatCard from '@/components/dashboard/StatCard';
import IncomeChart from '@/components/dashboard/IncomeChart';
import HousingChart from '@/components/dashboard/HousingChart';
import { Loader2, Users, TrendingUp, Home, Building, Heart, Accessibility } from 'lucide-react';
import { AnalyticsSummary, IncomeDistribution } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [incomeData, setIncomeData] = useState<IncomeDistribution[]>([]);
  const [housingData, setHousingData] = useState({ own: 0, rent: 0 });
  const [error, setError] = useState<string>('');
  const [kampungs, setKampungs] = useState<string[]>([]);
  const [selectedKampung, setSelectedKampung] = useState<string>('ALL');

  useEffect(() => {
    fetchKampungs();
  }, []);

  useEffect(() => {
    fetchData(selectedKampung);
  }, [selectedKampung]);

  const fetchKampungs = async () => {
    try {
      const res = await api.get('/analytics/kampungs');
      setKampungs(Array.isArray(res.data) ? (res.data as string[]) : []);
    } catch {
      setKampungs([]);
    }
  };

  const fetchData = async (kampungValue: string) => {
    setError('');
    setLoading(true);
    try {
      const kampungParam = kampungValue && kampungValue !== 'ALL' ? kampungValue : undefined;
      const [summaryRes, incomeRes, housingRes] = await Promise.all([
        api.get('/analytics/summary', { params: { kampung: kampungParam } }),
        api.get('/analytics/income-distribution', { params: { kampung: kampungParam } }),
        api.get('/analytics/housing-status', { params: { kampung: kampungParam } }),
      ]);

      setSummary(summaryRes.data);
      setIncomeData(incomeRes.data);
      setHousingData(housingRes.data);
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      
      // Provide helpful error messages
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        setError('Tidak dapat menghubungi server. Pastikan backend sedang berjalan di http://localhost:3001');
      } else if (error.response) {
        setError(`Server error: ${error.response.status} - ${error.response.data?.message || 'Unknown error'}`);
      } else {
        setError(error.message || 'Ralat berlaku semasa memuatkan data.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Papan Pemuka</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Sistem Bancian Anak Kariah Masjid Al-Huda Padang Matsirat
          </p>
        </div>

        <div className="w-full sm:w-72">
          <Select value={selectedKampung} onValueChange={setSelectedKampung}>
            <SelectTrigger className="bg-white">
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

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p className="font-medium">Ralat memuatkan data:</p>
          <p className="text-sm">{error}</p>
          <p className="text-sm mt-2">
            <strong>Penyelesaian:</strong> Pastikan backend sedang berjalan dengan menjalankan <code className="bg-red-100 px-1 rounded">npm run start:dev</code> di folder backend.
          </p>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <IncomeChart data={incomeData} />
        <HousingChart data={housingData} />
      </div>
    </div>
  );
}
