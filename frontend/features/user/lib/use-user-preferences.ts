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
  customAllergies: string[];
  customDiets: string[];
  hasUnsavedChanges: boolean;
  toggleAllergy: (allergy: string) => void;
  toggleDiet: (diet: string) => void;
  addCustomAllergy: (allergy: string) => boolean;
  addCustomDiet: (diet: string) => boolean;
  removeCustomAllergy: (allergy: string) => void;
  removeCustomDiet: (diet: string) => void;
  clearAllAllergies: () => void;
  clearAllDiets: () => void;
  savePreferences: () => Promise<boolean>;
  refetch: () => Promise<void>;
  resetChanges: () => void;
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

  // Track original values for change detection
  const [originalAllergies, setOriginalAllergies] = useState<string[]>([]);
  const [originalDiets, setOriginalDiets] = useState<string[]>([]);

  // Compute custom items (items not in the predefined lists)
  const customAllergies = allergies.filter(
    (a) => !COMMON_ALLERGENS.some((ca) => ca.toLowerCase() === a.toLowerCase())
  );
  const customDiets = diets.filter(
    (d) => !COMMON_DIETS.some((cd) => cd.toLowerCase() === d.toLowerCase())
  );

  // Check if there are unsaved changes
  const hasUnsavedChanges =
    JSON.stringify([...allergies].sort()) !==
      JSON.stringify([...originalAllergies].sort()) ||
    JSON.stringify([...diets].sort()) !==
      JSON.stringify([...originalDiets].sort());

  // Fetch user profile on mount or when auth changes
  const fetchProfile = useCallback(async () => {
    if (!user || !session) {
      setProfile(null);
      setAllergies([]);
      setDiets([]);
      setOriginalAllergies([]);
      setOriginalDiets([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await getUserProfile();

      if (response.success && response.data) {
        setProfile(response.data);
        const loadedAllergies = response.data.allergies || [];
        const loadedDiets = response.data.diets || [];
        setAllergies(loadedAllergies);
        setDiets(loadedDiets);
        setOriginalAllergies(loadedAllergies);
        setOriginalDiets(loadedDiets);
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

  // Add a custom allergy (returns false if duplicate)
  const addCustomAllergy = useCallback(
    (allergy: string): boolean => {
      const normalized = allergy.trim();
      if (!normalized) return false;

      const exists = allergies.some(
        (a) => a.toLowerCase() === normalized.toLowerCase()
      );
      if (exists) return false;

      setAllergies((prev) => [...prev, normalized]);
      return true;
    },
    [allergies]
  );

  // Add a custom diet (returns false if duplicate)
  const addCustomDiet = useCallback(
    (diet: string): boolean => {
      const normalized = diet.trim();
      if (!normalized) return false;

      const exists = diets.some(
        (d) => d.toLowerCase() === normalized.toLowerCase()
      );
      if (exists) return false;

      setDiets((prev) => [...prev, normalized]);
      return true;
    },
    [diets]
  );

  // Remove a custom allergy
  const removeCustomAllergy = useCallback((allergy: string) => {
    setAllergies((prev) =>
      prev.filter((a) => a.toLowerCase() !== allergy.toLowerCase())
    );
  }, []);

  // Remove a custom diet
  const removeCustomDiet = useCallback((diet: string) => {
    setDiets((prev) =>
      prev.filter((d) => d.toLowerCase() !== diet.toLowerCase())
    );
  }, []);

  // Clear all allergies
  const clearAllAllergies = useCallback(() => {
    setAllergies([]);
  }, []);

  // Clear all diets
  const clearAllDiets = useCallback(() => {
    setDiets([]);
  }, []);

  // Reset to original values (discard changes)
  const resetChanges = useCallback(() => {
    setAllergies(originalAllergies);
    setDiets(originalDiets);
  }, [originalAllergies, originalDiets]);

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
        // Update original values to match saved values
        setOriginalAllergies(allergies);
        setOriginalDiets(diets);
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
    customAllergies,
    customDiets,
    hasUnsavedChanges,
    toggleAllergy,
    toggleDiet,
    addCustomAllergy,
    addCustomDiet,
    removeCustomAllergy,
    removeCustomDiet,
    clearAllAllergies,
    clearAllDiets,
    savePreferences,
    refetch: fetchProfile,
    resetChanges,
  };
}
