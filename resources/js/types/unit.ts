// resources/js/types/unit.ts

export interface Unit {
    id: number;
    city: string;
    property: string;
    unit_name: string;
    tenants: string | null;
    lease_start: string | null;
    lease_end: string | null;
    count_beds: number | null;
    count_baths: number | null;
    lease_status: string | null;
    monthly_rent: number | null;
    recurring_transaction: string | null;
    utility_status: string | null;
    account_number: string | null;
    insurance: 'Yes' | 'No' | null;
    insurance_expiration_date: string | null;
    vacant: string;
    listed: string;
    total_applications: number;
    formatted_monthly_rent: string;
    created_at: string;
    updated_at: string;
}

export interface UnitFormData {
    city: string;
    property: string;
    unit_name: string;
    tenants: string;
    lease_start: string;
    lease_end: string;
    count_beds: string;
    count_baths: string;
    lease_status: string;
    monthly_rent: string;
    recurring_transaction: string;
    utility_status: string;
    account_number: string;
    insurance: string;
    insurance_expiration_date: string;
}

export interface UnitFilters {
    city?: string;
    property?: string;
    unit_name?: string;
    vacant?: string;
    listed?: string;
    insurance?: string;
}

export interface UnitStatistics {
    total: number;
    vacant: number;
    occupied: number;
    listed: number;
    total_applications: number;
    city_stats: Record<string, number>;
}

export interface PaginatedUnits {
    data: Unit[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;

}
export interface PageProps {
    auth: {
        user: any; // Replace with your user type
    };
    cities?: Array<{ id: number; city: string }>;
}


