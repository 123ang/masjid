'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { DisabilityMember, DisabilityType } from '@/types';
import api from '@/lib/api';

interface DisabilityFieldsProps {
  disabilityMembers: DisabilityMember[];
  onChange: (members: DisabilityMember[]) => void;
}

export default function DisabilityFields({ disabilityMembers, onChange }: DisabilityFieldsProps) {
  const [disabilityTypes, setDisabilityTypes] = useState<DisabilityType[]>([]);

  useEffect(() => {
    fetchDisabilityTypes();
  }, []);

  const fetchDisabilityTypes = async () => {
    try {
      const response = await api.get('/household/disability-types');
      setDisabilityTypes(response.data);
    } catch (error) {
      console.error('Error fetching disability types:', error);
    }
  };

  const addMember = () => {
    onChange([
      ...disabilityMembers,
      { fullName: '', icNo: '', disabilityTypeId: '', notesText: '' },
    ]);
  };

  const removeMember = (index: number) => {
    onChange(disabilityMembers.filter((_, i) => i !== index));
  };

  const updateMember = (index: number, field: string, value: string) => {
    const updated = [...disabilityMembers];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <Label className="text-base font-semibold">
        Sila nyatakan jenis masalah dan nama individu berkenaan:
      </Label>

      {disabilityMembers.map((member, index) => (
        <div key={index} className="p-4 border rounded-lg space-y-3 bg-gray-50">
          <div className="flex justify-between items-center">
            <h5 className="font-medium">Ahli OKU {index + 1}</h5>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeMember(index)}
            >
              <Trash2 className="h-4 w-4 text-red-600" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label>Nama</Label>
              <Input
                value={member.fullName}
                onChange={(e) => updateMember(index, 'fullName', e.target.value)}
                placeholder="Nama ahli OKU"
              />
            </div>

            <div>
              <Label>No. K/P (jika ada)</Label>
              <Input
                value={member.icNo || ''}
                onChange={(e) => updateMember(index, 'icNo', e.target.value)}
                placeholder="780515015234"
                maxLength={50}
              />
            </div>

            <div className="md:col-span-2">
              <Label>Jenis Masalah</Label>
              <Select
                value={member.disabilityTypeId}
                onValueChange={(value) => updateMember(index, 'disabilityTypeId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih jenis masalah" />
                </SelectTrigger>
                <SelectContent>
                  {disabilityTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2">
              <Label>Catatan</Label>
              <Input
                value={member.notesText || ''}
                onChange={(e) => updateMember(index, 'notesText', e.target.value)}
                placeholder="Maklumat tambahan"
              />
            </div>
          </div>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={addMember}
        className="w-full"
      >
        <Plus className="mr-2 h-4 w-4" />
        Tambah Ahli OKU
      </Button>
    </div>
  );
}
