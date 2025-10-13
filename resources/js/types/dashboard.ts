// resources/js/types/dashboard.ts

export interface City {
    id: number;
    city: string;
}

export interface Property {
    id: number;
    property_name: string;
    city_id: number;
}

export interface Unit {
    id: number;
    unit_name: string;
    property_id: number;
    tenants?: string;
    lease_start?: string;
    lease_end?: string;
    count_beds?: number;
    count_baths?: number;
    lease_status?: string;
    monthly_rent?: number;
    recurring_transaction?: string;
    utility_status?: string;
    account_number?: string;
    insurance?: string;
    insurance_expiration_date?: string;
    vacant: string;
    listed?: string;
    total_applications?: number;
    formatted_monthly_rent?: string;
    property?: Property & {
        city?: City;
    };
    applications?: Application[];
}

export interface Application {
    id: number;
    unit_id: number;
    // Add other application fields as needed
}

export interface DashboardState {
    selectedCityId: number | null;
    selectedPropertyId: number | null;
    selectedUnitId: number | null;
    cities: City[];
    properties: Property[];
    units: Unit[];
    unitInfo: Unit | null;
    loading: {
        properties: boolean;
        units: boolean;
        unitInfo: boolean;
    };
    errors: {
        properties: string | null;
        units: string | null;
        unitInfo: string | null;
    };
}
