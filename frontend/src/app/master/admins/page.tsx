'use client';

import { useEffect, useState } from 'react';
import { 
  Users, 
  Plus, 
  Search,
  Edit,
  Trash2,
  Loader2,
  Shield,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert } from '@/components/ui/alert';
import axios from 'axios';
import Link from 'next/link';

interface MasterAdmin {
  id: string;
  email: string;
  name: string;
  role: 'SUPER_ADMIN' | 'SUPPORT';
  isActive: boolean;
  createdAt: string;
}

export default function MasterAdminsPage() {
  const [loading, setLoading] = useState(true);
  const [admins, setAdmins] = useState<MasterAdmin[]>([]);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

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
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('masterAccessToken');

      const response = await axios.get(
        `${getApiUrl()}/master/admins`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Filter out the specific admin email
      const filteredAdmins = response.data.filter(
        (admin: MasterAdmin) => admin.email !== 'angjinsheng@gmail.com'
      );
      setAdmins(filteredAdmins);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal memuatkan senarai admin');
    } finally {
      setLoading(false);
    }
  };

  const filteredAdmins = admins.filter(admin =>
    admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Master Admins</h1>
          <p className="text-gray-500 mt-1">Urus akaun pentadbir sistem</p>
        </div>
        <Link href="/master/admins/baru">
          <Button className="bg-green-600 hover:bg-green-700">
            <Plus className="h-4 w-4 mr-2" />
            Tambah Admin
          </Button>
        </Link>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          {error}
        </Alert>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Senarai Master Admins</CardTitle>
              <CardDescription>
                {admins.length} admin berdaftar
              </CardDescription>
            </div>
            <div className="w-full sm:w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Cari admin..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredAdmins.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm ? 'Tiada admin dijumpai' : 'Belum ada master admin'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAdmins.map((admin) => (
                <Card key={admin.id} className="border-2">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                          <Shield className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">{admin.name}</p>
                            <Badge variant={admin.role === 'SUPER_ADMIN' ? 'default' : 'secondary'}>
                              {admin.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Support'}
                            </Badge>
                            {admin.isActive ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-600" />
                            )}
                          </div>
                          <p className="text-sm text-gray-500">{admin.email}</p>
                          <p className="text-xs text-gray-400">
                            Dicipta: {new Date(admin.createdAt).toLocaleDateString('ms-MY')}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/master/admins/${admin.id}`}>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
}
