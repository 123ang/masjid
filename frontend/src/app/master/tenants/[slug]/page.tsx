'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft,
  Building2,
  Loader2,
  Upload,
  Image as ImageIcon,
  X,
  Users,
  Plus,
  Edit,
  Trash2,
  Shield,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert } from '@/components/ui/alert';
import axios from 'axios';

interface Tenant {
  id: string;
  slug: string;
  name: string;
  email?: string;
  phone?: string;
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  masjid?: {
    id: string;
    name: string;
    address?: string;
    phone?: string;
  };
}

interface TenantUser {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'IMAM' | 'PENGURUSAN';
  isActive: boolean;
  createdAt: string;
}

export default function EditTenantPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  
  // Admin users management
  const [users, setUsers] = useState<TenantUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [editingUser, setEditingUser] = useState<TenantUser | null>(null);
  const [userFormData, setUserFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'ADMIN' as 'ADMIN' | 'IMAM' | 'PENGURUSAN',
  });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    primaryColor: '#16a34a',
    secondaryColor: '#15803d',
    logo: '',
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE' | 'SUSPENDED',
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
    fetchTenant();
    fetchUsers();
  }, [slug]);

  const fetchTenant = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('masterAccessToken');
      const response = await axios.get<Tenant>(
        `${getApiUrl()}/master/tenants/${slug}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const tenant = response.data;
      setFormData({
        name: tenant.name || '',
        email: tenant.email || '',
        phone: tenant.phone || '',
        primaryColor: tenant.primaryColor || '#16a34a',
        secondaryColor: tenant.secondaryColor || '#15803d',
        logo: tenant.logo || '',
        status: tenant.status,
      });
      
      if (tenant.logo) {
        setPreview(tenant.logo);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal memuatkan maklumat tenant');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Hanya fail imej dibenarkan');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Saiz fail terlalu besar. Maksimum 5MB');
      return;
    }

    try {
      setUploading(true);
      setError('');

      // Create FormData
      const formDataToUpload = new FormData();
      formDataToUpload.append('file', file);
      formDataToUpload.append('tenantSlug', slug);

      const token = localStorage.getItem('masterAccessToken');
      const response = await axios.post(
        `${getApiUrl()}/master/tenants/${slug}/upload-logo`,
        formDataToUpload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      const logoUrl = response.data.logoUrl;
      // Use the logoUrl from backend (already includes full URL)
      setFormData({ ...formData, logo: logoUrl });
      setPreview(logoUrl);
      setSuccess('Logo berjaya dimuat naik');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal memuat naik logo');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveLogo = () => {
    setFormData({ ...formData, logo: '' });
    setPreview(null);
  };

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const token = localStorage.getItem('masterAccessToken');

      const response = await axios.get(
        `${getApiUrl()}/master/tenants/${slug}/users`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUsers(response.data);
    } catch (err: any) {
      console.error('Error fetching users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleAddUser = async () => {
    if (!userFormData.name || !userFormData.email || !userFormData.password) {
      setError('Sila isi semua medan yang diperlukan');
      return;
    }

    if (userFormData.password.length < 8) {
      setError('Kata laluan mesti sekurang-kurangnya 8 aksara');
      return;
    }

    if (userFormData.password !== userFormData.confirmPassword) {
      setError('Kata laluan tidak sepadan');
      return;
    }

    try {
      const token = localStorage.getItem('masterAccessToken');
      await axios.post(
        `${getApiUrl()}/master/tenants/${slug}/users`,
        {
          name: userFormData.name,
          email: userFormData.email,
          password: userFormData.password,
          role: userFormData.role,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccess('Pengguna berjaya ditambah');
      setShowAddUser(false);
      setUserFormData({ name: '', email: '', password: '', confirmPassword: '', role: 'ADMIN' });
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal menambah pengguna');
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;

    if (!userFormData.name || !userFormData.email) {
      setError('Sila isi semua medan yang diperlukan');
      return;
    }

    if (userFormData.password && userFormData.password.length < 8) {
      setError('Kata laluan mesti sekurang-kurangnya 8 aksara');
      return;
    }

    if (userFormData.password && userFormData.password !== userFormData.confirmPassword) {
      setError('Kata laluan tidak sepadan');
      return;
    }

    try {
      const token = localStorage.getItem('masterAccessToken');
      const updateData: any = {
        name: userFormData.name,
        email: userFormData.email,
        role: userFormData.role,
      };

      if (userFormData.password) {
        updateData.password = userFormData.password;
      }

      await axios.put(
        `${getApiUrl()}/master/tenants/${slug}/users/${editingUser.id}`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccess('Pengguna berjaya dikemaskini');
      setEditingUser(null);
      setUserFormData({ name: '', email: '', password: '', confirmPassword: '', role: 'ADMIN' });
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal mengemaskini pengguna');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Adakah anda pasti ingin memadam pengguna ini?')) {
      return;
    }

    try {
      const token = localStorage.getItem('masterAccessToken');
      await axios.delete(
        `${getApiUrl()}/master/tenants/${slug}/users/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccess('Pengguna berjaya dipadam');
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal memadam pengguna');
    }
  };

  const startEditUser = (user: TenantUser) => {
    setEditingUser(user);
    setUserFormData({
      name: user.name,
      email: user.email,
      password: '',
      confirmPassword: '',
      role: user.role,
    });
    setShowAddUser(false);
  };

  const cancelUserForm = () => {
    setShowAddUser(false);
    setEditingUser(null);
    setUserFormData({ name: '', email: '', password: '', confirmPassword: '', role: 'ADMIN' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const token = localStorage.getItem('masterAccessToken');
      await axios.put(
        `${getApiUrl()}/master/tenants/${slug}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setSuccess('Tenant berjaya dikemaskini');
      setTimeout(() => {
        router.push('/master/tenants');
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal mengemaskini tenant');
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
      <Link href="/master/tenants">
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali ke Senarai Tenant
        </Button>
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Edit Tenant: {slug}
          </CardTitle>
          <CardDescription>
            Kemaskini maklumat dan tetapan tenant
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">{error}</Alert>
            )}
            {success && (
              <Alert className="bg-green-50 text-green-800 border-green-200">
                {success}
              </Alert>
            )}

            {/* Logo Upload */}
            <div className="space-y-2">
              <Label>Logo Masjid</Label>
              <div className="flex items-start gap-4">
                {preview ? (
                  <div className="relative w-32 h-32">
                    <img
                      src={preview}
                      alt="Logo preview"
                      className="w-full h-full object-contain border rounded-lg bg-white p-2"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 shadow-lg"
                      title="Buang logo"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <div className="w-32 h-32 border-2 border-dashed rounded-lg flex items-center justify-center bg-gray-50">
                    <ImageIcon className="h-8 w-8 text-gray-400" />
                  </div>
                )}
                <div className="flex-1">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={uploading}
                    className="hidden"
                    id="logo-upload"
                  />
                  <Label htmlFor="logo-upload">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={uploading}
                      className="cursor-pointer"
                      asChild
                    >
                      <span>
                        {uploading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Memuat naik...
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 mr-2" />
                            Muat Naik Logo
                          </>
                        )}
                      </span>
                    </Button>
                  </Label>
                  <p className="text-xs text-gray-500 mt-2">
                    Format: JPG, PNG, GIF. Saiz maksimum: 5MB
                  </p>
                </div>
              </div>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Nama Tenant *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Masjid Al-Huda"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">E-mel</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="info@masjid.com"
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Telefon</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+60 12-345 6789"
              />
            </div>

            {/* Colors */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primaryColor">Warna Utama</Label>
                <div className="flex gap-2">
                  <Input
                    id="primaryColor"
                    name="primaryColor"
                    type="color"
                    value={formData.primaryColor}
                    onChange={handleChange}
                    className="w-20 h-10"
                  />
                  <Input
                    type="text"
                    value={formData.primaryColor}
                    onChange={handleChange}
                    name="primaryColor"
                    pattern="^#[0-9A-Fa-f]{6}$"
                    placeholder="#16a34a"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="secondaryColor">Warna Sekunder</Label>
                <div className="flex gap-2">
                  <Input
                    id="secondaryColor"
                    name="secondaryColor"
                    type="color"
                    value={formData.secondaryColor}
                    onChange={handleChange}
                    className="w-20 h-10"
                  />
                  <Input
                    type="text"
                    value={formData.secondaryColor}
                    onChange={handleChange}
                    name="secondaryColor"
                    pattern="^#[0-9A-Fa-f]{6}$"
                    placeholder="#15803d"
                  />
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="ACTIVE">Aktif</option>
                <option value="INACTIVE">Tidak Aktif</option>
                <option value="SUSPENDED">Digantung</option>
              </select>
            </div>

            <div className="flex gap-4">
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
                  'Simpan Perubahan'
                )}
              </Button>
              <Link href="/master/tenants">
                <Button type="button" variant="outline">
                  Batal
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Admin Users Management */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Akaun Admin
              </CardTitle>
              <CardDescription>
                Urus akaun pentadbir untuk tenant ini
              </CardDescription>
            </div>
            <Button
              onClick={() => {
                setShowAddUser(true);
                setEditingUser(null);
                setUserFormData({ name: '', email: '', password: '', confirmPassword: '', role: 'ADMIN' });
              }}
              className="bg-green-600 hover:bg-green-700"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Tambah Pengguna
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loadingUsers ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-green-600" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              <p>Belum ada pengguna</p>
            </div>
          ) : (
            <div className="space-y-3">
              {users.map((user) => (
                <Card key={user.id} className="border-2">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <Shield className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">{user.name}</p>
                            <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                              {user.role}
                            </span>
                            {user.isActive ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-600" />
                            )}
                          </div>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => startEditUser(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Add/Edit User Form */}
          {(showAddUser || editingUser) && (
            <Card className="mt-4 border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-lg">
                  {editingUser ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nama Penuh *</Label>
                    <Input
                      value={userFormData.name}
                      onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
                      placeholder="Ahmad bin Ali"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>E-mel *</Label>
                    <Input
                      type="email"
                      value={userFormData.email}
                      onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                      placeholder="ahmad@example.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Peranan *</Label>
                  <select
                    value={userFormData.role}
                    onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="ADMIN">Admin</option>
                    <option value="IMAM">Imam</option>
                    <option value="PENGURUSAN">Pengurusan</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Kata Laluan {editingUser && '(Kosongkan jika tidak mahu tukar)'}</Label>
                    <Input
                      type="password"
                      value={userFormData.password}
                      onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                      placeholder="Min 8 aksara"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Sahkan Kata Laluan</Label>
                    <Input
                      type="password"
                      value={userFormData.confirmPassword}
                      onChange={(e) => setUserFormData({ ...userFormData, confirmPassword: e.target.value })}
                      placeholder="Masukkan semula"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={editingUser ? handleUpdateUser : handleAddUser}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {editingUser ? 'Kemaskini' : 'Tambah'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={cancelUserForm}
                  >
                    Batal
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
