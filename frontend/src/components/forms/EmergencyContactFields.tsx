'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { EmergencyContact, HouseholdVersionDependent } from '@/types';

// Extended type for internal UI state (includes source tracking)
type EmergencyContactWithSource = EmergencyContact & {
  source?: 'manual' | 'dependent';
  selectedDependentIndex?: number;
};

interface EmergencyContactFieldsProps {
  emergencyContacts: EmergencyContact[];
  onChange: (contacts: EmergencyContact[]) => void;
  dependents?: HouseholdVersionDependent[];
}

export default function EmergencyContactFields({ emergencyContacts, onChange, dependents = [] }: EmergencyContactFieldsProps) {
  // Filter out empty dependents for the dropdown
  const validDependents = dependents.filter(
    (dep) => dep.fullName?.trim() || dep.icNo?.trim()
  );

  const addContact = () => {
    const newContact: EmergencyContactWithSource = { 
      name: '', 
      icNo: '', 
      phone: '', 
      relationship: '', 
      source: 'manual' 
    };
    onChange([
      ...emergencyContacts,
      newContact,
    ]);
  };

  const removeContact = (index: number) => {
    onChange(emergencyContacts.filter((_, i) => i !== index));
  };

  const updateContact = (index: number, field: string, value: string) => {
    const updated = [...emergencyContacts] as EmergencyContactWithSource[];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const handleSourceChange = (index: number, source: 'manual' | 'dependent') => {
    const updated = [...emergencyContacts] as EmergencyContactWithSource[];
    const currentContact = updated[index];
    
    if (source === 'dependent') {
      // When switching to dependent, clear the selected dependent index so user can choose
      updated[index] = { 
        ...currentContact, 
        source: 'dependent',
        selectedDependentIndex: undefined,
      };
    } else {
      // When switching to manual, keep the current values but mark as manual
      updated[index] = { 
        ...currentContact, 
        source: 'manual',
        selectedDependentIndex: undefined,
      };
    }
    onChange(updated);
  };

  const handleDependentSelect = (index: number, dependentIndex: string) => {
    const depIndex = parseInt(dependentIndex);
    const selectedDependent = validDependents[depIndex];
    
    if (selectedDependent) {
      const updated = [...emergencyContacts] as EmergencyContactWithSource[];
      updated[index] = {
        ...updated[index],
        name: selectedDependent.fullName || '',
        icNo: selectedDependent.icNo || '',
        phone: selectedDependent.phone || '',
        source: 'dependent',
        selectedDependentIndex: depIndex,
      };
      onChange(updated);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>E. Penama Kedua (Untuk Dihubungi)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {emergencyContacts.map((contact, index) => {
          const contactWithSource = contact as EmergencyContactWithSource;
          const source = contactWithSource.source || 'manual';
          const isFromDependent = source === 'dependent';
          
          return (
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

              {/* Source Selection */}
              <div className="space-y-2">
                <Label>Sumber Maklumat</Label>
                <div className="flex gap-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name={`contact-source-${index}`}
                      checked={isFromDependent}
                      onChange={() => handleSourceChange(index, 'dependent')}
                      className="h-4 w-4"
                    />
                    <span className="text-sm">Pilih dari Senarai Tanggungan</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name={`contact-source-${index}`}
                      checked={!isFromDependent}
                      onChange={() => handleSourceChange(index, 'manual')}
                      className="h-4 w-4"
                    />
                    <span className="text-sm">Isi Manual</span>
                  </label>
                </div>
              </div>

              {/* Dependent Selection Dropdown */}
              {isFromDependent && validDependents.length > 0 && (
                <div>
                  <Label>Pilih Tanggungan</Label>
                  <Select
                    value={(contactWithSource.selectedDependentIndex !== undefined) 
                      ? String(contactWithSource.selectedDependentIndex) 
                      : ''}
                    onValueChange={(value) => handleDependentSelect(index, value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih dari senarai tanggungan" />
                    </SelectTrigger>
                    <SelectContent>
                      {validDependents.map((dep, depIndex) => (
                        <SelectItem key={depIndex} value={String(depIndex)}>
                          {dep.fullName || 'Tanpa Nama'} 
                          {dep.icNo && ` (${dep.icNo})`}
                          {dep.relationship && ` - ${dep.relationship}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    Maklumat akan diisi secara automatik. Anda masih boleh mengubahnya jika perlu.
                  </p>
                </div>
              )}

              {isFromDependent && validDependents.length === 0 && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded text-sm text-amber-800">
                  Tiada tanggungan dalam senarai. Sila tambah tanggungan di bahagian "Senarai Tanggungan" terlebih dahulu, atau pilih "Isi Manual".
                </div>
              )}

              {/* Manual Input Fields */}
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
          );
        })}

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
