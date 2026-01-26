'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert } from '@/components/ui/alert';
import { Settings, Loader2, Save } from 'lucide-react';
import axios from 'axios';

interface MasterAdmin {
  id: string;
  email: string;
  name: string;
  role: string;
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [admin, setAdmin] = useState<MasterAdmin | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
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
  }, []);

  const fetchAdmin = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('masterAccessToken');
      const adminData = localStorage.getItem('masterAdmin');
      
      if (adminData) {
        const adminObj = JSON.parse(adminData);
        setAdmin(adminObj);
        setFormData({
          name: adminObj.name || '',
          email: adminObj.email || '',
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      }
    } catch (err: any) {
      setError('Gagal memuatkan maklumat admin');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Note: Profile update endpoint would need to be added to backend
    setSuccess('Kemaskini profil akan ditambah kemudian');
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Kata laluan baru tidak sepadan');
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('Kata laluan mestilah sekurang-kurangnya 6 aksara');
      return;
    }

    try {
      setSaving(true);
      const token = localStorage.getItem('masterAccessToken');
      
      // Note: Password change endpoint would need to be added to backend
      setSuccess('Tukar kata laluan akan ditambah kemudian');
      
      // Reset password fields
      setFormData({
        ...formData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal menukar kata laluan');
    } finally {
      setSaving(false);
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
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Tetapan
          </CardTitle>
          <CardDescription>
            Urus tetapan akaun Master Admin anda
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">{error}</Alert>
          )}
          {success && (
            <Alert className="bg-green-50 text-green-800 border-green-200">
              {success}
            </Alert>
          )}

          {/* Profile Settings */}
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <h3 className="text-lg font-semibold">Profil</h3>
            
            <div className="space-y-2">
              <Label htmlFor="name">Nama</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mel</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled
                className="bg-gray-50"
              />
              <p className="text-xs text-gray-500">E-mel tidak boleh diubah</p>
            </div>

            <Button
              type="submit"
              disabled={saving}
              className="bg-green-600 hover:bg-green-700"
            >
              <Save className="h-4 w-4 mr-2" />
              Simpan Perubahan
            </Button>
          </form>

          <div className="border-t pt-6">
            {/* Password Change */}
            <form onSubmit={handleChangePassword} className="space-y-4">
              <h3 className="text-lg font-semibold">Tukar Kata Laluan</h3>
              
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Kata Laluan Semasa</Label>
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">Kata Laluan Baru</Label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  value={formData.newPassword}
                  onChange={handleChange}
                  required
                  minLength={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Sahkan Kata Laluan Baru</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  minLength={6}
                />
              </div>

              <Button
                type="submit"
                disabled={saving}
                className="bg-green-600 hover:bg-green-700"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Tukar Kata Laluan
                  </>
                )}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
