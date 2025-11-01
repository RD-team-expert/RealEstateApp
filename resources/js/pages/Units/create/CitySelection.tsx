import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Props {
    cities: Array<{ id: number; city: string }>;
    selectedCityId: string;
    onCityChange: (cityId: string) => void;
    validationError?: string;
}

export default function CitySelection({ cities, selectedCityId, onCityChange, validationError }: Props) {
    return (
        <div className="rounded-lg border-l-4 border-l-blue-500 p-4">
            <div className="mb-2">
                <Label htmlFor="city" className="text-base font-semibold">
                    City *
                </Label>
            </div>
            <Select onValueChange={onCityChange} value={selectedCityId}>
                <SelectTrigger>
                    <SelectValue placeholder="Select a city" />
                </SelectTrigger>
                <SelectContent>
                    {cities?.map((city) => (
                        <SelectItem key={city.id} value={city.id.toString()}>
                            {city.city}
                        </SelectItem>
                    )) || []}
                </SelectContent>
            </Select>
            {validationError && <p className="mt-1 text-sm text-red-600">{validationError}</p>}
        </div>
    );
}
