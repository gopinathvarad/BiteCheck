import React from "react";
import { Text, TextProps, StyleSheet, TextStyle } from "react-native";
import { colors, textVariants, typography } from "../theme";

type Variant = keyof typeof textVariants;

interface AppTextProps extends TextProps {
  children: React.ReactNode;
  variant?: Variant;
  color?: string;
  weight?: keyof typeof typography.weights;
  centered?: boolean;
}

export const AppText: React.FC<AppTextProps> = ({
  children,
  variant = "body",
  color = colors.text.primary,
  weight,
  centered,
  style,
  ...props
}) => {
  const variantStyles = textVariants[variant];

  const customStyles: TextStyle = {
    color,
    textAlign: centered ? "center" : "left",
    fontFamily: typography.fontFamily,
  };

  if (weight) {
    customStyles.fontWeight = typography.weights[weight];
  }

  return (
    <Text style={[variantStyles, customStyles, style]} {...props}>
      {children}
    </Text>
  );
};
