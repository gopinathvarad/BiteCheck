import apiClient from "../../../shared/api/client";
import { UserPreferences } from "../../../entities/user/model/types";

export interface UserProfile {
  id: string;
  email?: string;
  user_metadata?: Record<string, any>;
  allergies?: string[];
  diets?: string[];
  preferences?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface UserProfileResponse {
  success: boolean;
  data: UserProfile;
  message?: string;
  timestamp?: string;
}

export interface UpdatePreferencesRequest {
  allergies?: string[];
  diets?: string[];
  preferences?: Record<string, any>;
}

/**
 * Fetch current user profile and preferences
 */
export async function getUserProfile(): Promise<UserProfileResponse> {
  const response = await apiClient.get<UserProfileResponse>("/user/me");
  return response.data;
}

/**
 * Update user preferences (allergies, diets, etc.)
 * Creates users_meta record if it doesn't exist.
 */
export async function updateUserPreferences(
  request: UpdatePreferencesRequest
): Promise<UserProfileResponse> {
  const response = await apiClient.post<UserProfileResponse>(
    "/user/preferences",
    request
  );
  return response.data;
}
