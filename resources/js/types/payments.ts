export interface Payment {
    // Primary key
    id: number;
    
    // Foreign key - the actual database field
    unit_id: number | null;
    
    // Relationship data - provided by controller transformation for display
    city: string;
    property_name: string | null;
    unit_name: string;
    
    // Payment data
    date: string;
    owes: number;
    paid: number | null;
    left_to_pay: number | null;
    status: string | null;
    notes: string | null;
    reversed_payments: string | null;
    permanent: 'Yes' | 'No';
    
    // Audit fields
    is_archived: boolean;
    created_at: string;
    updated_at: string;
}

export interface PaymentFormData {
    // Form fields that map to database
    date: string;
    unit_id: string; // String in form, converted to number for submission
    owes: string;
    paid: string;
    status: string;
    notes: string;
    reversed_payments: string;
    permanent: 'Yes' | 'No' | '';
    
    // Additional form utility fields
    [key: string]: any;
}

export interface PaymentCreateFormData {
    // Required fields for creation
    date: string;
    unit_id: string;
    owes: string;
    permanent: 'Yes' | 'No';
    
    // Optional fields
    paid?: string;
    notes?: string;
    reversed_payments?: string;
}

export interface PaymentUpdateFormData extends Partial<PaymentCreateFormData> {
    // At least one field must be provided for updates
    date?: string;
    unit_id?: string;
    owes?: string;
    paid?: string;
    notes?: string;
    reversed_payments?: string;
    permanent?: 'Yes' | 'No';
}

export interface UnitData {
    // Database fields
    id: number;
    property_id: number | null;
    unit_name: string;
    
    // Relationship data for display
    city: string;
    property_name: string;
    
    // Additional unit information (optional based on actual needs)
    tenants?: string | null;
    lease_start?: string | null;
    lease_end?: string | null;
    count_beds?: number | null;
    count_baths?: number | null;
    lease_status?: string | null;
    monthly_rent?: number | null;
    recurring_transaction?: string | null;
    utility_status?: string | null;
    account_number?: string | null;
    insurance?: 'Yes' | 'No' | null;
    insurance_expiration_date?: string | null;
    vacant?: string;
    listed?: string;
    total_applications?: number;
    is_archived?: boolean;
}

export interface PropertyData {
    id: number;
    city_id: number | null;
    property_name: string;
    is_archived: boolean;
    
    // Relationship data
    city?: string;
}

export interface CityData {
    id: number;
    city: string;
    is_archived: boolean;
}

// Utility types for different contexts
export interface PaymentDisplayData extends Payment {
    // Additional computed or formatted fields for display
    formatted_owes?: string;
    formatted_paid?: string;
    formatted_left_to_pay?: string;
    formatted_date?: string;
}

export interface PaymentFilters {
    city?: string;
    property?: string;
    unit?: string;
    status?: string;
    date_from?: string;
    date_to?: string;
    search?: string;
}

export interface PaymentStatistics {
    total: number;
    paid: number;
    didnt_pay: number;
    paid_partly: number;
    total_owes: number;
    total_paid: number;
    total_left_to_pay: number;
}

// Dropdown data structures
export interface DropdownData {
    cities: string[];
    properties: string[];
    unitsByCity: Record<string, string[]>;
    unitsByProperty: Record<string, string[]>;
    propertiesByCity: Record<string, string[]>;
    units: UnitData[];
}

// API Response structures
export interface PaymentsPaginatedResponse {
    data: Payment[];
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
    meta: {
        current_page: number;
        from: number | null;
        last_page: number;
        per_page: number;
        to: number | null;
        total: number;
    };
}

export interface PaymentApiResponse {
    payment: Payment;
    message?: string;
}

// Form validation types
export interface PaymentValidationErrors {
    date?: string;
    unit_id?: string;
    owes?: string;
    paid?: string;
    notes?: string;
    reversed_payments?: string;
    permanent?: string;
}

// Component prop types
export interface PaymentComponentProps {
    payments: PaymentsPaginatedResponse;
    search?: string | null;
    filters?: PaymentFilters;
    dropdownData: DropdownData;
    statistics?: PaymentStatistics;
}

export interface PaymentDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
    units: UnitData[];
    cities: string[];
    properties: string[];
    unitsByCity: Record<string, string[]>;
    unitsByProperty: Record<string, string[]>;
    propertiesByCity: Record<string, string[]>;
}

export interface PaymentCreateDrawerProps extends PaymentDrawerProps {
    // No additional props needed for create
}

export interface PaymentEditDrawerProps extends PaymentDrawerProps {
    payment: Payment;
}

// Type guards
export const isValidPayment = (obj: any): obj is Payment => {
    return (
        typeof obj === 'object' &&
        obj !== null &&
        typeof obj.id === 'number' &&
        typeof obj.date === 'string' &&
        typeof obj.city === 'string' &&
        typeof obj.unit_name === 'string' &&
        typeof obj.owes === 'number' &&
        (obj.permanent === 'Yes' || obj.permanent === 'No')
    );
};

export const isValidUnitData = (obj: any): obj is UnitData => {
    return (
        typeof obj === 'object' &&
        obj !== null &&
        typeof obj.id === 'number' &&
        typeof obj.unit_name === 'string' &&
        typeof obj.city === 'string' &&
        typeof obj.property_name === 'string'
    );
};

// Utility type transformations
export type OptionalNullable<T> = {
    [K in keyof T as null extends T[K] ? K : never]?: Exclude<T[K], null>;
} & {
    [K in keyof T as null extends T[K] ? never : K]: T[K];
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type PaymentWithRequiredUnit = RequiredFields<Payment, 'unit_id'>;

// Export commonly used type combinations
export type PaymentFormSubmission = PaymentCreateFormData | PaymentUpdateFormData;
export type PaymentWithRelations = Payment & {
    unit?: UnitData;
    property?: PropertyData;
    city_data?: CityData;
};
