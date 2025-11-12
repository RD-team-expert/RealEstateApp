// resources/js/Pages/Applications/index/FilterBar.tsx
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, X, ChevronDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface CityData {
    id: number;
    name: string;
}

interface PropertyData {
    id: number;
    name: string;
    city_id: number;
}

interface UnitData {
    id: number;
    name: string;
    property_id: number;
}

interface FilterBarProps {
    cities: CityData[];
    properties: Record<string, PropertyData[]>;
    units: Record<string, UnitData[]>;
    onSearch: (filters: {
        city: string;
        property: string;
        unit: string;
        name: string;
        applicant_applied_from: string;
    }) => void;
    onClear: () => void;
    initialFilters?: {
        city: string;
        property: string;
        unit: string;
        name: string;
        applicant_applied_from: string;
    };
}

export default function FilterBar({ cities, properties, units, onSearch, onClear, initialFilters }: FilterBarProps) {
    const [tempFilters, setTempFilters] = useState({
        city: '',
        property: '',
        unit: '',
        name: '',
        applicant_applied_from: '',
    });

    useEffect(() => {
        if (initialFilters) {
            setTempFilters({
                city: initialFilters.city || '',
                property: initialFilters.property || '',
                unit: initialFilters.unit || '',
                name: initialFilters.name || '',
                applicant_applied_from: initialFilters.applicant_applied_from || '',
            });
        }
    }, [initialFilters]);

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

    const handleCitySelect = (city: CityData) => {
        handleTempFilterChange('city', city.name);
        setShowCityDropdown(false);
    };

    const handleCityInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        handleTempFilterChange('city', value);
        setShowCityDropdown(value.length > 0);
    };

    const handlePropertySelect = (property: PropertyData) => {
        handleTempFilterChange('property', property.name);
        setShowPropertyDropdown(false);
    };

    const handlePropertyInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        handleTempFilterChange('property', value);
        setShowPropertyDropdown(value.length > 0);
    };

    const handleUnitSelect = (unit: UnitData) => {
        handleTempFilterChange('unit', unit.name);
        setShowUnitDropdown(false);
    };

    const handleUnitInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        handleTempFilterChange('unit', value);
        setShowUnitDropdown(value.length > 0);
    };

    const handleSearchClick = () => {
        onSearch(tempFilters);
    };

    const handleClearFilters = () => {
        const cleared = {
            city: '',
            property: '',
            unit: '',
            name: '',
            applicant_applied_from: '',
        };
        setTempFilters(cleared);
        onClear();
    };

    const allProperties = Object.values(properties).flat();
    const filteredProperties = allProperties.filter((property) =>
        property.name.toLowerCase().includes(tempFilters.property.toLowerCase())
    );

    const allUnits = Object.values(units).flat();
    const filteredUnits = allUnits.filter((unit) =>
        unit.name.toLowerCase().includes(tempFilters.unit.toLowerCase())
    );

    const filteredCities = cities.filter((city) =>
        city.name.toLowerCase().includes(tempFilters.city.toLowerCase())
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
                                {city.name}
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
                                {property.name}
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
                                {unit.name}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Application Name Filter */}
            <Input
                type="text"
                placeholder="Application Name"
                value={tempFilters.name}
                onChange={(e) => handleTempFilterChange('name', e.target.value)}
                className="text-input-foreground bg-input"
            />

            {/* Applicant Applied From Filter */}
            <Input
                type="text"
                placeholder="Applied From"
                value={tempFilters.applicant_applied_from}
                onChange={(e) => handleTempFilterChange('applicant_applied_from', e.target.value)}
                className="text-input-foreground bg-input"
            />

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
