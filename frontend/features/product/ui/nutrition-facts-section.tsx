import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { NutritionFacts } from "../../../entities/product/model/types";
import { AppText, AppCard, colors, layout } from "../../../shared/ui";

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
      <AppCard>
        <AppText variant="h3" style={styles.sectionTitle}>
          Nutrition Facts
        </AppText>
        <AppText
          variant="body"
          color={colors.text.tertiary}
          style={{ fontStyle: "italic" }}
        >
          Nutrition information not available
        </AppText>
      </AppCard>
    );
  }

  return (
    <AppCard>
      <View style={styles.header}>
        <AppText variant="h3" style={styles.sectionTitle}>
          Nutrition Facts
        </AppText>
        {hasBoth && (
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                selectedView === "100g" && styles.toggleButtonActive,
              ]}
              onPress={() => setSelectedView("100g")}
            >
              <AppText
                variant="caption"
                style={[
                  selectedView === "100g"
                    ? styles.toggleTextActive
                    : styles.toggleText,
                ]}
              >
                Per 100g
              </AppText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                selectedView === "serving" && styles.toggleButtonActive,
              ]}
              onPress={() => setSelectedView("serving")}
            >
              <AppText
                variant="caption"
                style={[
                  selectedView === "serving"
                    ? styles.toggleTextActive
                    : styles.toggleText,
                ]}
              >
                Per Serving
              </AppText>
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
    </AppCard>
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
      <AppText
        variant={indent ? "caption" : "body"}
        style={[styles.label, indent && styles.indentLabel]}
      >
        {label}
      </AppText>
      <AppText
        variant={highlight ? "h3" : "body"}
        weight={highlight ? "bold" : "regular"}
      >
        {value}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: layout.spacing.m,
  },
  sectionTitle: {
    marginBottom: layout.spacing.s,
  },
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: colors.background,
    borderRadius: layout.borderRadius.m,
    padding: 4,
    marginTop: layout.spacing.s,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: layout.spacing.s,
    paddingHorizontal: layout.spacing.m,
    borderRadius: layout.borderRadius.s,
    alignItems: "center",
  },
  toggleButtonActive: {
    backgroundColor: colors.card,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleText: {
    color: colors.text.secondary,
  },
  toggleTextActive: {
    color: colors.primary,
    fontWeight: "bold",
  },
  table: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: layout.borderRadius.m,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: layout.spacing.m,
    paddingHorizontal: layout.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  highlightRow: {
    backgroundColor: colors.background,
    borderBottomWidth: 2,
  },
  label: {
    flex: 1,
  },
  indentLabel: {
    paddingLeft: layout.spacing.l,
    color: colors.text.secondary,
  },
});
