// resources/js/types/vendor.ts

export interface VendorInfo {
    id: number;
    city: string; // Not nullable
    vendor_name: string; // Not nullable
    number: string | null;
    email: string | null;
    display_name: string;
    created_at: string;
    updated_at: string;
}

export interface VendorFormData {
    city: string;
    vendor_name: string;
    number: string;
    email: string;
}

export interface VendorFilters {
    city?: string;
    vendor_name?: string;
    number?: string;
    email?: string;
}

export interface VendorStatistics {
    total: number;
    city_counts: Record<string, number>;
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
