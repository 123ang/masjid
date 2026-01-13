'use client';

import { useRouter } from 'next/navigation';
import HouseholdForm from '@/components/forms/HouseholdForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';

export default function NewFormPage() {
  const router = useRouter();

  const handleSuccess = (data: any) => {
    // Show success message
    alert('Berjaya disimpan! Versi 1 dicipta.');
    // Redirect to household detail
    router.push(`/isi-rumah/${data.id}`);
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <FileText className="w-8 h-8 text-green-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Borang Bancian Anak Kariah</h1>
            <p className="text-gray-600">Masjid Al-Huda Padang Matsirat, 07100 Langkawi, Kedah Darul Aman</p>
          </div>
        </div>
      </div>

      <HouseholdForm onSuccess={handleSuccess} onCancel={handleCancel} />
    </div>
  );
}
