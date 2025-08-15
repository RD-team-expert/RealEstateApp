export interface Tenant {
    id: number;
    property_name: string;
    unit_number: string;
    first_name: string;
    last_name: string;
    street_address_line?: string | null;
    login_email?: string | null;
    alternate_email?: string | null;
    mobile?: string | null;
    emergency_phone?: string | null;
    cash_or_check?: 'Cash' | 'Check' | null;
    has_insurance?: 'Yes' | 'No' | null;
    sensitive_communication?: 'Yes' | 'No' | null;
    has_assistance?: 'Yes' | 'No' | null;
    assistance_amount?: number | null;
    assistance_company?: string | null;
    created_at: string;
    updated_at: string;
}

export interface TenantFormData {
    property_name: string;
    unit_number: string;
    first_name: string;
    last_name: string;
    street_address_line: string;
    login_email: string;
    alternate_email: string;
    mobile: string;
    emergency_phone: string;
    cash_or_check: string;
    has_insurance: string;
    sensitive_communication: string;
    has_assistance: string;
    assistance_amount: string;
    assistance_company: string;
}
