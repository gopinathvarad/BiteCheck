import React from "react";
import { View, StyleSheet } from "react-native";
import { colors, layout } from "../theme";
import { AppText } from "./AppText";
import { Ionicons } from "@expo/vector-icons";

type StatusType = "safe" | "warning" | "neutral";

interface StatusBadgeProps {
  status: StatusType;
  text: string;
  icon?: keyof typeof Ionicons.glyphMap;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  text,
  icon,
}) => {
  const getColors = () => {
    switch (status) {
      case "safe":
        return { bg: colors.primary + "20", text: colors.primaryDark };
      case "warning":
        return { bg: colors.error + "20", text: colors.error };
      case "neutral":
      default:
        return { bg: colors.text.tertiary + "20", text: colors.text.secondary };
    }
  };

  const theme = getColors();

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      {icon && (
        <Ionicons
          name={icon}
          size={16}
          color={theme.text}
          style={{ marginRight: 6 }}
        />
      )}
      <AppText variant="caption" weight="medium" style={{ color: theme.text }}>
        {text}
      </AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: layout.spacing.s,
    paddingHorizontal: layout.spacing.m,
    borderRadius: layout.borderRadius.full,
  },
});
