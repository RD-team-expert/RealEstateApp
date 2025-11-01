import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UnitFilters } from '@/types/unit';
import { PropertyInfoWithoutInsurance } from '@/types/PropertyInfoWithoutInsurance';
import { Search, X } from 'lucide-react';
import CityAutocomplete from './CityAutocomplete';
import PropertyAutocomplete from './PropertyAutocomplete';

interface UnitsFilterProps {
    filters: UnitFilters;
    cities: Array<{ id: number; city: string }>;
    properties: PropertyInfoWithoutInsurance[];
    cityInput: string;
    propertyInput: string;
    onFilterChange: (key: keyof UnitFilters, value: string) => void;
    onCityInputChange: (value: string) => void;
    onCitySelect: (city: string) => void;
    onPropertyInputChange: (value: string) => void;
    onPropertySelect: (property: PropertyInfoWithoutInsurance) => void;
    onSearch: () => void;
    onClear: () => void;
}

const UnitsFilter: React.FC<UnitsFilterProps> = ({
    filters,
    cities,
    properties,
    cityInput,
    propertyInput,
    onFilterChange,
    onCityInputChange,
    onCitySelect,
    onPropertyInputChange,
    onPropertySelect,
    onSearch,
    onClear,
}) => {
    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-7">
            <CityAutocomplete
                cities={cities}
                value={cityInput}
                onChange={onCityInputChange}
                onSelect={onCitySelect}
            />

            <PropertyAutocomplete
                properties={properties}
                value={propertyInput}
                onChange={onPropertyInputChange}
                onSelect={onPropertySelect}
            />

            <Input
                type="text"
                placeholder="Unit Name"
                value={filters.unit_name || ''}
                onChange={(e) => onFilterChange('unit_name', e.target.value)}
                className="text-input-foreground bg-input"
            />

            <select
                value={filters.vacant || ''}
                onChange={(e) => onFilterChange('vacant', e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            >
                <option value="">All Vacant Status</option>
                <option value="Yes">Vacant</option>
                <option value="No">Occupied</option>
            </select>

            <select
                value={filters.listed || ''}
                onChange={(e) => onFilterChange('listed', e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            >
                <option value="">All Listed Status</option>
                <option value="Yes">Listed</option>
                <option value="No">Not Listed</option>
            </select>

            <Button onClick={onSearch} variant="default" className="flex items-center">
                <Search className="mr-2 h-4 w-4" />
                Search
            </Button>

            <Button onClick={onClear} variant="outline" className="flex items-center">
                <X className="mr-2 h-4 w-4" />
                Clear
            </Button>
        </div>
    );
};

export default UnitsFilter;
