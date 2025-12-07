import React from "react";
import { View, StyleSheet } from "react-native";
import { Image as ExpoImage } from "expo-image";
import { Product } from "../../../entities/product/model/types";
import { AppText, colors, layout } from "../../../shared/ui";

interface ProductDetailHeaderProps {
  product: Product;
}

export function ProductDetailHeader({ product }: ProductDetailHeaderProps) {
  const imageUrl =
    product.images && product.images.length > 0 ? product.images[0] : null;

  return (
    <View style={styles.container}>
      {/* Product Image */}
      {imageUrl ? (
        <ExpoImage
          source={{ uri: imageUrl }}
          style={styles.image}
          contentFit="cover"
          transition={200}
          placeholderContentFit="cover"
        />
      ) : (
        <View style={[styles.image, styles.placeholderImage]}>
          <AppText variant="body" color={colors.text.tertiary}>
            No Image
          </AppText>
        </View>
      )}

      {/* Product Info */}
      <View style={styles.infoContainer}>
        <AppText variant="h2" style={styles.name}>
          {product.name}
        </AppText>
        {!!product.brand && (
          <AppText
            variant="body"
            color={colors.text.secondary}
            style={styles.brand}
          >
            {product.brand}
          </AppText>
        )}
        {!!product.category && (
          <View style={styles.categoryContainer}>
            <AppText
              variant="caption"
              color={colors.text.secondary}
              weight="medium"
            >
              {product.category}
            </AppText>
          </View>
        )}
        {!!product.barcode && (
          <AppText
            variant="caption"
            color={colors.text.tertiary}
            style={styles.barcode}
          >
            Barcode: {product.barcode}
          </AppText>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
  },
  image: {
    width: "100%",
    height: 300,
    backgroundColor: colors.action.hover,
  },
  placeholderImage: {
    justifyContent: "center",
    alignItems: "center",
  },
  infoContainer: {
    padding: layout.spacing.l,
    paddingBottom: 0,
  },
  name: {
    marginBottom: layout.spacing.s,
  },
  brand: {
    marginBottom: layout.spacing.m,
  },
  categoryContainer: {
    alignSelf: "flex-start",
    backgroundColor: colors.background,
    paddingHorizontal: layout.spacing.m,
    paddingVertical: layout.spacing.s,
    borderRadius: layout.borderRadius.m,
    marginBottom: layout.spacing.m,
  },
  barcode: {
    fontFamily: "monospace", // Optional: keep monospace for barcode
  },
});
