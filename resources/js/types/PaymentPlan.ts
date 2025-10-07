// resources/js/types/PaymentPlan.ts
export interface PaymentPlan {
  id: number;
  property: string;
  city_name?: string;
  unit: string;
  tenant: string;
  amount: number;
  dates: string;
  paid: number;
  left_to_pay: number;
  status: 'Paid' | 'Paid Partly' | "Didn't Pay";
  notes?: string;
  created_at: string;
  updated_at: string;
}

export type PaymentPlanFormData =  {
  property: string;
  city_name?: string;
  unit: string;
  tenant: string;
  amount: number;
  dates: string;
  paid: number;
  notes?: string;
} 

export interface DropdownData {
  cities: Record<string, string>;
  properties: Record<string, string>;
  units: Record<string, string>;
  tenants: Record<string, string>;
}

export interface PaymentPlanIndexProps {
  paymentPlans: {
    data: PaymentPlan[];
    links: any[];
    current_page: number;
    last_page: number;
  };
}

export interface PaymentPlanCreateProps {
  dropdownData: DropdownData;
}

export interface PaymentPlanEditProps {
  paymentPlan: PaymentPlan;
  dropdownData: DropdownData;
}

export interface PaymentPlanShowProps {
  paymentPlan: PaymentPlan;
}
