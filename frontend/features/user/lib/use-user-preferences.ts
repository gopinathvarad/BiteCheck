import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../auth/__init__";
import {
  getUserProfile,
  updateUserPreferences,
  UserProfile,
} from "../api/user-api";

interface UseUserPreferencesResult {
  profile: UserProfile | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  allergies: string[];
  diets: string[];
  toggleAllergy: (allergy: string) => void;
  toggleDiet: (diet: string) => void;
  savePreferences: () => Promise<boolean>;
  refetch: () => Promise<void>;
}

// Common allergens (aligned with Open Food Facts categories)
export const COMMON_ALLERGENS = [
  "Milk",
  "Eggs",
  "Peanuts",
  "Tree nuts",
  "Fish",
  "Shellfish",
  "Wheat",
  "Soy",
  "Sesame",
  "Gluten",
  "Mustard",
  "Celery",
  "Lupin",
  "Molluscs",
  "Sulphites",
];

// Common diet types
export const COMMON_DIETS = [
  "Vegetarian",
  "Vegan",
  "Gluten-free",
  "Dairy-free",
  "Keto",
  "Paleo",
  "Halal",
  "Kosher",
  "Low-sodium",
  "Low-sugar",
];

export function useUserPreferences(): UseUserPreferencesResult {
  const { user, session } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Local state for allergies and diets (for UI updates before save)
  const [allergies, setAllergies] = useState<string[]>([]);
  const [diets, setDiets] = useState<string[]>([]);

  // Fetch user profile on mount or when auth changes
  const fetchProfile = useCallback(async () => {
    if (!user || !session) {
      setProfile(null);
      setAllergies([]);
      setDiets([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await getUserProfile();

      if (response.success && response.data) {
        setProfile(response.data);
        setAllergies(response.data.allergies || []);
        setDiets(response.data.diets || []);
      }
    } catch (err: any) {
      console.error("Error fetching user profile:", err);
      // Don't show error for 404 - it just means no preferences saved yet
      if (err.response?.status !== 404) {
        setError(err.message || "Failed to load profile");
      }
    } finally {
      setLoading(false);
    }
  }, [user, session]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Toggle an allergy in/out of the list
  const toggleAllergy = useCallback((allergy: string) => {
    setAllergies((prev) => {
      const normalized = allergy.toLowerCase();
      const exists = prev.some((a) => a.toLowerCase() === normalized);
      if (exists) {
        return prev.filter((a) => a.toLowerCase() !== normalized);
      } else {
        return [...prev, allergy];
      }
    });
  }, []);

  // Toggle a diet in/out of the list
  const toggleDiet = useCallback((diet: string) => {
    setDiets((prev) => {
      const normalized = diet.toLowerCase();
      const exists = prev.some((d) => d.toLowerCase() === normalized);
      if (exists) {
        return prev.filter((d) => d.toLowerCase() !== normalized);
      } else {
        return [...prev, diet];
      }
    });
  }, []);

  // Save preferences to server
  const savePreferences = useCallback(async (): Promise<boolean> => {
    if (!user || !session) {
      setError("Please sign in to save preferences");
      return false;
    }

    try {
      setSaving(true);
      setError(null);

      const response = await updateUserPreferences({
        allergies: allergies.map((a) => a.toLowerCase()),
        diets: diets.map((d) => d.toLowerCase()),
      });

      if (response.success && response.data) {
        setProfile(response.data);
        return true;
      }
      return false;
    } catch (err: any) {
      console.error("Error saving preferences:", err);
      setError(err.message || "Failed to save preferences");
      return false;
    } finally {
      setSaving(false);
    }
  }, [user, session, allergies, diets]);

  return {
    profile,
    loading,
    saving,
    error,
    allergies,
    diets,
    toggleAllergy,
    toggleDiet,
    savePreferences,
    refetch: fetchProfile,
  };
}
