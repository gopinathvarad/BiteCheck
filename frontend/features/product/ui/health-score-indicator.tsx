import React from "react";
import { View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppText, AppCard, colors, layout } from "../../../shared/ui";

interface HealthScoreIndicatorProps {
  score: number;
}

export function HealthScoreIndicator({ score }: HealthScoreIndicatorProps) {
  const getScoreColor = (score: number) => {
    if (score >= 70) return colors.success;
    if (score >= 50) return colors.warning;
    return colors.error;
  };

  const getScoreLabel = (score: number) => {
    if (score >= 70) return "Excellent";
    if (score >= 50) return "Good";
    if (score >= 30) return "Fair";
    return "Poor";
  };

  const color = getScoreColor(score);
  const label = getScoreLabel(score);

  return (
    <AppCard>
      <View style={styles.header}>
        <Ionicons name="heart" size={24} color={color} />
        <AppText variant="h3" style={styles.title}>
          Health Score
        </AppText>
      </View>
      <View style={styles.scoreContainer}>
        <View style={styles.scoreCircle}>
          <AppText variant="h1" style={{ fontSize: 48, lineHeight: 56, color }}>
            {score}
          </AppText>
          <AppText variant="body" color={colors.text.tertiary}>
            /100
          </AppText>
        </View>
        <View style={styles.labelContainer}>
          <AppText variant="h3" style={{ color }}>
            {label}
          </AppText>
        </View>
      </View>
      <View style={styles.barContainer}>
        <View
          style={[styles.bar, { width: `${score}%`, backgroundColor: color }]}
        />
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: layout.spacing.m,
  },
  title: {
    marginLeft: layout.spacing.s,
  },
  scoreContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: layout.spacing.m,
  },
  scoreCircle: {
    alignItems: "center",
    marginRight: layout.spacing.m,
  },
  labelContainer: {
    flex: 1,
  },
  barContainer: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: layout.borderRadius.s,
    overflow: "hidden",
  },
  bar: {
    height: "100%",
    borderRadius: layout.borderRadius.s,
  },
});
