'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Loader2, Save, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert } from '@/components/ui/alert';
import axios from 'axios';

export default function EditMasterAdminPage() {
  const router = useRouter();
  const params = useParams();
  const adminId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'SUPPORT' as 'SUPER_ADMIN' | 'SUPPORT',
    isActive: true,
    password: '',
    confirmPassword: '',
  });

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
    fetchAdmin();
  }, [adminId]);

  const fetchAdmin = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('masterAccessToken');

      const response = await axios.get(
        `${getApiUrl()}/master/admins/${adminId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const admin = response.data;
      setFormData({
        name: admin.name,
        email: admin.email,
        role: admin.role,
        isActive: admin.isActive,
        password: '',
        confirmPassword: '',
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal memuatkan data admin');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.name || !formData.email) {
      setError('Sila isi semua medan yang diperlukan');
      return;
    }

    // If password is being changed, validate it
    if (formData.password) {
      if (formData.password.length < 8) {
        setError('Kata laluan mesti sekurang-kurangnya 8 aksara');
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setError('Kata laluan tidak sepadan');
        return;
      }
    }

    try {
      setSaving(true);
      const token = localStorage.getItem('masterAccessToken');

      const updateData: any = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        isActive: formData.isActive,
      };

      // Only include password if it's being changed
      if (formData.password) {
        updateData.password = formData.password;
      }

      await axios.put(
        `${getApiUrl()}/master/admins/${adminId}`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      router.push('/master/admins');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal mengemaskini admin');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Adakah anda pasti ingin memadam admin ini? Tindakan ini tidak boleh dibatalkan.')) {
      return;
    }

    try {
      setDeleting(true);
      const token = localStorage.getItem('masterAccessToken');

      await axios.delete(
        `${getApiUrl()}/master/admins/${adminId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      router.push('/master/admins');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal memadam admin');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Kembali
      </Button>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Edit Master Admin</CardTitle>
          <CardDescription>
            Kemaskini maklumat pentadbir sistem
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Penuh *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Masukkan nama penuh"
                disabled={saving || deleting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mel *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="admin@example.com"
                disabled={saving || deleting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Peranan *</Label>
              <select
                id="role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as 'SUPER_ADMIN' | 'SUPPORT' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                disabled={saving || deleting}
              >
                <option value="SUPPORT">Support</option>
                <option value="SUPER_ADMIN">Super Admin</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="isActive">Status</Label>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                  disabled={saving || deleting}
                />
                <Label htmlFor="isActive" className="font-normal">
                  Akaun Aktif
                </Label>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Tukar Kata Laluan (Opsional)</h3>
              <p className="text-sm text-gray-500 mb-4">
                Biarkan kosong jika tidak mahu menukar kata laluan
              </p>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Kata Laluan Baru</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Minimum 8 aksara"
                    disabled={saving || deleting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Sahkan Kata Laluan Baru</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="Masukkan semula kata laluan"
                    disabled={saving || deleting}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={saving || deleting}
                className="bg-green-600 hover:bg-green-700 flex-1"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Simpan
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={saving || deleting}
              >
                Batal
              </Button>
            </div>
          </form>

          <div className="border-t mt-8 pt-6">
            <h3 className="text-lg font-semibold text-red-600 mb-2">Zon Bahaya</h3>
            <p className="text-sm text-gray-500 mb-4">
              Tindakan ini tidak boleh dibatalkan. Sila pastikan anda pasti sebelum meneruskan.
            </p>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={saving || deleting}
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Memadam...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Padam Admin
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
