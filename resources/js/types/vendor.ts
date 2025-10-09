// resources/js/types/vendor.ts

export interface City {
    id: number;
    city: string;
}

export interface VendorInfo {
    id: number;
    city_id: number | null;
    city?: City | null; // Optional relationship - may be loaded via eager loading
    vendor_name: string; // Not nullable
    number: string | null;
    email: string | null;
    service_type: string | null;
    display_name: string;
    created_at: string;
    updated_at: string;
}

export interface VendorFormData {
    city_id: string; // Form sends as string, backend converts to int
    vendor_name: string;
    number: string;
    email: string;
    service_type: string;
}

export interface VendorFilters {
    city?: string; // City name for filtering (not ID)
    city_id?: string; // City ID for direct filtering
    vendor_name?: string;
    number?: string;
    email?: string;
}

export interface VendorStatistics {
    total: number;
    city_counts: Record<string, number>; // City names mapped to counts
    with_email: number;
    with_number: number;
}

export interface PaginatedVendors {
    data: VendorInfo[];
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
    flash?: {
        success?: string;
        error?: string;
        info?: string;
        warning?: string;
    };
}

// Additional utility types for better type safety
export interface VendorCreateFormData {
    city_id: string;
    vendor_name: string;
    number?: string;
    email?: string;
    service_type?: string;
}

export interface VendorUpdateFormData extends VendorCreateFormData {
    // Same as create for now, but separated for future extensibility
}

// For components that need vendor with guaranteed city relationship
export interface VendorWithCity extends Omit<VendorInfo, 'city'> {
    city: City;
}

// Service type enum for better type safety
export type ServiceType = 
    | 'Maintenance'
    | 'Appliances'
    | 'Pest control'
    | 'HVAC Repairs'
    | 'Plumbing'
    | 'Landscaping'
    | 'Lock Smith'
    | 'Garage door';

export const SERVICE_TYPES: Array<{ value: ServiceType; label: string }> = [
    { value: 'Maintenance', label: 'Maintenance' },
    { value: 'Appliances', label: 'Appliances' },
    { value: 'Pest control', label: 'Pest control' },
    { value: 'HVAC Repairs', label: 'HVAC Repairs' },
    { value: 'Plumbing', label: 'Plumbing' },
    { value: 'Landscaping', label: 'Landscaping' },
    { value: 'Lock Smith', label: 'Lock Smith' },
    { value: 'Garage door', label: 'Garage door' }
];
