// resources/js/types/application.ts

export interface Application {
    id: number;
    city: string;
    property: string; // This will now be the property name from Units table
    name: string;
    co_signer: string;
    unit: string; // This will now be the unit_name from Units table
    status: string | null;
    date: string | null;
    stage_in_progress: string | null;
    notes: string | null;
    formatted_date: string | null;
    created_at: string;
    updated_at: string;
}

export interface ApplicationFormData {

    city: string;
    property: string;
    name: string;
    co_signer: string;
    unit: string;
    status: string;
    date: string;
    stage_in_progress: string;
    notes: string;
}

// Add new interfaces for dropdown data
export interface UnitData {
    city: string;
    property: string;
    unit_name: string;
}

export interface DropdownData {
    units: UnitData[];
    cities: string[];
    properties: Record<string, string[]>;
    unitsByProperty: Record<string, Record<string, string[]>>;
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
