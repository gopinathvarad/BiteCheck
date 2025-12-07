import React from "react";
import { AppText, ScreenWrapper, colors, layout } from "../../shared/ui";

export default function HistoryScreen() {
  return (
    <ScreenWrapper
      bg={colors.background}
      style={{
        justifyContent: "center",
        alignItems: "center",
        gap: layout.spacing.s,
      }}
    >
      <AppText variant="h2">Scan History</AppText>
      <AppText variant="body" color={colors.text.secondary}>
        Your scanned products will appear here
      </AppText>
    </ScreenWrapper>
  );
}
