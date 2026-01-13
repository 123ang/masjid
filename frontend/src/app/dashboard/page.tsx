'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import StatCard from '@/components/dashboard/StatCard';
import IncomeChart from '@/components/dashboard/IncomeChart';
import HousingChart from '@/components/dashboard/HousingChart';
import RecentSubmissions from '@/components/dashboard/RecentSubmissions';
import { Loader2, Users, TrendingUp, Home, Building, Heart, Accessibility } from 'lucide-react';
import { AnalyticsSummary, IncomeDistribution } from '@/types';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [incomeData, setIncomeData] = useState<IncomeDistribution[]>([]);
  const [housingData, setHousingData] = useState({ own: 0, rent: 0 });
  const [recentSubmissions, setRecentSubmissions] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [summaryRes, incomeRes, housingRes, recentRes] = await Promise.all([
        api.get('/analytics/summary'),
        api.get('/analytics/income-distribution'),
        api.get('/analytics/housing-status'),
        api.get('/analytics/recent-submissions'),
      ]);

      setSummary(summaryRes.data);
      setIncomeData(incomeRes.data);
      setHousingData(housingRes.data);
      setRecentSubmissions(recentRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Papan Pemuka</h1>
        <p className="text-gray-600 mt-1">Sistem Bancian Anak Kariah Masjid Al-Huda Padang Matsirat</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Jumlah Isi Rumah"
          value={summary?.totalHouseholds || 0}
          icon={Users}
          iconColor="text-green-600"
          iconBg="bg-green-100"
        />
        <StatCard
          title="Purata Ahli Keluarga"
          value={summary?.averageHouseholdSize || 0}
          icon={TrendingUp}
          iconColor="text-blue-600"
          iconBg="bg-blue-100"
        />
        <StatCard
          title="Keluarga Rumah Sendiri"
          value={summary?.totalOwnHouse || 0}
          icon={Home}
          iconColor="text-purple-600"
          iconBg="bg-purple-100"
        />
        <StatCard
          title="Keluarga Rumah Sewa"
          value={summary?.totalRentHouse || 0}
          icon={Building}
          iconColor="text-orange-600"
          iconBg="bg-orange-100"
        />
        <StatCard
          title="Penerima Bantuan"
          value={summary?.totalReceivingAssistance || 0}
          icon={Heart}
          iconColor="text-red-600"
          iconBg="bg-red-100"
        />
        <StatCard
          title="Keluarga dengan OKU"
          value={summary?.totalWithDisability || 0}
          icon={Accessibility}
          iconColor="text-indigo-600"
          iconBg="bg-indigo-100"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <IncomeChart data={incomeData} />
        <HousingChart data={housingData} />
      </div>

      {/* Recent Submissions */}
      <RecentSubmissions data={recentSubmissions} />
    </div>
  );
}
