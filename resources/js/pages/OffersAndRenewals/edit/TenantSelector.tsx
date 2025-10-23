import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import React, { useState, useMemo } from 'react';

interface Tenant {
  id: number;
  name: string;
  first_name: string;
  last_name: string;
  unit_id: number;
}

interface TenantSelectorProps {
  tenants: Tenant[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
  validationError?: string;
  tenantRef?: React.RefObject<HTMLButtonElement | null>;
  unitSelected: boolean;
  otherTenants?: string;
  onOtherTenantsChange?: (value: string) => void;
}

export default function TenantSelector({ 
  tenants, 
  value, 
  onChange, 
  disabled, 
  error, 
  validationError, 
  tenantRef,
  unitSelected,
  otherTenants = '',
  onOtherTenantsChange
}: TenantSelectorProps) {
  const [showOtherTenantsDropdown, setShowOtherTenantsDropdown] = useState(false);
  const [filteredTenants, setFilteredTenants] = useState(tenants);

  // Update filtered tenants when tenants change
  useMemo(() => {
    setFilteredTenants(tenants);
  }, [tenants]);

  const handleOtherTenantsInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    onOtherTenantsChange?.(inputValue);
    
    // Filter tenants based on input
    if (inputValue.trim() === '') {
      setFilteredTenants(tenants);
    } else {
      const filtered = tenants.filter(tenant =>
        tenant.name.toLowerCase().includes(inputValue.toLowerCase()) ||
        tenant.first_name.toLowerCase().includes(inputValue.toLowerCase()) ||
        tenant.last_name.toLowerCase().includes(inputValue.toLowerCase())
      );
      setFilteredTenants(filtered);
    }
    setShowOtherTenantsDropdown(true);
  };

  const handleTenantSelect = (tenant: Tenant) => {
    onOtherTenantsChange?.(tenant.name);
    setShowOtherTenantsDropdown(false);
  };

  return (
    <div className="rounded-lg border-l-4 border-l-purple-500 p-4">
      <div className="mb-2">
        <Label htmlFor="tenant" className="text-base font-semibold">
          Tenant *
        </Label>
      </div>
      <Select 
        onValueChange={onChange} 
        value={value}
        disabled={disabled || !unitSelected || tenants.length === 0}
      >
        <SelectTrigger ref={tenantRef}>
          <SelectValue placeholder={
            !unitSelected 
              ? "Select unit first" 
              : tenants.length === 0 
                ? "No tenants available"
                : "Select tenant"
          } />
        </SelectTrigger>
        <SelectContent>
          {tenants.map((tenant) => (
            <SelectItem key={tenant.id} value={tenant.id.toString()}>
              {tenant.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      {validationError && <p className="mt-1 text-sm text-red-600">{validationError}</p>}
      
      {/* Other Tenant Names Input */}
      <div className="mt-4">
        <Label htmlFor="other_tenants" className="text-base font-semibold">
          Other Tenant Names
        </Label>
        <div className="relative mt-2">
          <Input
            id="other_tenants"
            type="text"
            value={otherTenants}
            onChange={handleOtherTenantsInputChange}
            onFocus={() => {
              setFilteredTenants(tenants);
              setShowOtherTenantsDropdown(tenants.length > 0);
            }}
            onBlur={() => setTimeout(() => setShowOtherTenantsDropdown(false), 200)}
            placeholder="Type custom name or select from existing tenants"
            className="w-full"
            disabled={!unitSelected || tenants.length === 0}
          />
          
          {/* Dropdown for filtered tenants */}
          {showOtherTenantsDropdown && filteredTenants.length > 0 && (
            <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-input bg-popover shadow-lg">
              {filteredTenants.map((tenant) => (
                <div
                  key={tenant.id}
                  className="cursor-pointer px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                  onMouseDown={() => handleTenantSelect(tenant)}
                >
                  {tenant.name}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
