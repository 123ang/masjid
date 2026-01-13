'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';
import { EmergencyContact } from '@/types';

interface EmergencyContactFieldsProps {
  emergencyContacts: EmergencyContact[];
  onChange: (contacts: EmergencyContact[]) => void;
}

export default function EmergencyContactFields({ emergencyContacts, onChange }: EmergencyContactFieldsProps) {
  const addContact = () => {
    onChange([
      ...emergencyContacts,
      { name: '', icNo: '', phone: '', relationship: '' },
    ]);
  };

  const removeContact = (index: number) => {
    onChange(emergencyContacts.filter((_, i) => i !== index));
  };

  const updateContact = (index: number, field: string, value: string) => {
    const updated = [...emergencyContacts];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>E. Penama Kedua (Untuk Dihubungi)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {emergencyContacts.map((contact, index) => (
          <div key={index} className="p-4 border rounded-lg space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Penama {index + 1}</h4>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeContact(index)}
              >
                <Trash2 className="h-4 w-4 text-red-600" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label>Nama</Label>
                <Input
                  value={contact.name}
                  onChange={(e) => updateContact(index, 'name', e.target.value)}
                  placeholder="Nama penuh"
                />
              </div>

              <div>
                <Label>No. K/P</Label>
                <Input
                  value={contact.icNo || ''}
                  onChange={(e) => updateContact(index, 'icNo', e.target.value)}
                  placeholder="780515015234"
                  maxLength={12}
                />
              </div>

              <div>
                <Label>No. Tel</Label>
                <Input
                  value={contact.phone || ''}
                  onChange={(e) => updateContact(index, 'phone', e.target.value)}
                  placeholder="0124567890"
                />
              </div>

              <div>
                <Label>Hubungan</Label>
                <Input
                  value={contact.relationship || ''}
                  onChange={(e) => updateContact(index, 'relationship', e.target.value)}
                  placeholder="Cth: Abang, Adik"
                  list={`emergency-relationship-options-${index}`}
                />
                <datalist id={`emergency-relationship-options-${index}`}>
                  <option value="Abang" />
                  <option value="Kakak" />
                  <option value="Adik" />
                  <option value="Saudara" />
                  <option value="Jiran" />
                  <option value="Kawan" />
                </datalist>
              </div>
            </div>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={addContact}
          className="w-full"
        >
          <Plus className="mr-2 h-4 w-4" />
          Tambah Penama
        </Button>
      </CardContent>
    </Card>
  );
}
