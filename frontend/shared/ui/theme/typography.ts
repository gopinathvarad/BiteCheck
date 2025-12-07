import { Platform } from "react-native";

const fontFamily = Platform.select({
  ios: "System",
  android: "Roboto",
  default: "System",
});

export const typography = {
  fontFamily,
  weights: {
    regular: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  } as const,
  sizes: {
    xs: 12,
    s: 14,
    m: 16,
    l: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  lineHeights: {
    xs: 16,
    s: 20,
    m: 24,
    l: 28,
    xl: 28,
    xxl: 32,
    xxxl: 40,
  },
} as const;

export const textVariants = {
  h1: {
    fontSize: typography.sizes.xxxl,
    lineHeight: typography.lineHeights.xxxl,
    fontWeight: typography.weights.bold,
  },
  h2: {
    fontSize: typography.sizes.xxl,
    lineHeight: typography.lineHeights.xxl,
    fontWeight: typography.weights.bold,
  },
  h3: {
    fontSize: typography.sizes.xl,
    lineHeight: typography.lineHeights.xl,
    fontWeight: typography.weights.semibold,
  },
  body: {
    fontSize: typography.sizes.m,
    lineHeight: typography.lineHeights.m,
    fontWeight: typography.weights.regular,
  },
  bodySmall: {
    fontSize: typography.sizes.s,
    lineHeight: typography.lineHeights.s,
    fontWeight: typography.weights.regular,
  },
  caption: {
    fontSize: typography.sizes.xs,
    lineHeight: typography.lineHeights.xs,
    fontWeight: typography.weights.medium,
  },
  button: {
    fontSize: typography.sizes.m,
    lineHeight: typography.lineHeights.m,
    fontWeight: typography.weights.semibold,
  },
} as const;
