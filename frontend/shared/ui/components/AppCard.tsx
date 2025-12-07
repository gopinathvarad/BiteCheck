import React from "react";
import { View, ViewProps, StyleSheet } from "react-native";
import { colors, layout, shadows } from "../theme";

interface AppCardProps extends ViewProps {
  children: React.ReactNode;
  noPadding?: boolean;
}

export const AppCard: React.FC<AppCardProps> = ({
  children,
  noPadding = false,
  style,
  ...props
}) => {
  return (
    <View
      style={[styles.card, noPadding && styles.noPadding, style]}
      {...props}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: layout.borderRadius.xl,
    padding: layout.spacing.m,
    ...shadows.soft,
  },
  noPadding: {
    padding: 0,
  },
});
