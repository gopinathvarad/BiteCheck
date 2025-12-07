import React from "react";
import {
  TouchableOpacity,
  TouchableOpacityProps,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
} from "react-native";
import { colors, layout, typography } from "../theme";
import { AppText } from "./AppText";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";

interface AppButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export const AppButton: React.FC<AppButtonProps> = ({
  title,
  variant = "primary",
  loading = false,
  disabled = false,
  icon,
  style,
  ...props
}) => {
  const getBackgroundColor = () => {
    if (disabled) return colors.action.disabledBackground;
    switch (variant) {
      case "primary":
        return colors.primary;
      case "secondary":
        return colors.secondary;
      case "danger":
        return colors.error;
      case "outline":
        return "transparent";
      case "ghost":
        return "transparent";
      default:
        return colors.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return colors.action.disabled;
    switch (variant) {
      case "primary":
        return colors.text.inverted;
      case "secondary":
        return colors.text.inverted;
      case "danger":
        return colors.text.inverted;
      case "outline":
        return colors.primary;
      case "ghost":
        return colors.text.primary;
      default:
        return colors.text.inverted;
    }
  };

  const buttonStyle: ViewStyle = {
    backgroundColor: getBackgroundColor(),
    paddingVertical: layout.spacing.m,
    paddingHorizontal: layout.spacing.l,
    borderRadius: layout.borderRadius.l,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: variant === "outline" ? 1 : 0,
    borderColor: variant === "outline" ? colors.primary : "transparent",
    opacity: disabled || loading ? 0.7 : 1,
  };

  return (
    <TouchableOpacity
      style={[buttonStyle, style]}
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <>
          {icon && <>{icon}</>}
          <AppText
            variant="button"
            color={getTextColor()}
            style={icon ? { marginLeft: layout.spacing.s } : undefined}
          >
            {title}
          </AppText>
        </>
      )}
    </TouchableOpacity>
  );
};
