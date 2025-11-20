// User entity types
export interface UserPreferences {
  allergies?: string[];
  diets?: string[];
  preferences?: Record<string, any>;
}

export interface User {
  id: string;
  email?: string;
  preferences?: UserPreferences;
  created_at?: string;
  updated_at?: string;
}

