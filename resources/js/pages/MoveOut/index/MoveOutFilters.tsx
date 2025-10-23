import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronDown, Search, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

interface MoveOutFiltersProps {
    cities: any[];
    properties: any[];
    allUnits: Array<{ id: number; unit_name: string; city_name: string; property_name: string }>;
    onSearch: (filters: { city_id: number | null; property_id: number | null; unit_id: number | null }) => void;
    onClear: () => void;
}

export default function MoveOutFilters({ cities, properties, allUnits, onSearch, onClear }: MoveOutFiltersProps) {
    const [tempFilters, setTempFilters] = useState({
        city: '',
        property: '',
        unit: '',
    });

    const [showCityDropdown, setShowCityDropdown] = useState(false);
    const [showPropertyDropdown, setShowPropertyDropdown] = useState(false);
    const [showUnitDropdown, setShowUnitDropdown] = useState(false);

    const cityDropdownRef = useRef<HTMLDivElement>(null);
    const propertyDropdownRef = useRef<HTMLDivElement>(null);
    const unitDropdownRef = useRef<HTMLDivElement>(null);
    const cityInputRef = useRef<HTMLInputElement>(null);
    const propertyInputRef = useRef<HTMLInputElement>(null);
    const unitInputRef = useRef<HTMLInputElement>(null);

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
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleTempFilterChange = (key: string, value: string) => {
        setTempFilters((prev) => ({ ...prev, [key]: value }));
    };

    const handleCitySelect = (city: any) => {
        handleTempFilterChange('city', city.city);
        setShowCityDropdown(false);
    };

    const handleCityInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        handleTempFilterChange('city', value);
        setShowCityDropdown(value.length > 0);
    };

    const handlePropertyInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        handleTempFilterChange('property', value);
        setShowPropertyDropdown(value.length > 0);
    };

    const handlePropertySelect = (property: any) => {
        handleTempFilterChange('property', property.property_name);
        setShowPropertyDropdown(false);
    };

    const handleUnitInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        handleTempFilterChange('unit', value);
        setShowUnitDropdown(value.length > 0);
    };

    const handleUnitSelect = (unit: any) => {
        handleTempFilterChange('unit', unit.unit_name);
        setShowUnitDropdown(false);
    };

    const handleSearchClick = () => {
        const selectedCity = cities.find(city => city.city === tempFilters.city);
        const selectedProperty = properties.find(property => property.property_name === tempFilters.property);
        const selectedUnit = allUnits.find(unit => unit.unit_name === tempFilters.unit);
        
        onSearch({
            city_id: selectedCity?.id || null,
            property_id: selectedProperty?.id || null,
            unit_id: selectedUnit?.id || null,
        });
    };

    const handleClearFilters = () => {
        setTempFilters({
            city: '',
            property: '',
            unit: '',
        });
        onClear();
    };

    const filteredCities = cities.filter((city) => 
        city.city.toLowerCase().includes(tempFilters.city.toLowerCase())
    );

    const filteredProperties = properties.filter((property) => 
        property.property_name.toLowerCase().includes(tempFilters.property.toLowerCase())
    );

    const filteredUnits = allUnits.filter(unit =>
        unit.unit_name.toLowerCase().includes(tempFilters.unit.toLowerCase())
    );

    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
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

            {/* Search and Clear Buttons */}
            <div className="flex gap-2">
                <Button onClick={handleSearchClick} variant="default" className="flex items-center">
                    <Search className="mr-2 h-4 w-4" />
                    Search
                </Button>
                <Button onClick={handleClearFilters} variant="outline" className="flex items-center">
                    <X className="mr-2 h-4 w-4" />
                    Clear
                </Button>
            </div>
        </div>
    );
}
