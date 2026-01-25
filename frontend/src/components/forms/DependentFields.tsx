'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { HouseholdVersionDependent, Gender } from '@/types';

interface DependentFieldsProps {
  dependents: HouseholdVersionDependent[];
  onChange: (dependents: HouseholdVersionDependent[]) => void;
}

export default function DependentFields({ dependents, onChange }: DependentFieldsProps) {
  // Filter out empty dependents for counting
  const nonEmptyDependents = dependents.filter(
    (dep) => dep.fullName?.trim() || dep.icNo?.trim() || dep.phone?.trim() || dep.relationship?.trim() || dep.occupation?.trim()
  );

  const addDependent = () => {
    onChange([
      ...dependents,
      { fullName: '', icNo: '', phone: '', relationship: '', occupation: '' },
    ]);
  };

  const removeDependent = (index: number) => {
    onChange(dependents.filter((_, i) => i !== index));
  };

  const updateDependent = (index: number, field: string, value: string) => {
    const updated = [...dependents];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  // Function to detect gender from IC number
  const detectGenderFromIC = (icNo: string): Gender | undefined => {
    if (!icNo || icNo.length < 12) return undefined;
    const lastDigit = parseInt(icNo.charAt(11));
    return lastDigit % 2 === 0 ? Gender.PEREMPUAN : Gender.LELAKI;
  };

  // Handler for IC number change for dependent
  const handleDependentIcChange = (index: number, icNo: string) => {
    updateDependent(index, 'icNo', icNo);
    
    // Auto-detect gender
    const detectedGender = detectGenderFromIC(icNo);
    if (detectedGender) {
      updateDependent(index, 'gender', detectedGender);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>B. Senarai Tanggungan</CardTitle>
        <span className="text-sm text-gray-600">
          Jumlah Tanggungan: {nonEmptyDependents.length}
        </span>
      </CardHeader>
      <CardContent className="space-y-4">
        {dependents.map((dependent, index) => (
          <div key={index} className="p-4 border rounded-lg space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Tanggungan {index + 1}</h4>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeDependent(index)}
              >
                <Trash2 className="h-4 w-4 text-red-600" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label>Nama Tanggungan</Label>
                <Input
                  value={dependent.fullName}
                  onChange={(e) => updateDependent(index, 'fullName', e.target.value)}
                  placeholder="Nama penuh"
                />
              </div>

              <div>
                <Label>No. K/P</Label>
                <Input
                  value={dependent.icNo || ''}
                  onChange={(e) => handleDependentIcChange(index, e.target.value)}
                  placeholder="780515015234"
                />
              </div>

              <div>
                <Label>Jantina</Label>
                <Select
                  onValueChange={(value) => updateDependent(index, 'gender', value)}
                  value={dependent.gender}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih jantina" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={Gender.LELAKI}>Lelaki</SelectItem>
                    <SelectItem value={Gender.PEREMPUAN}>Perempuan</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>No. Tel (Jika Ada)</Label>
                <Input
                  value={dependent.phone || ''}
                  onChange={(e) => updateDependent(index, 'phone', e.target.value)}
                  placeholder="0124567890"
                />
              </div>

              <div>
                <Label>Hubungan</Label>
                <Input
                  value={dependent.relationship || ''}
                  onChange={(e) => updateDependent(index, 'relationship', e.target.value)}
                  placeholder="Cth: Isteri, Anak, Ibu"
                  list={`relationship-options-${index}`}
                />
                <datalist id={`relationship-options-${index}`}>
                  <option value="Isteri" />
                  <option value="Suami" />
                  <option value="Anak" />
                  <option value="Ibu" />
                  <option value="Bapa" />
                  <option value="Adik-beradik" />
                  <option value="Datuk/Nenek" />
                  <option value="Cucu" />
                </datalist>
              </div>

              <div>
                <Label>Pekerjaan</Label>
                <Input
                  value={dependent.occupation || ''}
                  onChange={(e) => updateDependent(index, 'occupation', e.target.value)}
                  placeholder="Cth: Pelajar, Suri Rumah"
                  list={`occupation-options-${index}`}
                />
                <datalist id={`occupation-options-${index}`}>
                  <option value="Pelajar" />
                  <option value="Suri Rumah" />
                  <option value="Bekerja Sendiri" />
                  <option value="Kakitangan Kerajaan" />
                  <option value="Kakitangan Swasta" />
                  <option value="Pesara" />
                  <option value="Tidak Bekerja" />
                </datalist>
              </div>
            </div>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={addDependent}
          className="w-full"
        >
          <Plus className="mr-2 h-4 w-4" />
          Tambah Tanggungan
        </Button>
      </CardContent>
    </Card>
  );
}
