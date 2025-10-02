export interface VendorTaskTracker {
    id: number;
    city: string;
    task_submission_date: string;  // ISO string date
    vendor_name: string;
    unit_name: string;
    assigned_tasks: string;
    any_scheduled_visits: string | null;  // ISO string date
    notes: string | null;
    task_ending_date: string | null;  // ISO string date
    status: string | null;
    urgent: 'Yes' | 'No';
    created_at: string;
    updated_at: string;
}

export type VendorTaskTrackerFormData = {
    city: string;
    task_submission_date: string;
    vendor_name: string;
    unit_name: string;
    assigned_tasks: string;
    any_scheduled_visits: string;
    notes: string;
    task_ending_date: string;
    status: string;
    urgent: 'Yes' | 'No';
} & Record<string, any>;

export interface UnitData {
    city: string;
    unit_name: string;
}

export interface VendorData {
    vendor_name: string;
}
