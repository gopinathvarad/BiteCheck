import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  BackHandler,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import {
  AppText,
  ScreenWrapper,
  AppCard,
  PreferencesSection,
  colors,
  layout,
} from "../../shared/ui";
import { useAuth } from "../../features/auth/__init__";
import {
  useUserPreferences,
  COMMON_ALLERGENS,
  COMMON_DIETS,
} from "../../features/user/index";

export default function ProfileScreen() {
  const { user, signOut, loading: authLoading } = useAuth();
  const {
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
    resetChanges,
  } = useUserPreferences();

  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  // Handle back button with unsaved changes warning
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (hasUnsavedChanges) {
          showDiscardAlert();
          return true;
        }
        return false;
      };

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      );

      return () => subscription.remove();
    }, [hasUnsavedChanges])
  );

  // Show discard changes alert
  const showDiscardAlert = () => {
    Alert.alert(
      "Unsaved Changes",
      "You have unsaved changes. What would you like to do?",
      [
        {
          text: "Discard",
          style: "destructive",
          onPress: resetChanges,
        },
        {
          text: "Save",
          onPress: handleSave,
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ]
    );
  };

  // Handle save with success animation
  const handleSave = async () => {
    const success = await savePreferences();
    if (success) {
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 2000);
    } else {
      Alert.alert("Error", error || "Failed to save preferences");
    }
  };

  // Handle sign out with unsaved changes check
  const handleSignOut = async () => {
    if (hasUnsavedChanges) {
      Alert.alert(
        "Unsaved Changes",
        "You have unsaved changes that will be lost. Sign out anyway?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Sign Out",
            style: "destructive",
            onPress: performSignOut,
          },
        ]
      );
    } else {
      showSignOutConfirmation();
    }
  };

  const showSignOutConfirmation = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: performSignOut,
      },
    ]);
  };

  const performSignOut = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error("Error signing out:", err);
    }
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
        <AppCard style={styles.userSection}>
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
        <PreferencesSection
          title="Allergies"
          description="Select any allergens you need to avoid. Products containing these will be highlighted."
          icon="warning"
          iconColor="#ef4444"
          variant="allergen"
          items={COMMON_ALLERGENS}
          selectedItems={allergies}
          customItems={customAllergies}
          onToggleItem={toggleAllergy}
          onAddCustom={addCustomAllergy}
          onRemoveCustom={removeCustomAllergy}
          onClearAll={clearAllAllergies}
          customInputPlaceholder="Add custom allergen..."
        />

        {/* Diets Section */}
        <PreferencesSection
          title="Diets"
          description="Select your dietary preferences to help filter and personalize product recommendations."
          icon="leaf"
          iconColor="#22c55e"
          variant="diet"
          items={COMMON_DIETS}
          selectedItems={diets}
          customItems={customDiets}
          onToggleItem={toggleDiet}
          onAddCustom={addCustomDiet}
          onRemoveCustom={removeCustomDiet}
          onClearAll={clearAllDiets}
          customInputPlaceholder="Add custom diet..."
        />

        {/* Save Button - Always visible when there are changes */}
        {hasUnsavedChanges && (
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

        {/* Success Message */}
        {showSaveSuccess && (
          <View style={styles.successContainer}>
            <Ionicons name="checkmark-circle" size={20} color="#16a34a" />
            <AppText variant="body" style={styles.successText}>
              Preferences saved successfully!
            </AppText>
          </View>
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

        {/* Discard Changes Button */}
        {hasUnsavedChanges && (
          <TouchableOpacity
            style={styles.discardButton}
            onPress={showDiscardAlert}
            activeOpacity={0.7}
          >
            <Ionicons
              name="refresh-outline"
              size={20}
              color={colors.text.secondary}
              style={styles.buttonIcon}
            />
            <AppText variant="button" style={styles.discardButtonText}>
              Discard Changes
            </AppText>
          </TouchableOpacity>
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
  },
  userSection: {
    padding: layout.spacing.l,
    marginBottom: layout.spacing.m,
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
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: layout.borderRadius.m,
    gap: layout.spacing.s,
    marginBottom: layout.spacing.m,
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
  successContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: layout.spacing.s,
    padding: layout.spacing.m,
    backgroundColor: "#f0fdf4",
    borderRadius: layout.borderRadius.m,
    marginBottom: layout.spacing.m,
  },
  successText: {
    color: "#16a34a",
    fontWeight: "500",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: layout.spacing.s,
    padding: layout.spacing.m,
    backgroundColor: "#fef2f2",
    borderRadius: layout.borderRadius.m,
    marginBottom: layout.spacing.m,
  },
  errorText: {
    color: "#dc2626",
    flex: 1,
  },
  discardButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: layout.borderRadius.m,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    marginBottom: layout.spacing.m,
  },
  discardButtonText: {
    color: colors.text.secondary,
    fontWeight: "500",
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
  },
  signOutText: {
    color: "#dc2626",
    fontWeight: "600",
  },
  bottomSpacer: {
    height: 40,
  },
});
