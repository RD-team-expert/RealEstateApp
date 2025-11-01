import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { MapPin } from 'lucide-react';
import { City } from '@/types/City';

interface CitySelectionSectionProps {
    selectedCityId: string;
    cities: City[];
    onCityChange: (value: string) => void;
}

export default function CitySelectionSection({
    selectedCityId,
    cities,
    onCityChange
}: CitySelectionSectionProps) {
    return (
        <div className="rounded-lg border-l-4 border-l-blue-500 p-4">
            <div className="mb-2">
                <Label htmlFor="city_select" className="text-base font-semibold">
                    <MapPin className="h-4 w-4 inline mr-1" />
                    Select City
                </Label>
            </div>
            <Select value={selectedCityId} onValueChange={onCityChange}>
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose a city..." />
                </SelectTrigger>
                <SelectContent>
                    {cities.map((city) => (
                        <SelectItem key={city.id} value={city.id.toString()}>
                            {city.city}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
