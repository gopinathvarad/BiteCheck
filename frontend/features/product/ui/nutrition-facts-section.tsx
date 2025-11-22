import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { NutritionFacts } from "../../../entities/product/model/types";

interface NutritionFactsSectionProps {
  per100g?: NutritionFacts;
  perServing?: NutritionFacts;
}

export function NutritionFactsSection({
  per100g,
  perServing,
}: NutritionFactsSectionProps) {
  const [selectedView, setSelectedView] = useState<"100g" | "serving">("100g");

  const nutritionData = selectedView === "100g" ? per100g : perServing;
  const hasBoth = per100g && perServing;

  if (!nutritionData) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Nutrition Facts</Text>
        <Text style={styles.noDataText}>
          Nutrition information not available
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Nutrition Facts</Text>
        {hasBoth && (
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                selectedView === "100g" && styles.toggleButtonActive,
              ]}
              onPress={() => setSelectedView("100g")}
            >
              <Text
                style={[
                  styles.toggleText,
                  selectedView === "100g" && styles.toggleTextActive,
                ]}
              >
                Per 100g
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                selectedView === "serving" && styles.toggleButtonActive,
              ]}
              onPress={() => setSelectedView("serving")}
            >
              <Text
                style={[
                  styles.toggleText,
                  selectedView === "serving" && styles.toggleTextActive,
                ]}
              >
                Per Serving
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.table}>
        {nutritionData.energy_kcal !== undefined &&
          nutritionData.energy_kcal !== null && (
            <NutritionRow
              label="Calories"
              value={`${nutritionData.energy_kcal} kcal`}
              highlight
            />
          )}
        {nutritionData.energy_kj !== undefined &&
          nutritionData.energy_kj !== null && (
            <NutritionRow
              label="Energy"
              value={`${nutritionData.energy_kj} kJ`}
            />
          )}
        {nutritionData.fat !== undefined && (
          <NutritionRow label="Total Fat" value={`${nutritionData.fat}g`} />
        )}
        {nutritionData.saturated_fat !== undefined && (
          <NutritionRow
            label="Saturated Fat"
            value={`${nutritionData.saturated_fat}g`}
            indent
          />
        )}
        {nutritionData.carbohydrates !== undefined && (
          <NutritionRow
            label="Carbohydrates"
            value={`${nutritionData.carbohydrates}g`}
          />
        )}
        {nutritionData.sugars !== undefined && (
          <NutritionRow
            label="Sugars"
            value={`${nutritionData.sugars}g`}
            indent
          />
        )}
        {nutritionData.fiber !== undefined && (
          <NutritionRow
            label="Fiber"
            value={`${nutritionData.fiber}g`}
            indent
          />
        )}
        {nutritionData.proteins !== undefined && (
          <NutritionRow label="Protein" value={`${nutritionData.proteins}g`} />
        )}
        {nutritionData.salt !== undefined && (
          <NutritionRow label="Salt" value={`${nutritionData.salt}g`} />
        )}
        {nutritionData.sodium !== undefined && (
          <NutritionRow label="Sodium" value={`${nutritionData.sodium}mg`} />
        )}
      </View>
    </View>
  );
}

interface NutritionRowProps {
  label: string;
  value: string;
  highlight?: boolean;
  indent?: boolean;
}

function NutritionRow({ label, value, highlight, indent }: NutritionRowProps) {
  return (
    <View style={[styles.row, highlight && styles.highlightRow]}>
      <Text style={[styles.label, indent && styles.indentLabel]}>{label}</Text>
      <Text style={[styles.value, highlight && styles.highlightValue]}>
        {value}
      </Text>
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
  header: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 12,
  },
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 4,
    marginTop: 8,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: "center",
  },
  toggleButtonActive: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  toggleTextActive: {
    color: "#6B46C1",
    fontWeight: "600",
  },
  table: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  highlightRow: {
    backgroundColor: "#f9fafb",
    borderBottomWidth: 2,
    borderBottomColor: "#e0e0e0",
  },
  label: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  indentLabel: {
    paddingLeft: 20,
    fontSize: 14,
    color: "#666",
  },
  value: {
    fontSize: 16,
    color: "#1a1a1a",
    fontWeight: "600",
  },
  highlightValue: {
    fontSize: 18,
    fontWeight: "bold",
  },
  noDataText: {
    fontSize: 14,
    color: "#999",
    fontStyle: "italic",
  },
});
