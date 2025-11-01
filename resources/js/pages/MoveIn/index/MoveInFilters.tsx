import { Button } from '@/components/ui/button';
import { CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { City } from '@/types/City';
import { PropertyInfoWithoutInsurance } from '@/types/PropertyInfoWithoutInsurance';
import { Search, X } from 'lucide-react';
import React, { useRef, useState } from 'react';

interface MoveInFiltersProps {
    cities: City[];
    properties: PropertyInfoWithoutInsurance[];
    initialFilters: {
        city: string;
        property: string;
        search: string;
    };
    onSearch: (filters: { city: string; property: string; search: string }) => void;
    onClear: () => void;
    hasActiveFilters: boolean;
}

export default function MoveInFilters({
    cities,
    properties,
    initialFilters,
    onSearch,
    onClear,
    hasActiveFilters,
}: MoveInFiltersProps) {
    const [tempFilters, setTempFilters] = useState(initialFilters);
    const [showCityDropdown, setShowCityDropdown] = useState(false);
    const [showPropertyDropdown, setShowPropertyDropdown] = useState(false);

    const cityInputRef = useRef<HTMLInputElement>(null);
    const propertyInputRef = useRef<HTMLInputElement>(null);

    // Filter cities based on input
    const filteredCities = cities.filter((city) =>
        city.city.toLowerCase().includes(tempFilters.city.toLowerCase())
    );

    // Filter properties based on input
    const filteredProperties = properties.filter((property) =>
        property.property_name.toLowerCase().includes(tempFilters.property.toLowerCase())
    );

    const handleTempFilterChange = (key: string, value: string) => {
        setTempFilters((prev) => ({ ...prev, [key]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch(tempFilters);
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
                                setShowCityDropdown(value.length > 0);
                            }}
                            onFocus={() => setShowCityDropdown(tempFilters.city.length > 0)}
                            onBlur={() => setTimeout(() => setShowCityDropdown(false), 200)}
                            className="text-input-foreground bg-input"
                        />
                        {showCityDropdown && filteredCities.length > 0 && (
                            <div className="absolute top-full right-0 left-0 z-50 mb-1 max-h-60 overflow-auto rounded-md border border-input bg-popover shadow-lg">
                                {filteredCities.map((city) => (
                                    <div
                                        key={city.id}
                                        className="cursor-pointer px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                                        onClick={() => {
                                            handleTempFilterChange('city', city.city);
                                            setShowCityDropdown(false);
                                        }}
                                    >
                                        {city.city}
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
                                setShowPropertyDropdown(value.length > 0);
                            }}
                            onFocus={() => setShowPropertyDropdown(tempFilters.property.length > 0)}
                            onBlur={() => setTimeout(() => setShowPropertyDropdown(false), 200)}
                            className="text-input-foreground bg-input"
                        />
                        {showPropertyDropdown && filteredProperties.length > 0 && (
                            <div className="absolute top-full right-0 left-0 z-50 mb-1 max-h-60 overflow-auto rounded-md border border-input bg-popover shadow-lg">
                                {filteredProperties.map((property) => (
                                    <div
                                        key={property.id}
                                        className="cursor-pointer px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                                        onClick={() => {
                                            handleTempFilterChange('property', property.property_name);
                                            setShowPropertyDropdown(false);
                                        }}
                                    >
                                        {property.property_name}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Search Filter */}
                    <div className="flex gap-2 md:col-span-2">
                        <Input
                            type="text"
                            placeholder="Search by unit name..."
                            value={tempFilters.search}
                            onChange={(e) => handleTempFilterChange('search', e.target.value)}
                            className="text-input-foreground flex-1 bg-input"
                        />
                        <Button type="submit" size="sm">
                            <Search className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Clear Filters Button */}
                    <div className="flex justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClear}
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
