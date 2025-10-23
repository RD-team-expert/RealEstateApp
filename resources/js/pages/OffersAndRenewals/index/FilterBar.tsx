import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, X, ChevronDown } from 'lucide-react';

interface FilterBarProps {
  cities: any[];
  properties: any[];
  propertiesByCityId: Record<number, any[]>;
  unitsByPropertyId: Record<number, Array<{ id: number; unit_name: string }>>;
  tenantsByUnitId: Record<number, Array<{ id: number; full_name: string; tenant_id: number }>>;
  allUnits: Array<{ id: number; unit_name: string; city_name: string; property_name: string }>;
  tenantsData: Array<{ id: number; full_name: string; unit_name: string; property_name: string; city_name: string }>;
  tempFilters: {
    city: string;
    property: string;
    unit: string;
    tenant: string;
    selectedCityId: number | null;
    selectedPropertyId: number | null;
    selectedUnitId: number | null;
    selectedTenantId: number | null;
  };
  onTempFiltersChange: (filters: any) => void;
  onSearch: () => void;
  onClear: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  cities,
  properties,
  propertiesByCityId,
  unitsByPropertyId,
  tenantsByUnitId,
  allUnits,
  tenantsData,
  tempFilters,
  onTempFiltersChange,
  onSearch,
  onClear,
}) => {
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showPropertyDropdown, setShowPropertyDropdown] = useState(false);
  const [showUnitDropdown, setShowUnitDropdown] = useState(false);
  const [showTenantDropdown, setShowTenantDropdown] = useState(false);

  const cityDropdownRef = useRef<HTMLDivElement>(null);
  const propertyDropdownRef = useRef<HTMLDivElement>(null);
  const unitDropdownRef = useRef<HTMLDivElement>(null);
  const tenantDropdownRef = useRef<HTMLDivElement>(null);
  const cityInputRef = useRef<HTMLInputElement>(null);
  const propertyInputRef = useRef<HTMLInputElement>(null);
  const unitInputRef = useRef<HTMLInputElement>(null);
  const tenantInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        cityDropdownRef.current &&
        !cityDropdownRef.current.contains(event.target as Node) &&
        cityInputRef.current &&
        !cityInputRef.current.contains(event.target as Node)
      ) {
        setShowCityDropdown(false);
      }
      if (
        propertyDropdownRef.current &&
        !propertyDropdownRef.current.contains(event.target as Node) &&
        propertyInputRef.current &&
        !propertyInputRef.current.contains(event.target as Node)
      ) {
        setShowPropertyDropdown(false);
      }
      if (
        unitDropdownRef.current &&
        !unitDropdownRef.current.contains(event.target as Node) &&
        unitInputRef.current &&
        !unitInputRef.current.contains(event.target as Node)
      ) {
        setShowUnitDropdown(false);
      }
      if (
        tenantDropdownRef.current &&
        !tenantDropdownRef.current.contains(event.target as Node) &&
        tenantInputRef.current &&
        !tenantInputRef.current.contains(event.target as Node)
      ) {
        setShowTenantDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCitySelect = (city: any) => {
    onTempFiltersChange({ 
      ...tempFilters, 
      city: city.city,
      selectedCityId: city.id,
      property: '',
      selectedPropertyId: null,
      unit: '',
      selectedUnitId: null,
      tenant: '',
      selectedTenantId: null
    });
    setShowCityDropdown(false);
  };

  const handleCityInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onTempFiltersChange({ 
      ...tempFilters, 
      city: value,
      selectedCityId: null,
      property: '',
      selectedPropertyId: null,
      unit: '',
      selectedUnitId: null,
      tenant: '',
      selectedTenantId: null
    });
    setShowCityDropdown(value.length > 0);
  };

  const handlePropertyInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onTempFiltersChange({ 
      ...tempFilters, 
      property: value,
      selectedPropertyId: null,
      unit: '',
      selectedUnitId: null,
      tenant: '',
      selectedTenantId: null
    });
    setShowPropertyDropdown(value.length > 0);
  };

  const handlePropertySelect = (property: any) => {
    onTempFiltersChange({ 
      ...tempFilters, 
      property: property.property_name,
      selectedPropertyId: property.id,
      unit: '',
      selectedUnitId: null,
      tenant: '',
      selectedTenantId: null
    });
    setShowPropertyDropdown(false);
  };

  const handleUnitInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onTempFiltersChange({ 
      ...tempFilters, 
      unit: value,
      selectedUnitId: null,
      tenant: '',
      selectedTenantId: null
    });
    setShowUnitDropdown(value.length > 0);
  };

  const handleUnitSelect = (unit: any) => {
    onTempFiltersChange({ 
      ...tempFilters, 
      unit: unit.unit_name,
      selectedUnitId: unit.id,
      tenant: '',
      selectedTenantId: null
    });
    setShowUnitDropdown(false);
  };

  const handleTenantInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onTempFiltersChange({ 
      ...tempFilters, 
      tenant: value,
      selectedTenantId: null
    });
    setShowTenantDropdown(value.length > 0);
  };

  const handleTenantSelect = (tenant: any) => {
    onTempFiltersChange({ 
      ...tempFilters, 
      tenant: tenant.full_name,
      selectedTenantId: tenant.id
    });
    setShowTenantDropdown(false);
  };

  const filteredCities = cities.filter((city) => 
    city?.city?.toLowerCase().includes(tempFilters.city.toLowerCase())
  );

  const filteredProperties = tempFilters.selectedCityId 
    ? (propertiesByCityId[tempFilters.selectedCityId] || []).filter((property) => 
        property?.property_name?.toLowerCase().includes(tempFilters.property.toLowerCase())
      )
    : properties.filter((property) => 
        property?.property_name?.toLowerCase().includes(tempFilters.property.toLowerCase())
      );

  const filteredUnits = tempFilters.selectedPropertyId 
    ? (unitsByPropertyId[tempFilters.selectedPropertyId] || []).filter(unit =>
        unit?.unit_name?.toLowerCase().includes(tempFilters.unit.toLowerCase())
      )
    : allUnits.filter(unit =>
        unit?.unit_name?.toLowerCase().includes(tempFilters.unit.toLowerCase())
      );

  const filteredTenants = tempFilters.selectedUnitId 
    ? (tenantsByUnitId[tempFilters.selectedUnitId] || []).filter(tenant =>
        tenant?.full_name?.toLowerCase().includes(tempFilters.tenant.toLowerCase())
      )
    : tenantsData.filter(tenant =>
        tenant?.full_name?.toLowerCase().includes(tempFilters.tenant.toLowerCase())
      );

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-6">
      {/* City Filter with Autocomplete */}
      <div className="relative">
        <Input
          ref={cityInputRef}
          type="text"
          placeholder="City"
          value={tempFilters.city}
          onChange={handleCityInputChange}
          onFocus={() => setShowCityDropdown(true)}
          className="text-input-foreground bg-input pr-8"
        />
        <ChevronDown className="absolute top-1/2 right-2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

        {showCityDropdown && filteredCities.length > 0 && (
          <div
            ref={cityDropdownRef}
            className="absolute top-full right-0 left-0 z-50 mt-1 max-h-60 overflow-auto rounded-md border border-input bg-popover shadow-lg"
          >
            {filteredCities.map((city) => (
              <div
                key={city.id}
                className="cursor-pointer px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                onClick={() => handleCitySelect(city)}
              >
                {city.city}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Property Filter with Autocomplete */}
      <div className="relative">
        <Input
          ref={propertyInputRef}
          type="text"
          placeholder="Property"
          value={tempFilters.property}
          onChange={handlePropertyInputChange}
          onFocus={() => setShowPropertyDropdown(true)}
          className="text-input-foreground bg-input pr-8"
        />
        <ChevronDown className="absolute top-1/2 right-2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

        {showPropertyDropdown && filteredProperties.length > 0 && (
          <div
            ref={propertyDropdownRef}
            className="absolute top-full right-0 left-0 z-50 mt-1 max-h-60 overflow-auto rounded-md border border-input bg-popover shadow-lg"
          >
            {filteredProperties.map((property) => (
              <div
                key={property.id}
                className="cursor-pointer px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                onClick={() => handlePropertySelect(property)}
              >
                {property.property_name}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Unit Filter with Autocomplete */}
      <div className="relative">
        <Input
          ref={unitInputRef}
          type="text"
          placeholder="Unit"
          value={tempFilters.unit}
          onChange={handleUnitInputChange}
          onFocus={() => setShowUnitDropdown(true)}
          className="text-input-foreground bg-input pr-8"
        />
        <ChevronDown className="absolute top-1/2 right-2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

        {showUnitDropdown && filteredUnits.length > 0 && (
          <div
            ref={unitDropdownRef}
            className="absolute top-full right-0 left-0 z-50 mt-1 max-h-60 overflow-auto rounded-md border border-input bg-popover shadow-lg"
          >
            {filteredUnits.map((unit) => (
              <div
                key={unit.id}
                className="cursor-pointer px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                onClick={() => handleUnitSelect(unit)}
              >
                {unit.unit_name}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tenant Filter with Autocomplete */}
      <div className="relative">
        <Input
          ref={tenantInputRef}
          type="text"
          placeholder="Tenant"
          value={tempFilters.tenant}
          onChange={handleTenantInputChange}
          onFocus={() => setShowTenantDropdown(true)}
          className="text-input-foreground bg-input pr-8"
        />
        <ChevronDown className="absolute top-1/2 right-2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

        {showTenantDropdown && filteredTenants.length > 0 && (
          <div
            ref={tenantDropdownRef}
            className="absolute top-full right-0 left-0 z-50 mt-1 max-h-60 overflow-auto rounded-md border border-input bg-popover shadow-lg"
          >
            {filteredTenants.map((tenant) => (
              <div
                key={tenant.id}
                className="cursor-pointer px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                onClick={() => handleTenantSelect(tenant)}
              >
                {tenant.full_name}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Placeholder column for responsive grid */}
      <div className="hidden md:block"></div>

      {/* Search and Clear Buttons */}
      <div className="flex gap-2">
        <Button onClick={onSearch} variant="default" className="flex items-center">
          <Search className="mr-2 h-4 w-4" />
          Search
        </Button>
        <Button onClick={onClear} variant="outline" className="flex items-center">
          <X className="mr-2 h-4 w-4" />
          Clear
        </Button>
      </div>
    </div>
  );
};
