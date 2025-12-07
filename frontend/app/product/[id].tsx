import React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useProduct } from "../../features/product/api/use-product";
import {
  ProductDetailHeader,
  HealthScoreIndicator,
  NutritionFactsSection,
  IngredientsSection,
  AllergensSection,
  ProductInfoSection,
} from "../../features/product/ui";
import {
  AppText,
  AppButton,
  ScreenWrapper,
  colors,
  layout,
} from "../../shared/ui";

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data, isLoading, error, refetch } = useProduct(id);

  if (isLoading) {
    return (
      <ScreenWrapper style={styles.centerContainer}>
        <StatusBar style="dark" />
        <ActivityIndicator size="large" color={colors.primary} />
        <AppText style={styles.marginTop}>Loading product...</AppText>
      </ScreenWrapper>
    );
  }

  if (error || !data?.success || !data.data) {
    return (
      <ScreenWrapper style={styles.centerContainer} withPadding>
        <StatusBar style="dark" />
        <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
        <AppText variant="h3" style={styles.marginTop}>
          Failed to load product
        </AppText>
        <AppText
          style={{
            textAlign: "center",
            marginVertical: layout.spacing.m,
            color: colors.text.secondary,
          }}
        >
          {error instanceof Error ? error.message : "Something went wrong"}
        </AppText>
        <AppButton title="Try Again" onPress={() => refetch()} />
        <AppButton
          title="Go Back"
          variant="outline"
          onPress={() => router.back()}
          style={{ marginTop: layout.spacing.m }}
        />
      </ScreenWrapper>
    );
  }

  const product = data.data;

  return (
    <ScreenWrapper bg={colors.background}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <AppText variant="h3">Product Details</AppText>
        <TouchableOpacity
          onPress={() => {
            Alert.alert("Share", "Share functionality coming soon");
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name="share-outline"
            size={24}
            color={colors.text.primary}
          />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ProductDetailHeader product={product} />

        <View style={styles.contentPadding}>
          {product.health_score !== undefined && (
            <HealthScoreIndicator score={product.health_score} />
          )}

          <NutritionFactsSection
            per100g={product.nutrition?.per_100g}
            perServing={product.nutrition?.per_serving}
          />

          <AllergensSection
            allergens={product.allergens}
            warnings={product.warnings}
          />

          <IngredientsSection product={product} />

          <ProductInfoSection product={product} />

          <TouchableOpacity
            style={styles.correctionButton}
            onPress={() => {
              router.push({
                pathname: "/correction",
                params: {
                  productId: product.id,
                  fieldName: "General",
                  oldValue: product.name || "",
                },
              });
            }}
          >
            <Ionicons
              name="flag-outline"
              size={20}
              color={colors.text.secondary}
              style={{ marginRight: 8 }}
            />
            <AppText variant="button" color={colors.text.secondary}>
              Suggest a Correction
            </AppText>
          </TouchableOpacity>

          {/* Bottom spacing */}
          <View style={styles.bottomSpacing} />
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  marginTop: {
    marginTop: layout.spacing.m,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: layout.spacing.l,
    paddingVertical: layout.spacing.m,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: layout.spacing.l,
  },
  contentPadding: {
    padding: layout.spacing.l,
    gap: layout.spacing.l,
  },
  correctionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: layout.spacing.m,
    backgroundColor: colors.card,
    borderRadius: layout.borderRadius.l,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: layout.spacing.l,
  },
  bottomSpacing: {
    height: 20,
  },
});
