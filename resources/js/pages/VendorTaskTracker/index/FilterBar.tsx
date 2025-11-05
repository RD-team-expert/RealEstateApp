import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronDown, Search, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

interface CityOption {
    id: number;
    city: string;
}

interface PropertyOption {
    id: number;
    property_name: string;
    city?: string;
}

interface VendorOption {
    id: number;
    vendor_name: string;
    city?: string;
}

interface FilterBarProps {
    filters: {
        search?: string;
        city?: string;
        property?: string;
        unit_name?: string;
        vendor_name?: string;
        status?: string;
    };
    cities: CityOption[];
    properties: PropertyOption[];
    vendors: VendorOption[];
    onSearch: (filters: any) => void;
    onClear: () => void;
}

const STATUS_OPTIONS = [
    { value: 'exclude_completed', label: 'Exclude Completed' },
    { value: 'all', label: 'Show All' },
    { value: 'Completed', label: 'Completed' },
    { value: 'In Progress', label: 'In Progress' },
    { value: 'Pending', label: 'Pending' },
];

export default function FilterBar({
    filters,
    cities,
    properties,
    vendors,
    onSearch,
    onClear,
}: FilterBarProps) {
    const [tempFilters, setTempFilters] = useState(filters);

    // City autocomplete states
    const [cityInput, setCityInput] = useState(filters.city || '');
    const [showCityDropdown, setShowCityDropdown] = useState(false);
    const [filteredCities, setFilteredCities] = useState<CityOption[]>([]);
    const cityInputRef = useRef<HTMLInputElement>(null);
    const cityDropdownRef = useRef<HTMLDivElement>(null);

    // Property autocomplete states
    const [propertyInput, setPropertyInput] = useState(filters.property || '');
    const [showPropertyDropdown, setShowPropertyDropdown] = useState(false);
    const propertyInputRef = useRef<HTMLInputElement>(null);
    const propertyDropdownRef = useRef<HTMLDivElement>(null);

    // Vendor autocomplete states
    const [vendorInput, setVendorInput] = useState(filters.vendor_name || '');
    const [showVendorDropdown, setShowVendorDropdown] = useState(false);
    const vendorInputRef = useRef<HTMLInputElement>(null);
    const vendorDropdownRef = useRef<HTMLDivElement>(null);

    // Status filter state
    const [statusInput, setStatusInput] = useState(filters.status || 'exclude_completed');

    // Filter cities based on input
    useEffect(() => {
        if (!cities) return;

        if (cityInput.trim() === '') {
            setFilteredCities(cities);
        } else {
            const filtered = cities.filter((city) =>
                city.city.toLowerCase().includes(cityInput.toLowerCase())
            );
            setFilteredCities(filtered);
        }
    }, [cityInput, cities]);

    // Filter properties based on input
    const filteredProperties =
        properties?.filter((property) =>
            property.property_name.toLowerCase().includes(propertyInput.toLowerCase())
        ) || [];

    // Filter vendors based on input
    const filteredVendors =
        vendors?.filter((vendor) =>
            vendor.vendor_name.toLowerCase().includes(vendorInput.toLowerCase())
        ) || [];

    // Handle clicks outside dropdowns
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
                vendorDropdownRef.current &&
                !vendorDropdownRef.current.contains(event.target as Node) &&
                vendorInputRef.current &&
                !vendorInputRef.current.contains(event.target as Node)
            ) {
                setShowVendorDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleTempFilterChange = (key: keyof typeof tempFilters, value: string) => {
        setTempFilters({ ...tempFilters, [key]: value });
    };

    const handleCitySelect = (city: string) => {
        setCityInput(city);
        handleTempFilterChange('city', city);
        setShowCityDropdown(false);
    };

    const handleCityInputChange = (value: string) => {
        setCityInput(value);
        handleTempFilterChange('city', value);
        setShowCityDropdown(true);
    };

    const handlePropertyInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setPropertyInput(value);
        handleTempFilterChange('property', value);
        setShowPropertyDropdown(value.length > 0);
    };

    const handlePropertySelect = (property: PropertyOption) => {
        setPropertyInput(property.property_name);
        handleTempFilterChange('property', property.property_name);
        setShowPropertyDropdown(false);
    };

    const handleVendorInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setVendorInput(value);
        handleTempFilterChange('vendor_name', value);
        setShowVendorDropdown(value.length > 0);
    };

    const handleVendorSelect = (vendor: VendorOption) => {
        setVendorInput(vendor.vendor_name);
        handleTempFilterChange('vendor_name', vendor.vendor_name);
        setShowVendorDropdown(false);
    };

    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setStatusInput(value);
        handleTempFilterChange('status', value);
    };

    const handleSearchClick = () => {
        onSearch(tempFilters);
    };

    const handleClearFilters = () => {
        setTempFilters({});
        setCityInput('');
        setPropertyInput('');
        setVendorInput('');
        setStatusInput('exclude_completed');
        setShowCityDropdown(false);
        setShowPropertyDropdown(false);
        setShowVendorDropdown(false);
        onClear();
    };

    return (
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-7">
            {/* City Filter with Autocomplete */}
            <div className="relative">
                <Input
                    ref={cityInputRef}
                    type="text"
                    placeholder="Filter by City"
                    value={cityInput}
                    onChange={(e) => handleCityInputChange(e.target.value)}
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
                                onClick={() => handleCitySelect(city.city)}
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
                    placeholder="Filter by Property"
                    value={propertyInput}
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
                                {property.city && (
                                    <span className="ml-2 text-xs text-muted-foreground">
                                        ({property.city})
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Unit Name Filter */}
            <Input
                type="text"
                placeholder="Filter by Unit"
                value={tempFilters.unit_name || ''}
                onChange={(e) => handleTempFilterChange('unit_name', e.target.value)}
                className="text-input-foreground bg-input"
            />

            {/* Vendor Filter with Autocomplete */}
            <div className="relative">
                <Input
                    ref={vendorInputRef}
                    type="text"
                    placeholder="Filter by Vendor"
                    value={vendorInput}
                    onChange={handleVendorInputChange}
                    onFocus={() => setShowVendorDropdown(true)}
                    className="text-input-foreground bg-input pr-8"
                />
                <ChevronDown className="absolute top-1/2 right-2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                {showVendorDropdown && filteredVendors.length > 0 && (
                    <div
                        ref={vendorDropdownRef}
                        className="absolute top-full right-0 left-0 z-50 mt-1 max-h-60 overflow-auto rounded-md border border-input bg-popover shadow-lg"
                    >
                        {filteredVendors.map((vendor) => (
                            <div
                                key={vendor.id}
                                className="cursor-pointer px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                                onClick={() => handleVendorSelect(vendor)}
                            >
                                {vendor.vendor_name}
                                {vendor.city && (
                                    <span className="ml-2 text-xs text-muted-foreground">
                                        ({vendor.city})
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Status Filter Dropdown */}
            <select
                value={statusInput}
                onChange={handleStatusChange}
                className="rounded-md border border-input bg-input px-3 py-2 text-sm text-input-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
                {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>

            {/* Search Button */}
            <Button onClick={handleSearchClick} variant="default" className="flex items-center">
                <Search className="mr-2 h-4 w-4" />
                Search
            </Button>

            {/* Clear Filters Button */}
            <Button onClick={handleClearFilters} variant="outline" className="flex items-center">
                <X className="mr-2 h-4 w-4" />
                Clear
            </Button>
        </div>
    );
}
