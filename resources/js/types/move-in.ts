export interface MoveIn {
    id: number;
    unit_name: string;
    signed_lease: 'Yes' | 'No';
    lease_signing_date: string | null;  // ISO string date
    move_in_date: string | null;  // ISO string date
    paid_security_deposit_first_month_rent: 'Yes' | 'No' | null;
    scheduled_paid_time: string | null;  // ISO string date
    handled_keys: 'Yes' | 'No' | null;
    move_in_form_sent_date: string | null;  // ISO string date
    filled_move_in_form: 'Yes' | 'No' | null;
    date_of_move_in_form_filled: string | null;  // ISO string date
    submitted_insurance: 'Yes' | 'No' | null;
    date_of_insurance_expiration: string | null;  // ISO string date
    created_at: string;
    updated_at: string;
}

export interface MoveInFormData {
    unit_name: string;
    signed_lease: 'Yes' | 'No' | '';
    lease_signing_date: string;
    move_in_date: string;
    paid_security_deposit_first_month_rent: 'Yes' | 'No' | '';
    scheduled_paid_time: string;
    handled_keys: 'Yes' | 'No' | '';
    move_in_form_sent_date: string;
    filled_move_in_form: 'Yes' | 'No' | '';
    date_of_move_in_form_filled: string;
    submitted_insurance: 'Yes' | 'No' | '';
    date_of_insurance_expiration: string;
}
