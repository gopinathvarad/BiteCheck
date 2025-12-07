import React from "react";
import {
  TextInput,
  TextInputProps,
  StyleSheet,
  View,
  TextStyle,
} from "react-native";
import { colors, layout, typography } from "../theme";
import { AppText } from "./AppText";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  style,
  ...props
}) => {
  return (
    <View style={styles.container}>
      {label && (
        <AppText variant="caption" weight="medium" style={styles.label}>
          {label}
        </AppText>
      )}
      <TextInput
        style={[styles.input, error ? styles.inputError : null, style]}
        placeholderTextColor={colors.text.tertiary}
        {...props}
      />
      {error && (
        <AppText variant="caption" style={styles.error}>
          {error}
        </AppText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: layout.spacing.m,
    width: "100%",
  },
  label: {
    marginBottom: layout.spacing.xs,
    color: colors.text.secondary,
  },
  input: {
    field: "value",
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: layout.borderRadius.m,
    padding: layout.spacing.m,
    fontSize: typography.sizes.m,
    fontFamily: typography.fontFamily,
    color: colors.text.primary,
  } as TextStyle,
  inputError: {
    borderColor: colors.error,
  },
  error: {
    marginTop: layout.spacing.xs,
    color: colors.error,
  },
});
