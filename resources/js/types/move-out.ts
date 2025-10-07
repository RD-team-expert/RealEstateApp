export interface MoveOut {
    id: number;
    tenants_name: string;
    units_name: string;
    city_name: string | null;
    property_name: string | null;
    move_out_date: string | null;  // ISO string date
    lease_status: string | null;
    date_lease_ending_on_buildium: string | null;  // ISO string date
    keys_location: string | null;
    utilities_under_our_name: 'Yes' | 'No' | null;
    date_utility_put_under_our_name: string | null;  // ISO string date
    walkthrough: string | null;
    repairs: string | null;
    send_back_security_deposit: string | null;
    notes: string | null;
    cleaning: 'cleaned' | 'uncleaned' | null;
    list_the_unit: string | null;
    move_out_form: 'filled' | 'not filled' | null;
    created_at: string;
    updated_at: string;
}

export type MoveOutFormData = {
    city_name?: string;
    property_name?: string;
    tenants_name: string;
    units_name: string;
    move_out_date: string;
    lease_status: string;
    date_lease_ending_on_buildium: string;
    keys_location: string;
    utilities_under_our_name: 'Yes' | 'No' | '';
    date_utility_put_under_our_name: string;
    walkthrough: string;
    repairs: string;
    send_back_security_deposit: string;
    notes: string;
    cleaning: 'cleaned' | 'uncleaned' | '';
    list_the_unit: string;
    move_out_form: 'filled' | 'not filled' | '';
} & Record<string, any>;

export interface TenantData {
    full_name: string;
    unit_number: string;
    property_name?: string;
}
