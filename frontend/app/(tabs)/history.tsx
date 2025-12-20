import React from "react";
import {
  View,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useScanHistory } from "../../features/history/lib/use-scan-history";
import { ScanHistoryItem } from "../../features/history/model/types";
import {
  AppText,
  AppCard,
  ScreenWrapper,
  colors,
  layout,
} from "../../shared/ui";

function HealthScoreBadge({ score }: { score?: number }) {
  if (score === undefined || score === null) return null;

  let bgColor: string = colors.text.tertiary;
  if (score >= 70) bgColor = colors.success;
  else if (score >= 40) bgColor = colors.warning;
  else bgColor = colors.error;

  return (
    <View style={[styles.scoreBadge, { backgroundColor: bgColor }]}>
      <AppText
        variant="caption"
        color={colors.text.inverted}
        style={styles.scoreText}
      >
        {score}
      </AppText>
    </View>
  );
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function HistoryItem({
  item,
  onPress,
}: {
  item: ScanHistoryItem;
  onPress: () => void;
}) {
  const product = item.product;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <AppCard style={styles.itemCard}>
        <View style={styles.itemRow}>
          {/* Product Image */}
          <View style={styles.imageContainer}>
            {product?.images?.[0] ? (
              <Image
                source={{ uri: product.images[0] }}
                style={styles.productImage}
                resizeMode="contain"
              />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons
                  name="cube-outline"
                  size={24}
                  color={colors.text.tertiary}
                />
              </View>
            )}
          </View>

          {/* Product Info */}
          <View style={styles.productInfo}>
            <AppText
              variant="body"
              numberOfLines={2}
              style={styles.productName}
            >
              {product?.name || "Unknown Product"}
            </AppText>
            {product?.brand && (
              <AppText
                variant="caption"
                color={colors.text.secondary}
                numberOfLines={1}
              >
                {product.brand}
              </AppText>
            )}
            <View style={styles.metaRow}>
              <AppText variant="caption" color={colors.text.tertiary}>
                {formatDate(item.scannedAt)}
              </AppText>
              {item.isLocal && (
                <View style={styles.localBadge}>
                  <Ionicons
                    name="phone-portrait-outline"
                    size={10}
                    color={colors.text.tertiary}
                  />
                  <AppText
                    variant="caption"
                    color={colors.text.tertiary}
                    style={styles.localLabel}
                  >
                    Local
                  </AppText>
                </View>
              )}
            </View>
          </View>

          {/* Health Score & Arrow */}
          <View style={styles.rightSection}>
            <HealthScoreBadge score={product?.health_score} />
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.text.tertiary}
            />
          </View>
        </View>
      </AppCard>
    </TouchableOpacity>
  );
}

function EmptyState({ isAuthenticated }: { isAuthenticated: boolean }) {
  const router = useRouter();

  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="scan-outline" size={64} color={colors.text.tertiary} />
      </View>
      <AppText variant="h3" style={styles.emptyTitle}>
        No Scans Yet
      </AppText>
      <AppText
        variant="body"
        color={colors.text.secondary}
        style={styles.emptySubtitle}
      >
        Scan your first product to see it here
      </AppText>

      {!isAuthenticated && (
        <View style={styles.loginPrompt}>
          <AppText
            variant="caption"
            color={colors.text.tertiary}
            style={styles.loginText}
          >
            Create an account to sync your history across devices
          </AppText>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push("/(auth)/signup")}
          >
            <AppText variant="body" color={colors.primary}>
              Sign Up
            </AppText>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

function GuestBanner() {
  const router = useRouter();

  return (
    <TouchableOpacity
      style={styles.guestBanner}
      onPress={() => router.push("/(auth)/signup")}
      activeOpacity={0.8}
    >
      <View style={styles.bannerContent}>
        <Ionicons
          name="cloud-upload-outline"
          size={20}
          color={colors.primary}
        />
        <View style={styles.bannerText}>
          <AppText variant="caption" style={styles.bannerTitle}>
            Save your history to the cloud
          </AppText>
          <AppText variant="caption" color={colors.text.tertiary}>
            Sign up to sync across devices
          </AppText>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={16} color={colors.text.tertiary} />
    </TouchableOpacity>
  );
}

export default function HistoryScreen() {
  const router = useRouter();
  const { scans, isLoading, error, refetch, isAuthenticated } =
    useScanHistory();

  const handleItemPress = (item: ScanHistoryItem) => {
    if (item.product?.id) {
      router.push(`/product/${item.product.id}`);
    }
  };

  const renderItem = ({ item }: { item: ScanHistoryItem }) => (
    <HistoryItem item={item} onPress={() => handleItemPress(item)} />
  );

  if (isLoading && scans.length === 0) {
    return (
      <ScreenWrapper bg={colors.background} style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenWrapper>
    );
  }

  if (error) {
    return (
      <ScreenWrapper bg={colors.background} style={styles.centered}>
        <AppText variant="body" color={colors.error}>
          Failed to load history
        </AppText>
        <TouchableOpacity onPress={() => refetch()} style={styles.retryButton}>
          <AppText variant="body" color={colors.primary}>
            Tap to retry
          </AppText>
        </TouchableOpacity>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper bg={colors.background}>
      <View style={styles.header}>
        <AppText variant="h1">Scan History</AppText>
        {scans.length > 0 && (
          <AppText variant="caption" color={colors.text.secondary}>
            {scans.length} scan{scans.length !== 1 ? "s" : ""}
          </AppText>
        )}
      </View>

      {!isAuthenticated && scans.length > 0 && <GuestBanner />}

      <FlatList
        data={scans}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={
          scans.length === 0 ? styles.emptyList : styles.list
        }
        ListEmptyComponent={<EmptyState isAuthenticated={isAuthenticated} />}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    paddingHorizontal: layout.spacing.m,
    paddingTop: layout.spacing.m,
    paddingBottom: layout.spacing.s,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  list: {
    paddingHorizontal: layout.spacing.m,
    paddingBottom: layout.spacing.xl,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: layout.spacing.m,
  },
  itemCard: {
    marginBottom: layout.spacing.s,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  imageContainer: {
    width: 56,
    height: 56,
    borderRadius: layout.borderRadius.m,
    overflow: "hidden",
    backgroundColor: colors.background,
    marginRight: layout.spacing.m,
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.divider,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontWeight: "600",
    marginBottom: 2,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  localBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  localLabel: {
    fontSize: 10,
  },
  rightSection: {
    alignItems: "flex-end",
    marginLeft: layout.spacing.s,
    gap: 4,
  },
  scoreBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  scoreText: {
    fontWeight: "700",
    fontSize: 11,
  },
  emptyState: {
    alignItems: "center",
    paddingHorizontal: layout.spacing.xl,
  },
  emptyIconContainer: {
    marginBottom: layout.spacing.m,
    opacity: 0.5,
  },
  emptyTitle: {
    marginBottom: layout.spacing.xs,
    textAlign: "center",
  },
  emptySubtitle: {
    textAlign: "center",
  },
  loginPrompt: {
    marginTop: layout.spacing.xl,
    alignItems: "center",
  },
  loginText: {
    textAlign: "center",
    marginBottom: layout.spacing.m,
  },
  loginButton: {
    paddingHorizontal: layout.spacing.l,
    paddingVertical: layout.spacing.s,
    borderRadius: layout.borderRadius.m,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  guestBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: layout.spacing.m,
    marginBottom: layout.spacing.m,
    padding: layout.spacing.m,
    backgroundColor: `${colors.primary}10`,
    borderRadius: layout.borderRadius.m,
    borderWidth: 1,
    borderColor: `${colors.primary}30`,
  },
  bannerContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  bannerText: {
    marginLeft: layout.spacing.s,
  },
  bannerTitle: {
    fontWeight: "600",
  },
  retryButton: {
    marginTop: layout.spacing.m,
    padding: layout.spacing.s,
  },
});
