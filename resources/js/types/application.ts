// resources/js/types/application.ts

export interface Application {
    id: number;
    property: string; // Not nullable
    name: string; // Not nullable
    co_signer: string; // Not nullable
    unit: string; // Not nullable
    status: string | null;
    date: string | null;
    stage_in_progress: string | null;
    notes: string | null;
    formatted_date: string | null;
    created_at: string;
    updated_at: string;
}

export interface ApplicationFormData {
    property: string;
    name: string;
    co_signer: string;
    unit: string;
    status: string;
    date: string;
    stage_in_progress: string;
    notes: string;
}

export interface ApplicationFilters {
    property?: string;
    name?: string;
    co_signer?: string;
    unit?: string;
    status?: string;
    stage_in_progress?: string;
    date_from?: string;
    date_to?: string;
}

export interface ApplicationStatistics {
    total: number;
    status_counts: Record<string, number>;
    stage_counts: Record<string, number>;
}

export interface PaginatedApplications {
    data: Application[];
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

export interface StatusOption {
    value: string;
    label: string;
}

export interface StageOption {
    value: string;
    label: string;
}
