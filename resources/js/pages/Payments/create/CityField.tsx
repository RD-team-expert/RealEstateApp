import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CityFieldProps {
    cities: string[];
    selectedCity: string;
    onCityChange: (city: string) => void;
    validationError?: string;
    unitIdError?: string;
}

export function CityField({ 
    cities, 
    selectedCity, 
    onCityChange, 
    validationError, 
    unitIdError 
}: CityFieldProps) {
    return (
        <div className="rounded-lg border-l-4 border-l-green-500 p-4">
            <div className="mb-2">
                <Label htmlFor="city" className="text-base font-semibold">
                    City *
                </Label>
            </div>
            <Select onValueChange={onCityChange} value={selectedCity}>
                <SelectTrigger>
                    <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent>
                    {cities?.map((city) => (
                        <SelectItem key={city} value={city}>
                            {city}
                        </SelectItem>
                    )) || []}
                </SelectContent>
            </Select>
            {unitIdError && <p className="mt-1 text-sm text-red-600">{unitIdError}</p>}
            {validationError && <p className="mt-1 text-sm text-red-600">{validationError}</p>}
        </div>
    );
}
