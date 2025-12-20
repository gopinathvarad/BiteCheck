// User feature exports
export { getUserProfile, updateUserPreferences } from "./api/user-api";
export type {
  UserProfile,
  UserProfileResponse,
  UpdatePreferencesRequest,
} from "./api/user-api";
export {
  useUserPreferences,
  COMMON_ALLERGENS,
  COMMON_DIETS,
} from "./lib/use-user-preferences";
