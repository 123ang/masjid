'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Loader2, Plus, Trash2, AlertCircle } from 'lucide-react';
import { CreateHouseholdDto, HousingStatus, HouseholdVersionDependent } from '@/types';
import api from '@/lib/api';
import DependentFields from './DependentFields';
import DisabilityFields from './DisabilityFields';
import EmergencyContactFields from './EmergencyContactFields';

interface HouseholdFormProps {
  initialData?: any;
  onSuccess?: (data: any) => void;
  onCancel?: () => void;
}

export default function HouseholdForm({ initialData, onSuccess, onCancel }: HouseholdFormProps) {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<CreateHouseholdDto>({
    defaultValues: initialData ? {
      ...initialData,
      daerah: initialData.daerah || 'Langkawi',
      negeri: initialData.negeri || 'Kedah',
    } : {
      assistanceReceived: false,
      disabilityInFamily: false,
      dependents: [],
      disabilityMembers: [],
      emergencyContacts: [],
      daerah: 'Langkawi',
      negeri: 'Kedah',
    },
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [icWarning, setIcWarning] = useState('');
  const [dependents, setDependents] = useState(initialData?.dependents || []);
  const [disabilityMembers, setDisabilityMembers] = useState(initialData?.disabilityMembers || []);
  const [emergencyContacts, setEmergencyContacts] = useState(initialData?.emergencyContacts || []);
  const [kampungs, setKampungs] = useState<Array<{ id: string; name: string }>>([]);
  const [loadingKampungs, setLoadingKampungs] = useState(true);

  const assistanceReceived = watch('assistanceReceived');
  const disabilityInFamily = watch('disabilityInFamily');
  const daerah = watch('daerah') || 'Langkawi';
  const negeri = watch('negeri') || 'Kedah';

  // Set default values for daerah and negeri
  useEffect(() => {
    if (!initialData?.daerah) {
      setValue('daerah', 'Langkawi');
    }
    if (!initialData?.negeri) {
      setValue('negeri', 'Kedah');
    }
  }, [initialData, setValue]);

  // Fetch kampung list on component mount
  useEffect(() => {
    const fetchKampungs = async () => {
      try {
        const response = await api.get('/kampung');
        setKampungs(response.data || []);
      } catch (err) {
        console.error('Error fetching kampungs:', err);
        // Fallback to empty array if API fails
        setKampungs([]);
      } finally {
        setLoadingKampungs(false);
      }
    };

    fetchKampungs();
  }, []);

  const checkIcDuplicate = async (icNo: string) => {
    if (!icNo || icNo.length < 12) return;
    
    try {
      const response = await api.get(`/household/check-ic/${icNo}`);
      if (response.data?.exists) {
        setIcWarning('No. K/P sudah wujud dalam sistem');
      } else {
        setIcWarning('');
      }
    } catch (err) {
      console.error('IC check error:', err);
    }
  };

  const onSubmit = async (data: CreateHouseholdDto) => {
    setError('');
    setLoading(true);

    try {
      // Filter out empty dependents (all fields empty)
      const validDependents = dependents.filter(
        (dep: HouseholdVersionDependent) => dep.fullName?.trim() || dep.icNo?.trim() || dep.phone?.trim() || dep.relationship?.trim() || dep.occupation?.trim()
      );

      // Clean emergency contacts - remove internal UI fields (source, selectedDependentIndex)
      const cleanedEmergencyContacts = emergencyContacts.map((contact: any) => {
        const { source, selectedDependentIndex, ...cleanContact } = contact;
        return cleanContact;
      });

      const payload = {
        ...data,
        dependents: validDependents,
        disabilityMembers: disabilityInFamily ? disabilityMembers : [],
        emergencyContacts: cleanedEmergencyContacts,
      };

      let response;
      if (initialData?.id) {
        // Update - creates a new version
        // Remove version-specific fields from payload before sending
        const updatePayload: any = { ...payload };
        // Remove fields that shouldn't be sent to the API
        delete updatePayload.id;
        delete updatePayload.householdId;
        delete updatePayload.versionNo;
        delete updatePayload.createdByUserId;
        delete updatePayload.createdAt;
        delete updatePayload.updatedAt;
        
        console.log('Updating household ID:', initialData.id);
        console.log('Payload (cleaned):', updatePayload);
        try {
          response = await api.put(`/household/${initialData.id}`, updatePayload);
        } catch (putError: any) {
          console.error('PUT request failed:', putError);
          console.error('URL:', `/household/${initialData.id}`);
          console.error('Status:', putError.response?.status);
          console.error('Data:', putError.response?.data);
          throw putError;
        }
      } else {
        // Create
        response = await api.post('/household', payload);
      }

      if (onSuccess) {
        onSuccess(response.data);
      }
    } catch (err: any) {
      console.error('Error saving household:', err);
      if (err.response) {
        console.error('Response status:', err.response.status);
        console.error('Response data:', err.response.data);
      }
      setError(err.response?.data?.message || err.message || 'Ralat berlaku. Sila cuba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Section A: Maklumat Pemohon */}
      <Card>
        <CardHeader>
          <CardTitle>A. Maklumat Pemohon</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="applicantName">Nama</Label>
              <Input
                id="applicantName"
                {...register('applicantName')}
                placeholder="Nama penuh"
              />
            </div>

            <div>
              <Label htmlFor="icNo">No. Kad Pengenalan</Label>
              <Input
                id="icNo"
                {...register('icNo')}
                placeholder="780515015234"
                maxLength={12}
                onBlur={(e) => checkIcDuplicate(e.target.value)}
              />
              {icWarning && (
                <p className="text-sm text-red-600 mt-1">{icWarning}</p>
              )}
            </div>

            <div>
              <Label htmlFor="phone">No. Telefon</Label>
              <Input
                id="phone"
                {...register('phone')}
                placeholder="0124567890"
              />
            </div>

            <div>
              <Label htmlFor="netIncome">Pendapatan Bersih (RM)</Label>
              <Input
                id="netIncome"
                type="number"
                step="0.01"
                {...register('netIncome', { valueAsNumber: true })}
                placeholder="1500.00"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="address">Alamat Semasa</Label>
            <Textarea
              id="address"
              {...register('address')}
              placeholder="Alamat lengkap"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="poskod">Poskod</Label>
              <Select
                onValueChange={(value) => setValue('poskod', value)}
                defaultValue={initialData?.poskod}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih poskod" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="07000">07000</SelectItem>
                  <SelectItem value="07100">07100</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="daerah">Daerah</Label>
              <Input
                id="daerah"
                {...register('daerah')}
                value={daerah}
                readOnly
                className="bg-gray-50 cursor-not-allowed"
              />
            </div>

            <div>
              <Label htmlFor="negeri">Negeri</Label>
              <Input
                id="negeri"
                {...register('negeri')}
                value={negeri}
                readOnly
                className="bg-gray-50 cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="village">Nama Kampung</Label>
            <Select
              onValueChange={(value) => setValue('village', value)}
              defaultValue={initialData?.village}
              disabled={loadingKampungs || kampungs.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder={
                  loadingKampungs 
                    ? "Memuatkan..." 
                    : kampungs.length === 0 
                    ? "Tiada kampung dijumpai" 
                    : "Pilih kampung"
                } />
              </SelectTrigger>
              <SelectContent>
                {kampungs.length > 0 ? (
                  kampungs.map((kampung) => (
                    <SelectItem key={kampung.id} value={kampung.name}>
                      {kampung.name}
                    </SelectItem>
                  ))
                ) : (
                  <div className="px-2 py-1.5 text-sm text-gray-500">
                    Tiada kampung dijumpai
                  </div>
                )}
              </SelectContent>
            </Select>
            {loadingKampungs && (
              <p className="text-xs text-gray-500 mt-1">Memuatkan senarai kampung...</p>
            )}
            {!loadingKampungs && kampungs.length === 0 && (
              <p className="text-xs text-amber-600 mt-1">
                Sila tambah kampung melalui menu "Pengurusan Kampung" terlebih dahulu.
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="housingStatus">Status Kediaman</Label>
            <Select
              onValueChange={(value) => setValue('housingStatus', value as HousingStatus)}
              defaultValue={initialData?.housingStatus}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SENDIRI">Sendiri</SelectItem>
                <SelectItem value="SEWA">Sewa</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Section B: Senarai Tanggungan */}
      <DependentFields
        dependents={dependents}
        onChange={setDependents}
      />

      {/* Section C: Bantuan Bulanan */}
      <Card>
        <CardHeader>
          <CardTitle>C. Bantuan Bulanan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="assistanceReceived"
              {...register('assistanceReceived')}
              className="h-4 w-4"
            />
            <Label htmlFor="assistanceReceived" className="font-normal">
              Adakah menerima bantuan berkala setiap bulan?
            </Label>
          </div>

          {assistanceReceived && (
            <div>
              <Label htmlFor="assistanceProviderText">Nama badan yang memberi bantuan</Label>
              <Input
                id="assistanceProviderText"
                {...register('assistanceProviderText')}
                placeholder="Cth: Jabatan Kebajikan Masyarakat"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section D: OKU / Penyakit Kekal */}
      <Card>
        <CardHeader>
          <CardTitle>D. OKU / Penyakit Kekal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="disabilityInFamily"
              {...register('disabilityInFamily')}
              className="h-4 w-4"
            />
            <Label htmlFor="disabilityInFamily" className="font-normal">
              Adakah dalam keluarga terdapat Ibu/Bapa/Anak/Penjaga yang mempunyai masalah penyakit seperti lumpuh/kanak-kanak istimewa atau hilang upaya kekal?
            </Label>
          </div>

          {disabilityInFamily && (
            <>
              <DisabilityFields
                disabilityMembers={disabilityMembers}
                onChange={setDisabilityMembers}
              />
              <div>
                <Label htmlFor="disabilityNotesText">Catatan Tambahan</Label>
                <Textarea
                  id="disabilityNotesText"
                  {...register('disabilityNotesText')}
                  placeholder="Maklumat tambahan jika ada"
                  rows={2}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Section E: Penama Kedua */}
      <EmergencyContactFields
        emergencyContacts={emergencyContacts}
        onChange={setEmergencyContacts}
        dependents={dependents}
      />

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button
          type="submit"
          disabled={loading || !!icWarning}
          className="bg-green-600 hover:bg-green-700"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Menyimpan...
            </>
          ) : (
            'Simpan'
          )}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Batal
          </Button>
        )}
      </div>
    </form>
  );
}
