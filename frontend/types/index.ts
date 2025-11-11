// Product types
export interface Product {
  id: string;
  barcode: string;
  name: string;
  brand?: string;
  category?: string;
  manufacturer?: string;
  country_of_sale?: string;
  ingredients_raw?: string;
  ingredients_parsed?: string[];
  nutrition?: {
    per_100g: NutritionFacts;
    per_serving: NutritionFacts;
  };
  allergens?: string[];
  images?: string[];
  health_score?: number;
  source?: string;
  created_at?: string;
  updated_at?: string;
}

export interface NutritionFacts {
  energy_kcal?: number;
  energy_kj?: number;
  fat?: number;
  saturated_fat?: number;
  carbohydrates?: number;
  sugars?: number;
  fiber?: number;
  proteins?: number;
  salt?: number;
  sodium?: number;
}

// User types
export interface UserPreferences {
  allergies?: string[];
  diets?: string[];
  preferences?: Record<string, any>;
}

// Scan types
export interface Scan {
  id: string;
  user_id?: string;
  product_id: string;
  scanned_at: string;
  result_snapshot?: Product;
}

// Correction types
export interface Correction {
  id: string;
  product_id: string;
  submitter_user_id: string;
  field_name: string;
  old_value: string;
  new_value: string;
  photo_url?: string;
  status: 'pending' | 'approved' | 'rejected';
  submitted_at: string;
  reviewed_at?: string;
}

