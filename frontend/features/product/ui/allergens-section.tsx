import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface AllergensSectionProps {
  allergens?: string[];
  warnings?: string[];
}

export function AllergensSection({
  allergens,
  warnings,
}: AllergensSectionProps) {
  if (!allergens || allergens.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Allergens</Text>
        <View style={styles.noAllergensContainer}>
          <Ionicons name="checkmark-circle" size={24} color="#10b981" />
          <Text style={styles.noAllergensText}>No allergens listed</Text>
        </View>
      </View>
    );
  }

  const hasWarnings = warnings && warnings.length > 0;

  return (
    <View style={styles.container}>
      {hasWarnings && (
        <View style={styles.warningBanner}>
          <Ionicons name="warning" size={24} color="#fff" />
          <View style={styles.warningTextContainer}>
            <Text style={styles.warningTitle}>⚠️ Allergen Warning</Text>
            <Text style={styles.warningMessage}>
              This product contains allergens you're allergic to
            </Text>
          </View>
        </View>
      )}

      <View style={styles.header}>
        <Ionicons name="warning" size={24} color="#ef4444" />
        <Text style={styles.sectionTitle}>Allergens</Text>
      </View>
      <View style={styles.allergensContainer}>
        {allergens.map((allergen, index) => {
          const isWarning = warnings?.some(
            (w) => w.toLowerCase() === allergen.toLowerCase()
          );
          return (
            <View
              key={index}
              style={[
                styles.allergenTag,
                isWarning && styles.allergenTagWarning,
              ]}
            >
              <Ionicons
                name={isWarning ? "alert" : "alert-circle"}
                size={16}
                color={isWarning ? "#dc2626" : "#ef4444"}
              />
              <Text
                style={[
                  styles.allergenText,
                  isWarning && styles.allergenTextWarning,
                ]}
              >
                {allergen}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    padding: 20,
    marginTop: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#f0f0f0",
  },
  warningBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#dc2626",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    gap: 12,
  },
  warningTextContainer: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  warningMessage: {
    fontSize: 14,
    color: "#fff",
    opacity: 0.95,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginLeft: 8,
  },
  allergensContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  allergenTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  allergenTagWarning: {
    backgroundColor: "#fee2e2",
    borderColor: "#dc2626",
    borderWidth: 2,
  },
  allergenText: {
    fontSize: 14,
    color: "#dc2626",
    fontWeight: "600",
  },
  allergenTextWarning: {
    fontWeight: "700",
  },
  noAllergensContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  noAllergensText: {
    fontSize: 14,
    color: "#10b981",
    fontWeight: "500",
  },
});
