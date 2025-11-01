import React, { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { PropertyInfoWithoutInsurance } from '@/types/PropertyInfoWithoutInsurance';
import { ChevronDown } from 'lucide-react';

interface PropertyAutocompleteProps {
    properties: PropertyInfoWithoutInsurance[];
    value: string;
    onChange: (value: string) => void;
    onSelect: (property: PropertyInfoWithoutInsurance) => void;
}

const PropertyAutocomplete: React.FC<PropertyAutocompleteProps> = ({ properties, value, onChange, onSelect }) => {
    const [showDropdown, setShowDropdown] = useState(false);
    const [filteredProperties, setFilteredProperties] = useState<PropertyInfoWithoutInsurance[]>(properties);
    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const filtered = properties.filter(property =>
            property.property_name.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredProperties(filtered);
    }, [value, properties]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                inputRef.current &&
                !inputRef.current.contains(event.target as Node)
            ) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value);
        setShowDropdown(e.target.value.length > 0);
    };

    const handlePropertySelect = (property: PropertyInfoWithoutInsurance) => {
        onSelect(property);
        setShowDropdown(false);
    };

    return (
        <div className="relative">
            <Input
                ref={inputRef}
                type="text"
                placeholder="Property"
                value={value}
                onChange={handleInputChange}
                onFocus={() => setShowDropdown(true)}
                className="text-input-foreground bg-input pr-8"
            />
            <ChevronDown className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            {showDropdown && filteredProperties.length > 0 && (
                <div
                    ref={dropdownRef}
                    className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-auto rounded-md border border-input bg-popover shadow-lg"
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
    );
};

export default PropertyAutocomplete;
