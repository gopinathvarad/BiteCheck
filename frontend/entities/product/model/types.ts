// Product entity types
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

