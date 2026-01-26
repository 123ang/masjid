'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Building2, 
  Plus, 
  Search,
  ExternalLink,
  Edit,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import axios from 'axios';

interface Tenant {
  id: string;
  slug: string;
  name: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  logo?: string;
  primaryColor?: string;
  email?: string;
  phone?: string;
  createdAt: string;
  masjid?: {
    id: string;
    name: string;
    _count: {
      users: number;
      households: number;
      kampungs: number;
    };
  };
}

interface TenantsResponse {
  data: Tenant[];
  total: number;
  page: number;
  totalPages: number;
}

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

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

  const fetchTenants = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('masterAccessToken');
      const response = await axios.get<TenantsResponse>(
        `${getApiUrl()}/master/tenants`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { page, search: search || undefined }
        }
      );
      setTenants(response.data.data);
      setTotalPages(response.data.totalPages);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal memuatkan data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, [page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchTenants();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
            <CheckCircle className="h-3 w-3 mr-1" />
            Aktif
          </Badge>
        );
      case 'INACTIVE':
        return (
          <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">
            <XCircle className="h-3 w-3 mr-1" />
            Tidak Aktif
          </Badge>
        );
      case 'SUSPENDED':
        return (
          <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
            <AlertCircle className="h-3 w-3 mr-1" />
            Digantung
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Senarai Tenants</h1>
          <p className="text-gray-500">Urus semua masjid dalam platform</p>
        </div>
        <Link href="/master/tenants/baru">
          <Button className="bg-purple-600 hover:bg-purple-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Tambah Tenant Baru
          </Button>
        </Link>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cari nama atau subdomain..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit" variant="outline">
              Cari
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Tenants List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        </div>
      ) : error ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchTenants}>Cuba Lagi</Button>
          </CardContent>
        </Card>
      ) : tenants.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 mb-4">Tiada tenant dijumpai</p>
            <Link href="/master/tenants/baru">
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Plus className="h-4 w-4 mr-2" />
                Tambah Tenant Pertama
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {tenants.map((tenant) => (
            <Card key={tenant.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                      style={{ backgroundColor: tenant.primaryColor || '#16a34a' }}
                    >
                      {tenant.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{tenant.name}</h3>
                        {getStatusBadge(tenant.status)}
                      </div>
                      <p className="text-sm text-gray-500">
                        <a 
                          href={`https://${tenant.slug}.i-masjid.my`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-600 hover:underline"
                        >
                          {tenant.slug}.i-masjid.my
                        </a>
                      </p>
                      {tenant.email && (
                        <p className="text-sm text-gray-500">{tenant.email}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 lg:gap-8">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">
                        {tenant.masjid?._count?.households || 0}
                      </p>
                      <p className="text-xs text-gray-500">Isi Rumah</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">
                        {tenant.masjid?._count?.users || 0}
                      </p>
                      <p className="text-xs text-gray-500">Pengguna</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">
                        {tenant.masjid?._count?.kampungs || 0}
                      </p>
                      <p className="text-xs text-gray-500">Kampung</p>
                    </div>

                    <div className="flex gap-2">
                      <Link href={`/master/tenants/${tenant.slug}`}>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </Link>
                      <a 
                        href={`https://${tenant.slug}.i-masjid.my`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="outline" size="sm">
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Lawati
                        </Button>
                      </a>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <Button
                variant="outline"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                Sebelumnya
              </Button>
              <span className="flex items-center px-4">
                Halaman {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
              >
                Seterusnya
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
