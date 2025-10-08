export interface Payment {
    id: number;
    date: string;
    city: string;
    property_name: string | null;
    unit_name: string;
    owes: number;
    paid: number | null;
    left_to_pay: number | null;
    status: string | null;
    notes: string | null;
    reversed_payments: string | null;
    permanent: 'Yes' | 'No';
    created_at: string;
    updated_at: string;
}

export interface PaymentFormData {
    date: string;
    city: string;
    property_name: string;
    unit_name: string;
    owes: string;
    paid: string;
    left_to_pay: string;
    status: string;
    notes: string;
    reversed_payments: string;
    permanent: 'Yes' | 'No' | '';
    [key: string]: any;
}

export interface UnitData {
    city: string;
    property: string;
    unit_name: string;
}
