import React, { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { ChevronDown } from 'lucide-react';

interface CityAutocompleteProps {
    cities: Array<{ id: number; city: string }>;
    value: string;
    onChange: (value: string) => void;
    onSelect: (city: string) => void;
}

const CityAutocomplete: React.FC<CityAutocompleteProps> = ({ cities, value, onChange, onSelect }) => {
    const [showDropdown, setShowDropdown] = useState(false);
    const [filteredCities, setFilteredCities] = useState<Array<{ id: number; city: string }>>(cities);
    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (value.trim() === '') {
            setFilteredCities(cities);
        } else {
            const filtered = cities.filter(city =>
                city.city.toLowerCase().includes(value.toLowerCase())
            );
            setFilteredCities(filtered);
        }
    }, [value, cities]);

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
        setShowDropdown(true);
    };

    const handleCitySelect = (city: string) => {
        onSelect(city);
        setShowDropdown(false);
    };

    return (
        <div className="relative">
            <Input
                ref={inputRef}
                type="text"
                placeholder="City"
                value={value}
                onChange={handleInputChange}
                onFocus={() => setShowDropdown(true)}
                className="text-input-foreground bg-input pr-8"
            />
            <ChevronDown className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            {showDropdown && filteredCities.length > 0 && (
                <div
                    ref={dropdownRef}
                    className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-auto rounded-md border border-input bg-popover shadow-lg"
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
    );
};

export default CityAutocomplete;
