import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  ScrollView,
  Platform,
  Image,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useCameraPermissions, BarcodeScanningResult } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { scanProduct } from "../../features/scan/api/scan-api";
import { Product } from "../../entities/product/model/types";
import { ScanCameraView } from "../../features/scan/ui/scan-camera-view";
import { ManualBarcodeEntry } from "../../features/scan/ui/manual-barcode-entry";
import { saveLocalScan } from "../../features/history/lib/local-scan-storage";
import { useAuth } from "../../features/auth/lib/auth-context";
import {
  AppText,
  AppButton,
  AppCard,
  StatusBadge,
  colors,
  layout,
  shadows,
} from "../../shared/ui";

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showManualEntryModal, setShowManualEntryModal] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Scan mutation
  const scanMutation = useMutation({
    mutationFn: async ({ code, type }: { code: string; type?: string }) => {
      const response = await scanProduct({
        code,
        type: (type as "barcode" | "qr") || "barcode",
      });
      return response.data;
    },
    onSuccess: async (data) => {
      setProduct(data);
      setShowProductModal(true);
      setScanned(false); // Reset for next scan

      // Save to local storage for guest users
      if (!user) {
        try {
          await saveLocalScan(data);
          // Invalidate history query so it refreshes
          queryClient.invalidateQueries({ queryKey: ["scan-history"] });
        } catch (error) {
          console.error("Failed to save local scan:", error);
        }
      }
    },
    onError: (error: any) => {
      // Safely convert error message to string
      let errorMessage = "Failed to scan product. Please try again.";

      if (error?.response?.data?.detail) {
        const detail = error.response.data.detail;
        errorMessage =
          typeof detail === "string" ? detail : JSON.stringify(detail);
      } else if (error?.message) {
        errorMessage =
          typeof error.message === "string"
            ? error.message
            : String(error.message);
      }

      Alert.alert("Scan Failed", errorMessage, [
        { text: "Try Again", onPress: () => setScanned(false) },
        { text: "Cancel", style: "cancel" },
      ]);
      setScanned(false);
      setScanning(false);
    },
  });

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission]);

  const handleBarCodeScanned = ({ data, type }: BarcodeScanningResult) => {
    if (scanned || scanning) return;

    setScanned(true);
    setScanning(true);

    // Process the scan with barcode type
    scanMutation.mutate({ code: data, type });
  };

  const handleManualEntry = () => {
    setShowManualEntryModal(true);
  };

  const handleManualScan = (code: string) => {
    setScanned(true);
    setScanning(true);
    scanMutation.mutate({ code });
  };

  const handleProductClose = () => {
    setShowProductModal(false);
    setProduct(null);
    setScanned(false);
    setScanning(false);
  };

  if (!permission) {
    return (
      <View style={styles.permissionContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <AppText style={styles.permissionText}>
          Requesting camera permission...
        </AppText>
        <StatusBar style="auto" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Ionicons name="camera-outline" size={64} color={colors.primary} />
        <AppText variant="h2" style={styles.permissionTitle}>
          Camera Permission
        </AppText>
        <AppText style={styles.permissionText}>
          BiteCheck needs access to your camera to scan product barcodes.
        </AppText>
        <AppButton
          title="Grant Permission"
          onPress={requestPermission}
          style={{ marginTop: layout.spacing.xl }}
        />
        <StatusBar style="auto" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <ScanCameraView
        onScan={handleBarCodeScanned}
        onManualEntry={handleManualEntry}
        scanning={scanning}
        scanned={scanned}
      />

      {/* Product Modal */}
      <Modal
        visible={showProductModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleProductClose}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <AppText variant="h3">Product Details</AppText>
            <TouchableOpacity onPress={handleProductClose}>
              <Ionicons name="close" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          {product && (
            <ScrollView
              style={styles.modalContent}
              contentContainerStyle={{ paddingBottom: 40 }}
            >
              {/* Product Header */}
              <View style={styles.productHeader}>
                <View style={styles.imagePlaceholder}>
                  {product.images && product.images.length > 0 ? (
                    <Image
                      source={{ uri: product.images[0] }}
                      style={styles.productImage}
                      resizeMode="contain"
                    />
                  ) : (
                    <Ionicons
                      name="image-outline"
                      size={48}
                      color={colors.text.tertiary}
                    />
                  )}
                </View>
                <AppText variant="h2">{product.name}</AppText>
                {product.brand && (
                  <AppText variant="body" color={colors.text.secondary}>
                    {product.brand}
                  </AppText>
                )}

                {/* Health Score & Allergens Summary */}
                <View style={styles.badgesContainer}>
                  {product.health_score !== undefined && (
                    <StatusBadge
                      status={
                        product.health_score > 70
                          ? "safe"
                          : product.health_score > 40
                          ? "neutral"
                          : "warning"
                      }
                      text={`Score: ${product.health_score}/100`}
                      icon="heart"
                    />
                  )}
                  {product.allergens && product.allergens.length > 0 ? (
                    <StatusBadge
                      status="warning"
                      text="Contains Allergens"
                      icon="warning"
                    />
                  ) : (
                    <StatusBadge
                      status="safe"
                      text="No Allergens Found"
                      icon="checkmark-circle"
                    />
                  )}
                </View>
              </View>

              {/* Nutrition Section */}
              {product.nutrition && product.nutrition.per_100g && (
                <View style={styles.section}>
                  <AppText variant="h3" style={styles.sectionTitle}>
                    Nutrition (per 100g)
                  </AppText>

                  <View style={styles.nutritionGrid}>
                    <AppCard style={styles.nutritionCard}>
                      <AppText variant="caption" color={colors.text.secondary}>
                        Calories
                      </AppText>
                      <AppText variant="h3">
                        {product.nutrition.per_100g.energy_kcal || "-"}
                      </AppText>
                      <AppText variant="caption" color={colors.text.tertiary}>
                        kcal
                      </AppText>
                    </AppCard>

                    <AppCard style={styles.nutritionCard}>
                      <AppText variant="caption" color={colors.text.secondary}>
                        Protein
                      </AppText>
                      <AppText variant="h3">
                        {product.nutrition.per_100g.proteins || "-"}
                      </AppText>
                      <AppText variant="caption" color={colors.text.tertiary}>
                        g
                      </AppText>
                    </AppCard>

                    <AppCard style={styles.nutritionCard}>
                      <AppText variant="caption" color={colors.text.secondary}>
                        Carbs
                      </AppText>
                      <AppText variant="h3">
                        {product.nutrition.per_100g.carbohydrates || "-"}
                      </AppText>
                      <AppText variant="caption" color={colors.text.tertiary}>
                        g
                      </AppText>
                    </AppCard>

                    <AppCard style={styles.nutritionCard}>
                      <AppText variant="caption" color={colors.text.secondary}>
                        Fat
                      </AppText>
                      <AppText variant="h3">
                        {product.nutrition.per_100g.fat || "-"}
                      </AppText>
                      <AppText variant="caption" color={colors.text.tertiary}>
                        g
                      </AppText>
                    </AppCard>
                  </View>
                </View>
              )}

              {/* Ingredients Section */}
              {product.ingredients_raw && (
                <AppCard style={styles.section}>
                  <AppText variant="h3" style={styles.sectionTitle}>
                    Ingredients
                  </AppText>
                  <AppText variant="body" style={{ lineHeight: 24 }}>
                    {product.ingredients_raw}
                  </AppText>
                </AppCard>
              )}

              <View style={styles.modalActions}>
                <AppButton
                  title="View Full Details"
                  onPress={() => {
                    if (product?.id) {
                      handleProductClose();
                      router.push(`/product/${product.id}`);
                    } else {
                      Alert.alert("Error", "Product ID not available");
                    }
                  }}
                  icon={
                    <Ionicons
                      name="document-text-outline"
                      size={20}
                      color={colors.text.inverted}
                    />
                  }
                />
              </View>
            </ScrollView>
          )}
        </View>
      </Modal>

      {/* Manual Entry Modal */}
      <ManualBarcodeEntry
        visible={showManualEntryModal}
        onClose={() => setShowManualEntryModal(false)}
        onScan={handleManualScan}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: layout.spacing.xl,
    backgroundColor: colors.background,
  },
  permissionTitle: {
    marginTop: layout.spacing.l,
    marginBottom: layout.spacing.s,
    textAlign: "center",
  },
  permissionText: {
    color: colors.text.secondary,
    textAlign: "center",
    marginBottom: layout.spacing.l,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: layout.spacing.l,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.card,
  },
  modalContent: {
    flex: 1,
    padding: layout.spacing.l,
  },
  productHeader: {
    marginBottom: layout.spacing.xl,
    alignItems: "center",
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    backgroundColor: colors.action.hover,
    borderRadius: layout.borderRadius.l,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: layout.spacing.m,
  },
  productImage: {
    width: "100%",
    height: "100%",
    borderRadius: layout.borderRadius.l,
  },
  badgesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: layout.spacing.s,
    marginTop: layout.spacing.m,
    justifyContent: "center",
  },
  section: {
    marginBottom: layout.spacing.l,
  },
  sectionTitle: {
    marginBottom: layout.spacing.m,
  },
  nutritionGrid: {
    flexDirection: "row",
    gap: layout.spacing.s,
  },
  nutritionCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: layout.spacing.m,
    paddingHorizontal: layout.spacing.s,
  },
  modalActions: {
    marginTop: layout.spacing.l,
  },
});
