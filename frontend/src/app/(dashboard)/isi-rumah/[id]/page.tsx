'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import HouseholdForm from '@/components/forms/HouseholdForm';
import { ArrowLeft, Edit, Loader2, User, Users, Heart, Phone } from 'lucide-react';
import { Household } from '@/types';

export default function HouseholdDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [household, setHousehold] = useState<Household | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchHousehold(params.id as string);
    }
  }, [params.id]);

  const fetchHousehold = async (id: string) => {
    setLoading(true);
    try {
      const response = await api.get(`/household/${id}`);
      setHousehold(response.data);
    } catch (error) {
      console.error('Error fetching household:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSuccess = () => {
    alert('Berjaya dikemaskini! Versi baru dicipta.');
    setEditMode(false);
    fetchHousehold(params.id as string);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (!household) {
    return <div className="text-center py-12">Isi rumah tidak dijumpai</div>;
  }

  const currentVersion = household.currentVersion;

  if (editMode) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <Button variant="outline" onClick={() => setEditMode(false)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>
        </div>
        <h1 className="text-3xl font-bold mb-6">Kemaskini Isi Rumah</h1>
        <HouseholdForm
          initialData={{
            ...currentVersion,
            id: household.id, // Ensure household ID is used, not version ID
            dependents: currentVersion?.dependents?.map(d => ({
              fullName: d.person?.fullName || d.fullName || '',
              icNo: d.person?.icNo || d.icNo,
              phone: d.person?.phone || d.phone,
              relationship: d.relationship,
              occupation: d.occupation,
            })) || [],
            disabilityMembers: currentVersion?.disabilityMembers?.map(m => ({
              fullName: m.person?.fullName || m.fullName || '',
              icNo: m.person?.icNo || m.icNo,
              disabilityTypeId: m.disabilityTypeId,
              notesText: m.notesText,
            })) || [],
            emergencyContacts: currentVersion?.emergencyContacts || [],
          }}
          onSuccess={handleUpdateSuccess}
          onCancel={() => setEditMode(false)}
        />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>
        </div>
        <Button onClick={() => setEditMode(true)} className="bg-green-600 hover:bg-green-700">
          <Edit className="mr-2 h-4 w-4" />
          Kemaskini
        </Button>
      </div>

      {/* Main Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="mr-2 h-6 w-6 text-green-600" />
            Maklumat Pemohon
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Nama</p>
              <p className="font-medium">{currentVersion?.applicantName || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">No. Kad Pengenalan</p>
              <p className="font-medium font-mono">{currentVersion?.icNo || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">No. Telefon</p>
              <p className="font-medium">{currentVersion?.phone || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Pendapatan Bersih</p>
              <p className="font-medium">
                {currentVersion?.netIncome 
                  ? `RM${parseFloat(currentVersion.netIncome.toString()).toFixed(2)}` 
                  : '-'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status Kediaman</p>
              <p className="font-medium">
                {currentVersion?.housingStatus === 'SENDIRI' ? 'Sendiri' : 
                 currentVersion?.housingStatus === 'SEWA' ? 'Sewa' : '-'}
              </p>
            </div>
          </div>

          <Separator />

          <div>
            <p className="text-sm text-gray-600">Alamat Semasa</p>
            <p className="font-medium">{currentVersion?.address || '-'}</p>
          </div>

          {currentVersion?.village && (
            <div>
              <p className="text-sm text-gray-600">Nama Kampung</p>
              <p className="font-medium">{currentVersion.village}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="dependents" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dependents">Tanggungan</TabsTrigger>
          <TabsTrigger value="assistance">Bantuan</TabsTrigger>
          <TabsTrigger value="disability">OKU</TabsTrigger>
          <TabsTrigger value="emergency">Penama</TabsTrigger>
        </TabsList>

        <TabsContent value="dependents">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5 text-green-600" />
                Senarai Tanggungan ({currentVersion?.dependents?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentVersion?.dependents?.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Tiada tanggungan</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama</TableHead>
                      <TableHead>No. K/P</TableHead>
                      <TableHead>Hubungan</TableHead>
                      <TableHead>Pekerjaan</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentVersion?.dependents?.map((dep, index) => (
                      <TableRow key={index}>
                        <TableCell>{dep.person?.fullName || dep.fullName || '-'}</TableCell>
                        <TableCell className="font-mono text-sm">{dep.person?.icNo || dep.icNo || '-'}</TableCell>
                        <TableCell>{dep.relationship || '-'}</TableCell>
                        <TableCell>{dep.occupation || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assistance">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Heart className="mr-2 h-5 w-5 text-red-600" />
                Bantuan Bulanan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Menerima Bantuan</p>
                  <p className="font-medium">
                    {currentVersion?.assistanceReceived ? 'Ya' : 'Tidak'}
                  </p>
                </div>
                {currentVersion?.assistanceReceived && currentVersion?.assistanceProviderText && (
                  <div>
                    <p className="text-sm text-gray-600">Nama Badan Pemberi Bantuan</p>
                    <p className="font-medium">{currentVersion.assistanceProviderText}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="disability">
          <Card>
            <CardHeader>
              <CardTitle>OKU / Penyakit Kekal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Adakah ada ahli OKU</p>
                  <p className="font-medium">
                    {currentVersion?.disabilityInFamily ? 'Ya' : 'Tidak'}
                  </p>
                </div>

                {currentVersion?.disabilityInFamily && (
                  <>
                    {currentVersion?.disabilityMembers?.length === 0 ? (
                      <p className="text-gray-500">Tiada maklumat ahli OKU</p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nama</TableHead>
                            <TableHead>Jenis Masalah</TableHead>
                            <TableHead>Catatan</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {currentVersion?.disabilityMembers?.map((member, index) => (
                            <TableRow key={index}>
                              <TableCell>{member.person?.fullName || member.fullName || '-'}</TableCell>
                              <TableCell>{member.disabilityType?.name || '-'}</TableCell>
                              <TableCell>{member.notesText || '-'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                    
                    {currentVersion?.disabilityNotesText && (
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Catatan Tambahan</p>
                        <p className="font-medium whitespace-pre-wrap">{currentVersion.disabilityNotesText}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="emergency">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Phone className="mr-2 h-5 w-5 text-blue-600" />
                Penama Kedua
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentVersion?.emergencyContacts?.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Tiada penama</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama</TableHead>
                      <TableHead>No. K/P</TableHead>
                      <TableHead>No. Tel</TableHead>
                      <TableHead>Hubungan</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentVersion?.emergencyContacts?.map((contact, index) => (
                      <TableRow key={index}>
                        <TableCell>{contact.name}</TableCell>
                        <TableCell className="font-mono text-sm">{contact.icNo || '-'}</TableCell>
                        <TableCell>{contact.phone || '-'}</TableCell>
                        <TableCell>{contact.relationship || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Version History */}
      {household.versions && household.versions.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Sejarah Versi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {household.versions.map((version) => (
                <div key={version.id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">Versi {version.versionNo}</p>
                    <p className="text-sm text-gray-600">
                      Dicipta oleh {version.createdByUser?.name} pada{' '}
                      {new Date(version.createdAt).toLocaleDateString('ms-MY')}
                    </p>
                  </div>
                  {version.id === household.currentVersionId && (
                    <Badge>Terkini</Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
