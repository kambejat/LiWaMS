export interface Bill {
  id: number;
  customer_id: number;
  customer: string;
  reading_id: number;
  billing_start: string;
  billing_end: string;
  consumption: number;
  fixed_charge: number;
  variable_charge: number;
  meter_number: number;
  amount_due: number;
  due_date: string;
  status: string;
  previous_reading: number;
  total_reading: number;
}

export interface CustomerBillGroup {
  customer_id: number;
  customer: string;
  total_amount_due: number;
  billing_period: string;
  bills: Bill[];
}