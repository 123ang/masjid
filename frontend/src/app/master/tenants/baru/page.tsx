'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft,
  Building2,
  Loader2,
  Check,
  Copy,
  ExternalLink,
  Upload,
  Image as ImageIcon,
  X
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert } from '@/components/ui/alert';
import axios from 'axios';

interface CreateTenantResult {
  message: string;
  subdomain: string;
  tenant: {
    id: string;
    slug: string;
    name: string;
  };
  masjid: {
    id: string;
    name: string;
  };
  adminUser?: {
    id: string;
    name: string;
    email: string;
  };
}

export default function CreateTenantPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<CreateTenantResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    slug: '',
    name: '',
    email: '',
    phone: '',
    logo: '',
    primaryColor: '#16a34a',
    secondaryColor: '#15803d',
    masjidName: '',
    masjidAddress: '',
    masjidPhone: '',
    adminName: '',
    adminEmail: '',
    adminPassword: '',
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Auto-format slug
    if (name === 'slug') {
      setFormData({
        ...formData,
        slug: value.toLowerCase().replace(/[^a-z0-9-]/g, ''),
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Store file for upload after tenant creation
    setFormData({ ...formData, logo: URL.createObjectURL(file) });
  };

  const handleRemoveLogo = () => {
    setFormData({ ...formData, logo: '' });
    setLogoPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('masterAccessToken');
      
      // Step 1: Create tenant
      const response = await axios.post<CreateTenantResult>(
        `${getApiUrl()}/master/tenants`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Step 2: Upload logo if provided
      if (logoPreview) {
        try {
          setUploading(true);
          const fileInput = document.getElementById('logo-upload') as HTMLInputElement;
          const file = fileInput?.files?.[0];
          
          if (file) {
            const formDataToUpload = new FormData();
            formDataToUpload.append('file', file);
            
            await axios.post(
              `${getApiUrl()}/master/tenants/${response.data.tenant.slug}/upload-logo`,
              formDataToUpload,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'multipart/form-data',
                },
              }
            );
          }
        } catch (uploadErr: any) {
          console.error('Logo upload failed:', uploadErr);
          // Don't fail the whole operation if logo upload fails
        } finally {
          setUploading(false);
        }
      }
      
      setSuccess(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal mencipta tenant');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-green-800">Tenant Berjaya Dicipta!</CardTitle>
            <CardDescription className="text-green-700">
              {success.tenant.name} kini sedia untuk digunakan
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Subdomain</p>
                  <p className="font-mono text-lg">{success.subdomain}</p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => copyToClipboard(`https://${success.subdomain}`)}
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                  <a 
                    href={`https://${success.subdomain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </a>
                </div>
              </div>

              {success.adminUser && (
                <>
                  <hr />
                  <div>
                    <p className="text-sm text-gray-500">Login Admin</p>
                    <p className="font-medium">{success.adminUser.email}</p>
                    <p className="text-sm text-gray-400">
                      Kata laluan: {formData.adminPassword}
                    </p>
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-3 justify-center pt-4">
              <Link href="/master/tenants">
                <Button variant="outline">
                  Lihat Semua Tenants
                </Button>
              </Link>
              <Button 
                className="bg-purple-600 hover:bg-purple-700"
                onClick={() => {
                  setSuccess(null);
                  setFormData({
                    slug: '',
                    name: '',
                    email: '',
                    phone: '',
                    logo: '',
                    primaryColor: '#16a34a',
                    secondaryColor: '#15803d',
                    masjidName: '',
                    masjidAddress: '',
                    masjidPhone: '',
                    adminName: '',
                    adminEmail: '',
                    adminPassword: '',
                  });
                  setLogoPreview(null);
                }}
              >
                Tambah Lagi
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/master/tenants">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Building2 className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <CardTitle>Tambah Tenant Baru</CardTitle>
              <CardDescription>
                Cipta masjid baru dengan subdomain tersendiri
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">{error}</Alert>
            )}

            {/* Tenant Info */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900 border-b pb-2">
                Maklumat Tenant
              </h3>

              {/* Logo Upload */}
              <div className="space-y-2">
                <Label>Logo Masjid (Pilihan)</Label>
                <div className="flex items-start gap-4">
                  {logoPreview ? (
                    <div className="relative w-24 h-24">
                      <img
                        src={logoPreview}
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
                    <div className="w-24 h-24 border-2 border-dashed rounded-lg flex items-center justify-center bg-gray-50">
                      <ImageIcon className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      disabled={loading || uploading}
                      className="hidden"
                      id="logo-upload"
                    />
                    <Label htmlFor="logo-upload">
                      <Button
                        type="button"
                        variant="outline"
                        disabled={loading || uploading}
                        className="cursor-pointer"
                        asChild
                      >
                        <span>
                          <Upload className="h-4 w-4 mr-2" />
                          Pilih Logo
                        </span>
                      </Button>
                    </Label>
                    <p className="text-xs text-gray-500 mt-1">
                      JPG, PNG, GIF. Maks 5MB
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="slug">Subdomain *</Label>
                  <div className="flex items-center">
                    <Input
                      id="slug"
                      name="slug"
                      value={formData.slug}
                      onChange={handleChange}
                      placeholder="alhuda"
                      className="rounded-r-none"
                      required
                    />
                    <span className="bg-gray-100 border border-l-0 px-3 py-2 text-sm text-gray-500 rounded-r-md">
                      .i-masjid.my
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Huruf kecil, nombor dan tanda sempang sahaja
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Nama Paparan *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Masjid Al-Huda"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-mel (Pilihan)</Label>
                  <Input
                    id="email"
                    name="email"
                    type="text"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="masjid@example.com (pilihan)"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefon</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="04-1234567"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Warna Utama</Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      id="primaryColor"
                      name="primaryColor"
                      value={formData.primaryColor}
                      onChange={handleChange}
                      className="h-10 w-16 rounded border cursor-pointer"
                    />
                    <Input
                      value={formData.primaryColor}
                      onChange={handleChange}
                      name="primaryColor"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="secondaryColor">Warna Sekunder</Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      id="secondaryColor"
                      name="secondaryColor"
                      value={formData.secondaryColor}
                      onChange={handleChange}
                      className="h-10 w-16 rounded border cursor-pointer"
                    />
                    <Input
                      value={formData.secondaryColor}
                      onChange={handleChange}
                      name="secondaryColor"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Masjid Info */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900 border-b pb-2">
                Maklumat Masjid
              </h3>

              <div className="space-y-2">
                <Label htmlFor="masjidName">Nama Masjid</Label>
                <Input
                  id="masjidName"
                  name="masjidName"
                  value={formData.masjidName}
                  onChange={handleChange}
                  placeholder="Sama dengan nama paparan jika kosong"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="masjidAddress">Alamat Masjid</Label>
                <Input
                  id="masjidAddress"
                  name="masjidAddress"
                  value={formData.masjidAddress}
                  onChange={handleChange}
                  placeholder="Jalan Masjid, 12345 Bandar"
                />
              </div>
            </div>

            {/* Admin User */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900 border-b pb-2">
                Akaun Admin (Pilihan)
              </h3>
              <p className="text-sm text-gray-500">
                Cipta akaun admin untuk tenant ini. Jika kosong, anda perlu menambah pengguna secara manual.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="adminName">Nama Admin</Label>
                  <Input
                    id="adminName"
                    name="adminName"
                    value={formData.adminName}
                    onChange={handleChange}
                    placeholder="Ahmad bin Ali"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adminEmail">E-mel Admin (Pilihan)</Label>
                  <Input
                    id="adminEmail"
                    name="adminEmail"
                    type="text"
                    value={formData.adminEmail}
                    onChange={handleChange}
                    placeholder="admin@masjid.com (pilihan)"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="adminPassword">Kata Laluan Admin</Label>
                <Input
                  id="adminPassword"
                  name="adminPassword"
                  type="text"
                  value={formData.adminPassword}
                  onChange={handleChange}
                  placeholder="Minimum 6 aksara"
                />
                <p className="text-xs text-gray-500">
                  Pastikan anda menyimpan kata laluan ini untuk diberikan kepada admin
                </p>
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-3 pt-4">
              <Link href="/master/tenants" className="flex-1">
                <Button type="button" variant="outline" className="w-full">
                  Batal
                </Button>
              </Link>
              <Button 
                type="submit" 
                className="flex-1 bg-green-600 hover:bg-green-700"
                disabled={loading || uploading}
              >
                {loading || uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {uploading ? 'Memuat naik logo...' : 'Mencipta...'}
                  </>
                ) : (
                  <>
                    <Building2 className="h-4 w-4 mr-2" />
                    Cipta Tenant
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
