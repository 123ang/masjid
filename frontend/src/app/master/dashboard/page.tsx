'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Building2, 
  Users, 
  Home, 
  TrendingUp,
  Plus,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Master Dashboard</h1>
          <p className="text-gray-500">Gambaran keseluruhan platform i-masjid.my</p>
        </div>
        <Link href="/master/tenants/baru">
          <Button className="bg-purple-600 hover:bg-purple-700">
            <Plus className="h-4 w-4 mr-2" />
            Tambah Tenant Baru
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Jumlah Isi Rumah
            </CardTitle>
            <Home className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalHouseholds || 0}</div>
            <p className="text-xs text-gray-500">
              Rekod keseluruhan
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Purata Per Tenant
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalTenants && stats?.totalHouseholds
                ? Math.round(stats.totalHouseholds / stats.totalTenants)
                : 0}
            </div>
            <p className="text-xs text-gray-500">
              Isi rumah per tenant
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Tenants */}
      <Card>
        <CardHeader>
          <CardTitle>Top Tenants</CardTitle>
          <CardDescription>Tenant dengan rekod isi rumah terbanyak</CardDescription>
        </CardHeader>
        <CardContent>
          {stats?.topTenants && stats.topTenants.length > 0 ? (
            <div className="space-y-4">
              {stats.topTenants.map((tenant, index) => (
                <div 
                  key={tenant.slug}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-white font-bold
                      ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-amber-600' : 'bg-purple-500'}
                    `}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{tenant.name}</p>
                      <p className="text-sm text-gray-500">{tenant.slug}.i-masjid.my</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold text-purple-600">{tenant.households}</p>
                      <p className="text-xs text-gray-500">isi rumah</p>
                    </div>
                    <a 
                      href={`https://${tenant.slug}.i-masjid.my`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-purple-600"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Building2 className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>Tiada tenant lagi</p>
              <Link href="/master/tenants/baru">
                <Button variant="link" className="text-purple-600">
                  Tambah tenant pertama
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link href="/master/tenants/baru">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Plus className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="font-medium">Tambah Tenant Baru</p>
                <p className="text-sm text-gray-500">Cipta masjid baru dengan subdomain</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/master/tenants">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">Urus Tenants</p>
                <p className="text-sm text-gray-500">Lihat dan edit semua tenant</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/master/admins">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="font-medium">Master Admins</p>
                <p className="text-sm text-gray-500">Urus pentadbir master</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
