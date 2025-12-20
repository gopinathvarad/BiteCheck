import React, { useState } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  AppText,
  ScreenWrapper,
  AppCard,
  colors,
  layout,
} from "../../shared/ui";
import { useAuth } from "../../features/auth/__init__";
import {
  useUserPreferences,
  COMMON_ALLERGENS,
  COMMON_DIETS,
} from "../../features/user/index";

// Chip component for allergen/diet selection
function SelectionChip({
  label,
  selected,
  onPress,
  variant = "default",
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  variant?: "default" | "allergen" | "diet";
}) {
  const getColors = () => {
    if (!selected) {
      return {
        bg: colors.card,
        border: colors.border,
        text: colors.text.secondary,
      };
    }
    switch (variant) {
      case "allergen":
        return { bg: "#fef2f2", border: "#ef4444", text: "#dc2626" };
      case "diet":
        return { bg: "#f0fdf4", border: "#22c55e", text: "#16a34a" };
      default:
        return {
          bg: colors.primaryLight,
          border: colors.primary,
          text: colors.primary,
        };
    }
  };

  const chipColors = getColors();

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: chipColors.bg,
          borderColor: chipColors.border,
        },
      ]}
      activeOpacity={0.7}
    >
      {selected && (
        <Ionicons
          name="checkmark-circle"
          size={16}
          color={chipColors.text}
          style={styles.chipIcon}
        />
      )}
      <AppText
        variant="caption"
        style={[styles.chipText, { color: chipColors.text }]}
      >
        {label}
      </AppText>
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const { user, signOut, loading: authLoading } = useAuth();
  const {
    profile,
    loading,
    saving,
    error,
    allergies,
    diets,
    toggleAllergy,
    toggleDiet,
    savePreferences,
  } = useUserPreferences();

  const [hasChanges, setHasChanges] = useState(false);

  // Check if an allergy is selected (case-insensitive)
  const isAllergySelected = (allergy: string) =>
    allergies.some((a) => a.toLowerCase() === allergy.toLowerCase());

  // Check if a diet is selected (case-insensitive)
  const isDietSelected = (diet: string) =>
    diets.some((d) => d.toLowerCase() === diet.toLowerCase());

  // Handle allergy toggle
  const handleAllergyToggle = (allergy: string) => {
    toggleAllergy(allergy);
    setHasChanges(true);
  };

  // Handle diet toggle
  const handleDietToggle = (diet: string) => {
    toggleDiet(diet);
    setHasChanges(true);
  };

  // Handle save
  const handleSave = async () => {
    const success = await savePreferences();
    if (success) {
      setHasChanges(false);
      Alert.alert("Success", "Your preferences have been saved!");
    } else {
      Alert.alert("Error", error || "Failed to save preferences");
    }
  };

  // Handle sign out
  const handleSignOut = async () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          try {
            await signOut();
          } catch (err) {
            console.error("Error signing out:", err);
          }
        },
      },
    ]);
  };

  // If not authenticated, show sign in prompt
  if (!user) {
    return (
      <ScreenWrapper bg={colors.background} style={styles.centerContainer}>
        <Ionicons
          name="person-circle-outline"
          size={80}
          color={colors.text.tertiary}
        />
        <AppText variant="h2" style={styles.emptyTitle}>
          Profile
        </AppText>
        <AppText
          variant="body"
          color={colors.text.secondary}
          style={styles.emptySubtitle}
        >
          Sign in to save your allergies and diet preferences
        </AppText>
      </ScreenWrapper>
    );
  }

  // Loading state
  if (loading || authLoading) {
    return (
      <ScreenWrapper bg={colors.background} style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <AppText variant="body" style={styles.loadingText}>
          Loading profile...
        </AppText>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper bg={colors.background}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* User Info Section */}
        <AppCard style={styles.section}>
          <View style={styles.userHeader}>
            <View style={styles.avatarContainer}>
              <Ionicons name="person" size={32} color={colors.primary} />
            </View>
            <View style={styles.userInfo}>
              <AppText variant="h3">{profile?.email || user.email}</AppText>
              <AppText variant="caption" color={colors.text.secondary}>
                Signed in
              </AppText>
            </View>
          </View>
        </AppCard>

        {/* Allergies Section */}
        <AppCard style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="warning" size={20} color="#ef4444" />
            <AppText variant="h3" style={styles.sectionTitle}>
              Allergies
            </AppText>
          </View>
          <AppText
            variant="caption"
            color={colors.text.secondary}
            style={styles.sectionDescription}
          >
            Select any allergens you need to avoid. Products containing these
            will be highlighted.
          </AppText>
          <View style={styles.chipsContainer}>
            {COMMON_ALLERGENS.map((allergen) => (
              <SelectionChip
                key={allergen}
                label={allergen}
                selected={isAllergySelected(allergen)}
                onPress={() => handleAllergyToggle(allergen)}
                variant="allergen"
              />
            ))}
          </View>
          {allergies.length > 0 && (
            <AppText
              variant="caption"
              color={colors.text.tertiary}
              style={styles.selectedCount}
            >
              {allergies.length} allergen{allergies.length !== 1 ? "s" : ""}{" "}
              selected
            </AppText>
          )}
        </AppCard>

        {/* Diets Section */}
        <AppCard style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="leaf" size={20} color="#22c55e" />
            <AppText variant="h3" style={styles.sectionTitle}>
              Diet Preferences
            </AppText>
          </View>
          <AppText
            variant="caption"
            color={colors.text.secondary}
            style={styles.sectionDescription}
          >
            Select your dietary preferences to help filter products.
          </AppText>
          <View style={styles.chipsContainer}>
            {COMMON_DIETS.map((diet) => (
              <SelectionChip
                key={diet}
                label={diet}
                selected={isDietSelected(diet)}
                onPress={() => handleDietToggle(diet)}
                variant="diet"
              />
            ))}
          </View>
          {diets.length > 0 && (
            <AppText
              variant="caption"
              color={colors.text.tertiary}
              style={styles.selectedCount}
            >
              {diets.length} diet{diets.length !== 1 ? "s" : ""} selected
            </AppText>
          )}
        </AppCard>

        {/* Save Button */}
        {hasChanges && (
          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.8}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons
                  name="save"
                  size={20}
                  color="#fff"
                  style={styles.buttonIcon}
                />
                <AppText variant="button" style={styles.saveButtonText}>
                  Save Preferences
                </AppText>
              </>
            )}
          </TouchableOpacity>
        )}

        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={16} color="#dc2626" />
            <AppText variant="caption" style={styles.errorText}>
              {error}
            </AppText>
          </View>
        )}

        {/* Sign Out Button */}
        <TouchableOpacity
          style={styles.signOutButton}
          onPress={handleSignOut}
          activeOpacity={0.7}
        >
          <Ionicons
            name="log-out-outline"
            size={20}
            color="#dc2626"
            style={styles.buttonIcon}
          />
          <AppText variant="button" style={styles.signOutText}>
            Sign Out
          </AppText>
        </TouchableOpacity>

        {/* Bottom spacing */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    justifyContent: "center",
    alignItems: "center",
    gap: layout.spacing.m,
    padding: layout.spacing.xl,
  },
  emptyTitle: {
    marginTop: layout.spacing.m,
  },
  emptySubtitle: {
    textAlign: "center",
  },
  loadingText: {
    marginTop: layout.spacing.m,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: layout.spacing.m,
    gap: layout.spacing.m,
  },
  section: {
    padding: layout.spacing.l,
  },
  userHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: layout.spacing.m,
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
  userInfo: {
    flex: 1,
    gap: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: layout.spacing.s,
    marginBottom: layout.spacing.xs,
  },
  sectionTitle: {
    flex: 1,
  },
  sectionDescription: {
    marginBottom: layout.spacing.m,
    lineHeight: 18,
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: layout.spacing.s,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  chipIcon: {
    marginRight: 4,
  },
  chipText: {
    fontWeight: "500",
  },
  selectedCount: {
    marginTop: layout.spacing.m,
    fontStyle: "italic",
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: layout.borderRadius.m,
    gap: layout.spacing.s,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  buttonIcon: {
    marginRight: 4,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: layout.spacing.s,
    padding: layout.spacing.m,
    backgroundColor: "#fef2f2",
    borderRadius: layout.borderRadius.m,
  },
  errorText: {
    color: "#dc2626",
    flex: 1,
  },
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: layout.borderRadius.m,
    borderWidth: 1.5,
    borderColor: "#dc2626",
    backgroundColor: "#fef2f2",
    marginTop: layout.spacing.m,
  },
  signOutText: {
    color: "#dc2626",
    fontWeight: "600",
  },
  bottomSpacer: {
    height: 40,
  },
});
