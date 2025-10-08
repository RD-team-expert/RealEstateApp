export interface NoticeAndEviction {
  id: number;
  unit_name: string;
  city_name?: string;
  property_name?: string;
  tenants_name: string;
  status?: string;
  date?: string;
  type_of_notice?: string;
  have_an_exception?: string; // "Yes" | "No"
  note?: string;
  evictions?: string;
  sent_to_atorney?: string; // "Yes" | "No"
  hearing_dates?: string;
  evected_or_payment_plan?: string; // "Evected" | "Payment Plan"
  if_left?: string; // "Yes" | "No"
  writ_date?: string;
  is_archived?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Tenant {
  unit_number: string;
  first_name: string;
  last_name: string;
}

export interface Notice {
  notice_name: string;
}
