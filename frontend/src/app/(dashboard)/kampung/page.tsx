'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Plus, Trash2, Edit, MapPin } from 'lucide-react';

interface Kampung {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function KampungManagementPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [kampungs, setKampungs] = useState<Kampung[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    isActive: true,
  });

  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }
    fetchKampungs();
  }, [user, router]);

  const fetchKampungs = async () => {
    try {
      const response = await api.get('/kampung');
      setKampungs(response.data);
    } catch (error) {
      console.error('Error fetching kampungs:', error);
      setError('Gagal memuatkan senarai kampung');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (isEditMode && editingId) {
        await api.put(`/kampung/${editingId}`, formData);
        setSuccess('Kampung berjaya dikemaskini');
      } else {
        await api.post('/kampung', formData);
        setSuccess('Kampung berjaya ditambah');
      }
      setIsDialogOpen(false);
      resetForm();
      fetchKampungs();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal menyimpan kampung');
    }
  };

  const handleEdit = (kampung: Kampung) => {
    setFormData({
      name: kampung.name,
      isActive: kampung.isActive,
    });
    setEditingId(kampung.id);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  const handleDelete = async (kampungId: string) => {
    if (!confirm('Adakah anda pasti mahu memadam kampung ini?')) return;

    try {
      await api.delete(`/kampung/${kampungId}`);
      setSuccess('Kampung berjaya dipadam');
      fetchKampungs();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal memadam kampung');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', isActive: true });
    setIsEditMode(false);
    setEditingId(null);
  };

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      resetForm();
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Pengurusan Kampung</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Urus senarai kampung dalam sistem</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
          <DialogTrigger asChild>
            <Button 
              className="bg-green-600 hover:bg-green-700" 
              onClick={() => {
                resetForm();
                setIsEditMode(false);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Tambah Kampung
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-xl">
                {isEditMode ? 'Kemaskini Kampung' : 'Tambah Kampung Baru'}
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-500">
                {isEditMode ? 'Kemaskini maklumat kampung' : 'Isi maklumat kampung baru untuk sistem'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Nama Kampung
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Cth: Kg Raja"
                  required
                  className="w-full"
                />
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <Label htmlFor="isActive" className="text-sm font-normal cursor-pointer">
                  Aktif
                </Label>
              </div>
              <DialogFooter className="gap-2 sm:gap-0 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => handleDialogClose(false)}
                  className="w-full sm:w-auto"
                >
                  Batal
                </Button>
                <Button 
                  type="submit" 
                  className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
                >
                  {isEditMode ? 'Kemaskini' : 'Tambah'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-50 text-green-800 border-green-200">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Senarai Kampung</CardTitle>
          <CardDescription>
            {kampungs.length} kampung berdaftar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Kampung</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Tindakan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {kampungs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-gray-500">
                    Tiada kampung dijumpai
                  </TableCell>
                </TableRow>
              ) : (
                kampungs.map((k) => (
                  <TableRow key={k.id}>
                    <TableCell className="font-medium">{k.name}</TableCell>
                    <TableCell>
                      {k.isActive ? (
                        <Badge className="bg-green-100 text-green-800">Aktif</Badge>
                      ) : (
                        <Badge variant="secondary">Tidak Aktif</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(k)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(k.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
