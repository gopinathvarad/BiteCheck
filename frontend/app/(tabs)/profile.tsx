import React from "react";
import { AppText, ScreenWrapper, colors, layout } from "../../shared/ui";

export default function ProfileScreen() {
  return (
    <ScreenWrapper
      bg={colors.background}
      style={{
        justifyContent: "center",
        alignItems: "center",
        gap: layout.spacing.s,
      }}
    >
      <AppText variant="h2">Profile</AppText>
      <AppText variant="body" color={colors.text.secondary}>
        User settings and preferences
      </AppText>
    </ScreenWrapper>
  );
}
