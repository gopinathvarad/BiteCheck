import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Product } from "../../../entities/product/model/types";
import { colors, layout, typography, textVariants } from "../../../shared/ui";

interface IngredientsSectionProps {
  product: Product;
  warnings?: string[];
}

export function IngredientsSection({
  product,
  warnings,
}: IngredientsSectionProps) {
  // Check if an ingredient contains any allergen from warnings
  const containsAllergen = (ingredient: string): boolean => {
    if (!warnings || warnings.length === 0) return false;
    const ingredientLower = ingredient.toLowerCase();
    return warnings.some((allergen) =>
      ingredientLower.includes(allergen.toLowerCase())
    );
  };
  // Parse ingredients if not already parsed
  const getIngredients = () => {
    let ingList: string[] = [];

    // Try using the pre-parsed list if it looks good (more than 1 item)
    if (product.ingredients_parsed && product.ingredients_parsed.length > 1) {
      ingList = product.ingredients_parsed;
    }
    // Fallback to raw string parsing
    else if (product.ingredients_raw) {
      // Split by common delimiters: comma, bullet points, newlines
      ingList = product.ingredients_raw
        .split(/,|\n|•|·/)
        .map((i) => i.trim())
        .filter((i) => i.length > 0);
    }

    // Clean up ingredients: remove trailing periods, capitalize first letter
    return ingList.map((ing) => {
      let clean = ing.replace(/\.$/, "");
      return clean.charAt(0).toUpperCase() + clean.slice(1);
    });
  };

  const ingredients = getIngredients();

  if (ingredients.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Ingredients</Text>
        <Text style={styles.noDataText}>
          Ingredients information not available
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Ingredients</Text>
      <View style={styles.listContainer}>
        {ingredients.map((ingredient, index) => {
          const isAllergenMatch = containsAllergen(ingredient);
          return (
            <View
              key={index}
              style={[
                styles.listItem,
                isAllergenMatch && styles.listItemHighlight,
              ]}
            >
              <View
                style={[
                  styles.bulletPoint,
                  isAllergenMatch && styles.bulletPointHighlight,
                ]}
              />
              <Text
                style={[
                  styles.listItemText,
                  isAllergenMatch && styles.listItemTextHighlight,
                ]}
              >
                {ingredient}
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
    backgroundColor: colors.card,
    borderRadius: layout.borderRadius.l,
    padding: layout.spacing.l,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    ...textVariants.h3,
    marginBottom: layout.spacing.m,
    color: colors.text.primary,
  },
  listContainer: {
    gap: layout.spacing.s,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginTop: 8, // Align with the text effectively
    marginRight: 12,
    opacity: 0.7,
  },
  listItemHighlight: {
    backgroundColor: "#fee2e2",
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginLeft: -8,
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  bulletPointHighlight: {
    backgroundColor: "#dc2626",
    opacity: 1,
  },
  listItemText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: colors.text.primary,
    fontWeight: "400",
  },
  listItemTextHighlight: {
    color: "#dc2626",
    fontWeight: "600",
  },
  noDataText: {
    fontSize: 15,
    color: colors.text.tertiary,
    fontStyle: "italic",
  },
});
