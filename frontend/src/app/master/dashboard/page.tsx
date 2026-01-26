'use client';

import { useEffect, useState } from 'react';
import { 
  Building2, 
  Users, 
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import axios from 'axios';

interface TenantStats {
  totalTenants: number;
  activeTenants: number;
  inactiveTenants: number;
  totalHouseholds: number;
  totalUsers: number;
  topTenants: Array<{
    slug: string;
    name: string;
    households: number;
  }>;
}

export default function MasterDashboardPage() {
  const [stats, setStats] = useState<TenantStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const getApiUrl = () => {
    if (typeof window !== 'undefined') {
      const isProduction = window.location.hostname !== 'localhost' && 
                          window.location.hostname !== '127.0.0.1';
      if (isProduction) {
        return '/api';
      }
    }
    return 'http://localhost:3001/api';
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('masterAccessToken');
        const response = await axios.get(`${getApiUrl()}/master/tenants/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Gagal memuatkan data');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Cuba Lagi</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Master Dashboard</h1>
        <p className="text-gray-500">Gambaran keseluruhan platform i-masjid.my</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Jumlah Tenant
            </CardTitle>
            <Building2 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalTenants || 0}</div>
            <p className="text-xs text-gray-500">
              {stats?.activeTenants || 0} aktif, {stats?.inactiveTenants || 0} tidak aktif
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Jumlah Pengguna
            </CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            <p className="text-xs text-gray-500">
              Semua tenant
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
