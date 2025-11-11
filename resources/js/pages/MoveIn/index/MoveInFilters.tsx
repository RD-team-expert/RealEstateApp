import { Button } from '@/components/ui/button';
import { CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { City } from '@/types/City';
import { PropertyInfoWithoutInsurance } from '@/types/PropertyInfoWithoutInsurance';
import { Search, X } from 'lucide-react';
import React, { useRef, useState } from 'react';

interface UnitData {
    id: number;
    unit_name: string;
    property_name: string;
    city_name: string;
}

interface MoveInFiltersProps {
    cities: City[];
    properties: PropertyInfoWithoutInsurance[];
    units: UnitData[];
    initialFilters: {
        city: string;
        property: string;
        unit: string;
    };
    onSearch: (filters: { city: string; property: string; unit: string }) => void;
    onClear: () => void;
    hasActiveFilters: boolean;
}

export default function MoveInFilters({
    cities,
    properties,
    units,
    initialFilters,
    onSearch,
    onClear,
    hasActiveFilters,
}: MoveInFiltersProps) {
    const [tempFilters, setTempFilters] = useState(initialFilters);
    const [showCityDropdown, setShowCityDropdown] = useState(false);
    const [showPropertyDropdown, setShowPropertyDropdown] = useState(false);
    const [showUnitDropdown, setShowUnitDropdown] = useState(false);

    const cityInputRef = useRef<HTMLInputElement>(null);
    const propertyInputRef = useRef<HTMLInputElement>(null);
    const unitInputRef = useRef<HTMLInputElement>(null);

    // Filter cities based on input
    const filteredCities = cities
        .map((city) => city.city)
        .filter((name, index, self) => self.indexOf(name) === index)
        .filter((name) => name.toLowerCase().includes(tempFilters.city.toLowerCase()));

    // Filter properties based on input
    const filteredProperties = properties
        .map((property) => property.property_name)
        .filter((name, index, self) => self.indexOf(name) === index)
        .filter((name) => name.toLowerCase().includes(tempFilters.property.toLowerCase()));

    const filteredUnits = Array.from(new Set(units.map((u) => u.unit_name)))
        .filter((name) => name.toLowerCase().includes(tempFilters.unit.toLowerCase()));

    const handleTempFilterChange = (key: string, value: string) => {
        setTempFilters((prev) => ({ ...prev, [key]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const { city, property, unit } = tempFilters;
        onSearch({ city, property, unit });
    };

    return (
        <CardHeader>
            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
                    {/* City Filter */}
                    <div className="relative">
                        <Input
                            ref={cityInputRef}
                            type="text"
                            placeholder="Filter by city..."
                            value={tempFilters.city}
                            onChange={(e) => {
                                const value = e.target.value;
                                handleTempFilterChange('city', value);
                                setShowCityDropdown(true);
                            }}
                            onFocus={() => setShowCityDropdown(true)}
                            onBlur={() => setTimeout(() => setShowCityDropdown(false), 200)}
                            className="text-input-foreground bg-input"
                        />
                        {showCityDropdown && filteredCities.length > 0 && (
                            <div className="absolute top-full right-0 left-0 z-50 mb-1 max-h-60 overflow-auto rounded-md border border-input bg-popover shadow-lg">
                                {filteredCities.map((cityName) => (
                                    <div
                                        key={cityName}
                                        className="cursor-pointer px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                                        onClick={() => {
                                            handleTempFilterChange('city', cityName);
                                            setShowCityDropdown(false);
                                        }}
                                    >
                                        {cityName}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Property Filter */}
                    <div className="relative">
                        <Input
                            ref={propertyInputRef}
                            type="text"
                            placeholder="Filter by property..."
                            value={tempFilters.property}
                            onChange={(e) => {
                                const value = e.target.value;
                                handleTempFilterChange('property', value);
                                setShowPropertyDropdown(true);
                            }}
                            onFocus={() => setShowPropertyDropdown(true)}
                            onBlur={() => setTimeout(() => setShowPropertyDropdown(false), 200)}
                            className="text-input-foreground bg-input"
                        />
                        {showPropertyDropdown && filteredProperties.length > 0 && (
                            <div className="absolute top-full right-0 left-0 z-50 mb-1 max-h-60 overflow-auto rounded-md border border-input bg-popover shadow-lg">
                                {filteredProperties.map((propertyName) => (
                                    <div
                                        key={propertyName}
                                        className="cursor-pointer px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                                        onClick={() => {
                                            handleTempFilterChange('property', propertyName);
                                            setShowPropertyDropdown(false);
                                        }}
                                    >
                                        {propertyName}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Unit Filter */}
                    <div className="relative">
                        <Input
                            ref={unitInputRef}
                            type="text"
                            placeholder="Filter by unit..."
                            value={tempFilters.unit}
                            onChange={(e) => {
                                const value = e.target.value;
                                handleTempFilterChange('unit', value);
                                setShowUnitDropdown(true);
                            }}
                            onFocus={() => setShowUnitDropdown(true)}
                            onBlur={() => setTimeout(() => setShowUnitDropdown(false), 200)}
                            className="text-input-foreground bg-input"
                        />
                        {showUnitDropdown && filteredUnits.length > 0 && (
                            <div className="absolute top-full right-0 left-0 z-50 mb-1 max-h-60 overflow-auto rounded-md border border-input bg-popover shadow-lg">
                                {filteredUnits.map((unitName) => (
                                    <div
                                        key={unitName}
                                        className="cursor-pointer px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                                        onClick={() => {
                                            handleTempFilterChange('unit', unitName);
                                            setShowUnitDropdown(false);
                                        }}
                                    >
                                        {unitName}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    {/* Submit Filters */}
                    <div className="flex gap-2 md:col-span-2">
                        <Button type="submit" size="sm">
                            <Search className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Clear Filters Button */}
                    <div className="flex justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                // Immediately clear local inputs
                                setTempFilters({ city: '', property: '', unit: '' });
                                setShowCityDropdown(false);
                                setShowPropertyDropdown(false);
                                setShowUnitDropdown(false);
                                // Trigger parent clear to reload results
                                onClear();
                            }}
                            size="sm"
                            className="flex items-center"
                            disabled={!hasActiveFilters}
                        >
                            <X className="mr-2 h-4 w-4" />
                            Clear
                        </Button>
                    </div>
                </div>
            </form>
        </CardHeader>
    );
}
