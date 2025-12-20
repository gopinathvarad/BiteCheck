import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppText, AppCard, colors, layout } from "../../../shared/ui";

interface HealthScoreIndicatorProps {
  score?: number;
  grade?: "A" | "B" | "C" | "D" | "E";
}

// Nutri-Score grade colors (official colors)
const GRADE_COLORS = {
  A: "#038141",
  B: "#85BB2F",
  C: "#FECB02",
  D: "#EE8100",
  E: "#E63E11",
};

// Lighter versions for backgrounds
const GRADE_COLORS_LIGHT = {
  A: "#038141" + "20",
  B: "#85BB2F" + "20",
  C: "#FECB02" + "20",
  D: "#EE8100" + "20",
  E: "#E63E11" + "20",
};

// Grade descriptions
const GRADE_DESCRIPTIONS = {
  A: "Excellent nutritional quality",
  B: "Good nutritional quality",
  C: "Moderate nutritional quality",
  D: "Poor nutritional quality",
  E: "Very poor nutritional quality",
};

// What each grade means
const GRADE_EXPLANATIONS = {
  A: "This product has favorable nutritional characteristics. It's lower in calories, saturated fats, sugars, and salt while containing beneficial nutrients.",
  B: "This product has good overall nutritional balance with some positive and some less favorable elements.",
  C: "This product has an average nutritional profile. Consider portion sizes and frequency of consumption.",
  D: "This product has some unfavorable nutritional characteristics. Limited consumption is recommended.",
  E: "This product has unfavorable nutritional characteristics. It may be high in calories, saturated fats, sugars, or salt.",
};

const ALL_GRADES: Array<"A" | "B" | "C" | "D" | "E"> = [
  "A",
  "B",
  "C",
  "D",
  "E",
];

export function HealthScoreIndicator({
  score,
  grade,
}: HealthScoreIndicatorProps) {
  const [showDetails, setShowDetails] = useState(false);

  // Derive grade from score if not provided
  const displayGrade = grade || deriveGradeFromScore(score);

  if (!displayGrade && score === undefined) {
    return (
      <AppCard>
        <View style={styles.header}>
          <Ionicons
            name="nutrition-outline"
            size={24}
            color={colors.text.tertiary}
          />
          <AppText variant="h3" style={styles.title}>
            Nutri-Score
          </AppText>
        </View>
        <AppText
          variant="body"
          color={colors.text.tertiary}
          style={{ fontStyle: "italic" }}
        >
          Nutritional score not available for this product
        </AppText>
      </AppCard>
    );
  }

  const currentGrade = displayGrade || "C";
  const gradeColor = GRADE_COLORS[currentGrade];
  const gradeDescription = GRADE_DESCRIPTIONS[currentGrade];
  const gradeExplanation = GRADE_EXPLANATIONS[currentGrade];

  return (
    <AppCard>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View
            style={[styles.nutriScoreLogo, { backgroundColor: gradeColor }]}
          >
            <AppText
              variant="caption"
              weight="bold"
              style={{ color: "#FFFFFF", fontSize: 8 }}
            >
              NUTRI
            </AppText>
            <AppText
              variant="caption"
              weight="bold"
              style={{ color: "#FFFFFF", fontSize: 8 }}
            >
              SCORE
            </AppText>
          </View>
          <View style={styles.headerText}>
            <AppText variant="h3">Nutri-Score</AppText>
            <AppText variant="caption" color={colors.text.tertiary}>
              European nutritional rating
            </AppText>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => setShowDetails(!showDetails)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name={showDetails ? "chevron-up" : "information-circle-outline"}
            size={24}
            color={colors.text.tertiary}
          />
        </TouchableOpacity>
      </View>

      {/* Grade Display */}
      <View style={styles.gradeContainer}>
        {ALL_GRADES.map((g) => {
          const isActive = g === currentGrade;
          const gradeColr = GRADE_COLORS[g];

          return (
            <View
              key={g}
              style={[
                styles.gradeBadge,
                {
                  backgroundColor: isActive ? gradeColr : gradeColr + "30",
                  transform: isActive ? [{ scale: 1.2 }] : [{ scale: 1 }],
                  shadowColor: isActive ? gradeColr : "transparent",
                  shadowOffset: { width: 0, height: isActive ? 4 : 0 },
                  shadowOpacity: isActive ? 0.4 : 0,
                  shadowRadius: isActive ? 8 : 0,
                  elevation: isActive ? 8 : 0,
                  zIndex: isActive ? 10 : 1,
                },
              ]}
            >
              <AppText
                variant="h2"
                weight="bold"
                style={{
                  color: isActive ? "#FFFFFF" : gradeColr,
                  fontSize: isActive ? 28 : 20,
                }}
              >
                {g}
              </AppText>
            </View>
          );
        })}
      </View>

      {/* Grade Label */}
      <View
        style={[
          styles.labelBadge,
          { backgroundColor: GRADE_COLORS_LIGHT[currentGrade] },
        ]}
      >
        <AppText variant="body" weight="semibold" style={{ color: gradeColor }}>
          {gradeDescription}
        </AppText>
      </View>

      {/* Expanded Details */}
      {showDetails && (
        <View style={styles.detailsContainer}>
          {/* What is Nutri-Score */}
          <View style={styles.detailSection}>
            <View style={styles.detailHeader}>
              <Ionicons name="help-circle" size={18} color={colors.primary} />
              <AppText
                variant="body"
                weight="semibold"
                style={styles.detailTitle}
              >
                What is Nutri-Score?
              </AppText>
            </View>
            <AppText
              variant="caption"
              color={colors.text.secondary}
              style={styles.detailText}
            >
              Nutri-Score is a nutrition label that rates products from A (best)
              to E (worst) based on their nutritional quality per 100g. It
              considers calories, sugar, saturated fat, and sodium (negative) vs
              fiber, protein, fruits, vegetables, and nuts (positive).
            </AppText>
          </View>

          {/* What this grade means */}
          <View style={styles.detailSection}>
            <View style={styles.detailHeader}>
              <View
                style={[
                  styles.smallGradeBadge,
                  { backgroundColor: gradeColor },
                ]}
              >
                <AppText
                  variant="caption"
                  weight="bold"
                  style={{ color: "#FFFFFF" }}
                >
                  {currentGrade}
                </AppText>
              </View>
              <AppText
                variant="body"
                weight="semibold"
                style={styles.detailTitle}
              >
                What Grade {currentGrade} means
              </AppText>
            </View>
            <AppText
              variant="caption"
              color={colors.text.secondary}
              style={styles.detailText}
            >
              {gradeExplanation}
            </AppText>
          </View>

          {/* Grade Scale Legend */}
          <View style={styles.legendContainer}>
            <AppText
              variant="caption"
              weight="semibold"
              color={colors.text.secondary}
              style={styles.legendTitle}
            >
              Nutri-Score Scale
            </AppText>
            <View style={styles.legendItems}>
              {ALL_GRADES.map((g) => (
                <View key={g} style={styles.legendItem}>
                  <View
                    style={[
                      styles.legendDot,
                      { backgroundColor: GRADE_COLORS[g] },
                    ]}
                  />
                  <AppText variant="caption" color={colors.text.tertiary}>
                    {g}:{" "}
                    {g === "A"
                      ? "Best"
                      : g === "E"
                      ? "Worst"
                      : g === "C"
                      ? "Average"
                      : ""}
                  </AppText>
                </View>
              ))}
            </View>
          </View>

          {/* Disclaimer */}
          <View style={styles.disclaimer}>
            <Ionicons
              name="information-circle"
              size={14}
              color={colors.text.tertiary}
            />
            <AppText
              variant="caption"
              color={colors.text.tertiary}
              style={{ flex: 1, marginLeft: 6 }}
            >
              Nutri-Score helps compare products within the same category.
              Consider your dietary needs when making choices.
            </AppText>
          </View>
        </View>
      )}

      {/* Numeric Score (if available) */}
      {score !== undefined && (
        <View style={styles.numericScore}>
          <AppText variant="caption" color={colors.text.tertiary}>
            Nutritional score: {score > 0 ? "+" : ""}
            {score.toFixed(0)} points
          </AppText>
        </View>
      )}
    </AppCard>
  );
}

// Helper function to derive grade from numeric score
function deriveGradeFromScore(
  score?: number
): "A" | "B" | "C" | "D" | "E" | undefined {
  if (score === undefined) return undefined;

  // Nutri-Score ranges (per 100g for food):
  // A: -15 to -1
  // B: 0 to 2
  // C: 3 to 10
  // D: 11 to 18
  // E: 19 to 40
  if (score <= -1) return "A";
  if (score <= 2) return "B";
  if (score <= 10) return "C";
  if (score <= 18) return "D";
  return "E";
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: layout.spacing.l,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  nutriScoreLogo: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: layout.spacing.m,
  },
  headerText: {
    gap: 2,
  },
  title: {
    marginLeft: layout.spacing.s,
  },
  gradeContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: layout.spacing.s,
    marginBottom: layout.spacing.l,
    paddingVertical: layout.spacing.m,
  },
  gradeBadge: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  labelBadge: {
    alignSelf: "center",
    paddingHorizontal: layout.spacing.l,
    paddingVertical: layout.spacing.s,
    borderRadius: layout.borderRadius.l,
    marginBottom: layout.spacing.m,
  },
  detailsContainer: {
    backgroundColor: colors.background,
    borderRadius: layout.borderRadius.m,
    padding: layout.spacing.m,
    marginTop: layout.spacing.m,
    gap: layout.spacing.m,
  },
  detailSection: {
    gap: layout.spacing.xs,
  },
  detailHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: layout.spacing.s,
  },
  detailTitle: {
    marginLeft: 4,
  },
  detailText: {
    lineHeight: 18,
    marginLeft: 26,
  },
  smallGradeBadge: {
    width: 22,
    height: 22,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  legendContainer: {
    paddingTop: layout.spacing.s,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  legendTitle: {
    marginBottom: layout.spacing.s,
  },
  legendItems: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: layout.spacing.m,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 3,
  },
  disclaimer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: colors.text.tertiary + "10",
    padding: layout.spacing.s,
    borderRadius: layout.borderRadius.s,
  },
  numericScore: {
    alignItems: "center",
    marginTop: layout.spacing.s,
  },
});
