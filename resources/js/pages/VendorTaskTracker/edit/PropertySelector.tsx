import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import FormSection from './FormSection';

interface PropertyOption {
    id: number;
    property_name: string;
    city?: string;
}

interface PropertySelectorProps {
    properties: PropertyOption[];
    selectedProperty: string;
    onPropertyChange: (property: string) => void;
    disabled: boolean;
    error?: string;
}

export default function PropertySelector({
    properties,
    selectedProperty,
    onPropertyChange,
    disabled,
    error,
}: PropertySelectorProps) {
    return (
        <FormSection
            label="Property"
            required
            borderColor="border-l-indigo-500"
            error={error}
        >
            <Select
                onValueChange={onPropertyChange}
                value={selectedProperty}
                disabled={disabled}
            >
                <SelectTrigger>
                    <SelectValue placeholder="Select property" />
                </SelectTrigger>
                <SelectContent>
                    {properties?.map((property) => (
                        <SelectItem key={property.id} value={property.property_name}>
                            {property.property_name}
                        </SelectItem>
                    )) || []}
                </SelectContent>
            </Select>
        </FormSection>
    );
}
