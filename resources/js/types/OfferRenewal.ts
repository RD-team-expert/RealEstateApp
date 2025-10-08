// types/OfferRenewal.ts
export interface OfferRenewal {
  id: number;
  property: string;
  city_name?: string;
  unit: string;
  tenant: string;
  date_sent_offer: string;
  status?: string;
  date_of_acceptance?: string;
  last_notice_sent?: string;
  notice_kind?: string;
  lease_sent?: string;
  date_sent_lease?: string;
  lease_signed?: string;
  date_signed?: string;
  last_notice_sent_2?: string;
  notice_kind_2?: string;
  notes?: string;
  how_many_days_left?: number;
  expired?: string;
  is_archived?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Tenant {
  property_name: string;
  unit_number: string;
  first_name: string;
  last_name: string;
}
