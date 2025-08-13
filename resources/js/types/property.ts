// resources/js/types/property.ts

export interface Property {
    id: number;
    property_name: string;
    insurance_company_name: string;
    amount: number;
    policy_number: string;
    effective_date: string;
    expiration_date: string;
    days_left: number;
    formatted_amount: string;
    is_expired: boolean;
    is_expiring_soon: boolean;
    created_at: string;
    updated_at: string;
}

export interface PropertyFormData {
    property_name: string;
    insurance_company_name: string;
    amount: string;
    policy_number: string;
    effective_date: string;
    expiration_date: string;
}

export interface PropertyFilters {
    property_name?: string;
    insurance_company_name?: string;
    policy_number?: string;
    status?: 'active' | 'expiring_soon' | 'expired';
}

export interface PropertyStatistics {
    total: number;
    active: number;
    expiring_soon: number;
    expired: number;
}

export interface PaginatedProperties {
    data: Property[];
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
