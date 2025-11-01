import { useState } from 'react';
import { router } from '@inertiajs/react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import FilterInput from './FilterInput';

interface TenantData {
    id: number;
    full_name: string;
    tenant_id: number;
}

interface FiltersCardProps {
    cities: Array<{ id: number; city: string }>;
    properties: Array<{ id: number; property_name: string }>;
    allUnits: Array<{ id: number; unit_name: string }>;
    tenantsData: TenantData[];
}

export default function FiltersCard({ cities, properties, allUnits, tenantsData }: FiltersCardProps) {
    const [tempFilters, setTempFilters] = useState({
        city: '',
        property: '',
        unit: '',
        tenant: '',
    });

    const [, setFilters] = useState({
        city: '',
        property: '',
        unit: '',
        tenant: '',
    });

    const handleTempFilterChange = (key: string, value: string) => {
        setTempFilters((prev) => ({ ...prev, [key]: value }));
    };

    const handleSearchClick = () => {
        setFilters(tempFilters);

        const selectedCity = cities.find(city => city.city === tempFilters.city);
        const selectedProperty = properties.find(property => property.property_name === tempFilters.property);
        const selectedUnit = allUnits.find(unit => unit.unit_name === tempFilters.unit);
        const selectedTenant = tenantsData.find(tenant => tenant.full_name === tempFilters.tenant);

        router.get(
            route('payment-plans.index'),
            {
                city_id: selectedCity?.id || null,
                property_id: selectedProperty?.id || null,
                unit_id: selectedUnit?.id || null,
                tenant_id: selectedTenant?.id || null,
            },
            { preserveState: true },
        );
    };

    const handleClearFilters = () => {
        setTempFilters({
            city: '',
            property: '',
            unit: '',
            tenant: '',
        });
        setFilters({
            city: '',
            property: '',
            unit: '',
            tenant: '',
        });

        router.get(route('payment-plans.index'), {}, { preserveState: false });
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

    const filteredTenants = tenantsData.filter(tenant =>
        tenant.full_name.toLowerCase().includes(tempFilters.tenant.toLowerCase())
    );

    return (
        <Card className="bg-card text-card-foreground shadow-lg">
            <CardHeader>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-6">
                    <FilterInput
                        placeholder="City"
                        value={tempFilters.city}
                        onChange={(value) => handleTempFilterChange('city', value)}
                        options={filteredCities.map(city => ({ id: city.id, name: city.city }))}
                        onSelect={(item) => handleTempFilterChange('city', item.name)}
                    />

                    <FilterInput
                        placeholder="Property"
                        value={tempFilters.property}
                        onChange={(value) => handleTempFilterChange('property', value)}
                        options={filteredProperties.map(property => ({ id: property.id, name: property.property_name }))}
                        onSelect={(item) => handleTempFilterChange('property', item.name)}
                    />

                    <FilterInput
                        placeholder="Unit"
                        value={tempFilters.unit}
                        onChange={(value) => handleTempFilterChange('unit', value)}
                        options={filteredUnits.map(unit => ({ id: unit.id, name: unit.unit_name }))}
                        onSelect={(item) => handleTempFilterChange('unit', item.name)}
                    />

                    <FilterInput
                        placeholder="Tenant"
                        value={tempFilters.tenant}
                        onChange={(value) => handleTempFilterChange('tenant', value)}
                        options={filteredTenants.map(tenant => ({ id: tenant.id, name: tenant.full_name }))}
                        onSelect={(item) => handleTempFilterChange('tenant', item.name)}
                    />

                    <div className="hidden md:block"></div>

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
            </CardHeader>
            <CardContent />
        </Card>
    );
}
