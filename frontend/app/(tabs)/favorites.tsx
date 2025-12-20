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
import { useFavorites, useToggleFavorite } from "../../features/favorites";
import { FavoriteItem } from "../../features/favorites/model/types";
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

function FavoriteListItem({
  item,
  onPress,
  onRemove,
}: {
  item: FavoriteItem;
  onPress: () => void;
  onRemove: () => void;
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
            <AppText variant="caption" color={colors.text.tertiary}>
              Added {formatDate(item.created_at)}
            </AppText>
          </View>

          {/* Health Score & Remove Button */}
          <View style={styles.rightSection}>
            <HealthScoreBadge score={product?.health_score} />
            <TouchableOpacity
              onPress={onRemove}
              style={styles.removeButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="heart" size={22} color={colors.error} />
            </TouchableOpacity>
          </View>
        </View>
      </AppCard>
    </TouchableOpacity>
  );
}

function EmptyState({ isAuthenticated }: { isAuthenticated: boolean }) {
  const router = useRouter();

  if (!isAuthenticated) {
    return (
      <View style={styles.emptyState}>
        <View style={styles.emptyIconContainer}>
          <Ionicons
            name="heart-outline"
            size={64}
            color={colors.text.tertiary}
          />
        </View>
        <AppText variant="h3" style={styles.emptyTitle}>
          Sign In Required
        </AppText>
        <AppText
          variant="body"
          color={colors.text.secondary}
          style={styles.emptySubtitle}
        >
          Create an account to save your favorite products
        </AppText>
        <TouchableOpacity
          style={styles.signInButton}
          onPress={() => router.push("/(auth)/login")}
        >
          <AppText variant="body" color={colors.primary}>
            Sign In
          </AppText>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="heart-outline" size={64} color={colors.text.tertiary} />
      </View>
      <AppText variant="h3" style={styles.emptyTitle}>
        No Favorites Yet
      </AppText>
      <AppText
        variant="body"
        color={colors.text.secondary}
        style={styles.emptySubtitle}
      >
        Tap the heart icon on products to save them here
      </AppText>
    </View>
  );
}

export default function FavoritesScreen() {
  const router = useRouter();
  const {
    favorites,
    isLoading,
    error,
    refetch,
    isAuthenticated,
    invalidateFavorites,
  } = useFavorites();
  const { toggle, isLoading: isToggling } = useToggleFavorite();

  const handleItemPress = (item: FavoriteItem) => {
    if (item.product_id) {
      router.push(`/product/${item.product_id}`);
    }
  };

  const handleRemove = async (productId: string) => {
    try {
      await toggle(productId, true);
    } catch (error) {
      console.error("Failed to remove favorite:", error);
    }
  };

  const renderItem = ({ item }: { item: FavoriteItem }) => (
    <FavoriteListItem
      item={item}
      onPress={() => handleItemPress(item)}
      onRemove={() => handleRemove(item.product_id)}
    />
  );

  if (isLoading && favorites.length === 0) {
    return (
      <ScreenWrapper bg={colors.background} style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenWrapper>
    );
  }

  if (error && isAuthenticated) {
    return (
      <ScreenWrapper bg={colors.background} style={styles.centered}>
        <AppText variant="body" color={colors.error}>
          Failed to load favorites
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
        <AppText variant="h1">Favorites</AppText>
        {favorites.length > 0 && (
          <AppText variant="caption" color={colors.text.secondary}>
            {favorites.length} item{favorites.length !== 1 ? "s" : ""}
          </AppText>
        )}
      </View>

      <FlatList
        data={favorites}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={
          favorites.length === 0 || !isAuthenticated
            ? styles.emptyList
            : styles.list
        }
        ListEmptyComponent={<EmptyState isAuthenticated={isAuthenticated} />}
        refreshControl={
          isAuthenticated ? (
            <RefreshControl
              refreshing={isLoading}
              onRefresh={refetch}
              tintColor={colors.primary}
            />
          ) : undefined
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
  rightSection: {
    alignItems: "flex-end",
    marginLeft: layout.spacing.s,
    gap: 8,
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
  removeButton: {
    padding: 4,
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
  signInButton: {
    marginTop: layout.spacing.l,
    paddingHorizontal: layout.spacing.l,
    paddingVertical: layout.spacing.s,
    borderRadius: layout.borderRadius.m,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  retryButton: {
    marginTop: layout.spacing.m,
    padding: layout.spacing.s,
  },
});
