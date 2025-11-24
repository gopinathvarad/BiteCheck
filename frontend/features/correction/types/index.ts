export interface CorrectionCreate {
  product_id: string;
  field_name: string;
  old_value: string;
  new_value: string;
}

export interface CorrectionResponse {
  id: string;
  product_id: string;
  field_name: string;
  old_value: string;
  new_value: string;
  photo_url?: string;
  status: string;
  created_at: string;
  updated_at?: string;
}
