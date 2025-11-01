    // components/FilterSection.tsx
import { Card, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import React from 'react';
import FilterDropdown from './FilterDropdown';

interface UnitData {
    id: number;
    unit_name: string;
    property_name: string;
    city: string;
}

interface FilterSectionProps {
    cityFilter: string;
    propertyFilter: string;
    unitFilter: string;
    setCityFilter: (value: string) => void;
    setPropertyFilter: (value: string) => void;
    setUnitFilter: (value: string) => void;
    uniqueCities: string[];
    uniqueProperties: string[];
    units: UnitData[];
    propertiesByCity: Record<string, string[]>;
    onSearch: (e: React.FormEvent) => void;
    onClear: () => void;
}

export default function FilterSection({
    cityFilter,
    propertyFilter,
    unitFilter,
    setCityFilter,
    setPropertyFilter,
    setUnitFilter,
    uniqueCities,
    uniqueProperties,
    units,
    propertiesByCity,
    onSearch,
    onClear
}: FilterSectionProps) {
    const getFilteredProperties = (): string[] => {
        if (!cityFilter) {
            return uniqueProperties;
        }
        return propertiesByCity[cityFilter] || [];
    };

    const getFilteredUnits = (): string[] => {
        let filteredUnits = units;

        if (cityFilter) {
            filteredUnits = filteredUnits.filter(unit => unit.city === cityFilter);
        }

        if (propertyFilter) {
            filteredUnits = filteredUnits.filter(unit => unit.property_name === propertyFilter);
        }

        return [...new Set(filteredUnits.map(unit => unit.unit_name))].sort();
    };

    return (
        <Card className="bg-card text-card-foreground shadow-lg mb-6">
            <CardHeader>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
                    <FilterDropdown
                        value={cityFilter}
                        onChange={setCityFilter}
                        placeholder="Filter by city..."
                        options={uniqueCities}
                    />

                    <FilterDropdown
                        value={propertyFilter}
                        onChange={setPropertyFilter}
                        placeholder="Filter by property..."
                        options={getFilteredProperties()}
                    />

                    <FilterDropdown
                        value={unitFilter}
                        onChange={setUnitFilter}
                        placeholder="Filter by unit..."
                        options={getFilteredUnits()}
                    />

                    <div className="flex gap-2">
                        <Button onClick={onSearch} variant="default" className="flex-1">
                            <Search className="mr-2 h-4 w-4" />
                            Search
                        </Button>
                        
                        <Button 
                            onClick={onClear} 
                            variant="outline" 
                            size="sm"
                            className="whitespace-nowrap"
                        >
                            Clear
                        </Button>
                    </div>
                </div>
            </CardHeader>
        </Card>
    );
}
