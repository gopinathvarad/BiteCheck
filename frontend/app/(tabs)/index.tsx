import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  ScrollView,
  Platform,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useCameraPermissions, BarcodeScanningResult } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { scanProduct } from "../../features/scan/api/scan-api";
import { Product } from "../../entities/product/model/types";
import { ScanCameraView } from "../../features/scan/ui/scan-camera-view";
import { ManualBarcodeEntry } from "../../features/scan/ui/manual-barcode-entry";

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showManualEntryModal, setShowManualEntryModal] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const router = useRouter();

  // Scan mutation
  const scanMutation = useMutation({
    mutationFn: async ({ code, type }: { code: string; type?: string }) => {
      const response = await scanProduct({
        code,
        type: (type as "barcode" | "qr") || "barcode",
      });
      return response.data;
    },
    onSuccess: (data) => {
      setProduct(data);
      setShowProductModal(true);
      setScanned(false); // Reset for next scan
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
    if (Platform.OS === "ios") {
      // iOS: Use native Alert.prompt for better UX
      Alert.prompt(
        "Enter Barcode",
        "Type the barcode number manually",
        [
          {
            text: "Cancel",
            style: "cancel",
            onPress: () => {},
          },
          {
            text: "Scan",
            onPress: (barcode) => {
              if (barcode && barcode.trim()) {
                setScanned(true);
                setScanning(true);
                scanMutation.mutate({ code: barcode.trim() });
              }
            },
          },
        ],
        "plain-text"
      );
    } else {
      // Android: Show custom modal with TextInput
      setShowManualEntryModal(true);
    }
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
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#6B46C1" />
        <Text style={styles.permissionText}>
          Requesting camera permission...
        </Text>
        <StatusBar style="auto" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Ionicons name="camera-outline" size={64} color="#6B46C1" />
        <Text style={styles.permissionTitle}>Camera Permission Required</Text>
        <Text style={styles.permissionText}>
          BiteCheck needs access to your camera to scan product barcodes.
        </Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={requestPermission}
        >
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
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
            <Text style={styles.modalTitle}>Product Details</Text>
            <TouchableOpacity onPress={handleProductClose}>
              <Ionicons name="close" size={28} color="#000" />
            </TouchableOpacity>
          </View>

          {product && (
            <ScrollView style={styles.modalContent}>
              <View style={styles.productHeader}>
                <Text style={styles.productName}>{product.name}</Text>
                {product.brand && (
                  <Text style={styles.productBrand}>{product.brand}</Text>
                )}
                {product.barcode && (
                  <Text style={styles.productBarcode}>
                    Barcode: {product.barcode}
                  </Text>
                )}
              </View>

              {product.health_score !== undefined && (
                <View style={styles.healthScoreContainer}>
                  <Text style={styles.healthScoreLabel}>Health Score</Text>
                  <View style={styles.healthScoreBar}>
                    <View
                      style={[
                        styles.healthScoreFill,
                        { width: `${product.health_score}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.healthScoreValue}>
                    {String(product.health_score)}/100
                  </Text>
                </View>
              )}

              {product.nutrition && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Nutrition (per 100g)</Text>
                  {product.nutrition.per_100g && (
                    <View style={styles.nutritionGrid}>
                      {product.nutrition.per_100g.energy_kcal !== undefined &&
                        product.nutrition.per_100g.energy_kcal !== null && (
                          <View style={styles.nutritionItem}>
                            <Text style={styles.nutritionLabel}>Calories</Text>
                            <Text style={styles.nutritionValue}>
                              {String(product.nutrition.per_100g.energy_kcal)}{" "}
                              kcal
                            </Text>
                          </View>
                        )}
                      {product.nutrition.per_100g.proteins !== undefined &&
                        product.nutrition.per_100g.proteins !== null && (
                          <View style={styles.nutritionItem}>
                            <Text style={styles.nutritionLabel}>Protein</Text>
                            <Text style={styles.nutritionValue}>
                              {String(product.nutrition.per_100g.proteins)}g
                            </Text>
                          </View>
                        )}
                      {product.nutrition.per_100g.carbohydrates !== undefined &&
                        product.nutrition.per_100g.carbohydrates !== null && (
                          <View style={styles.nutritionItem}>
                            <Text style={styles.nutritionLabel}>Carbs</Text>
                            <Text style={styles.nutritionValue}>
                              {String(product.nutrition.per_100g.carbohydrates)}
                              g
                            </Text>
                          </View>
                        )}
                      {product.nutrition.per_100g.fat !== undefined &&
                        product.nutrition.per_100g.fat !== null && (
                          <View style={styles.nutritionItem}>
                            <Text style={styles.nutritionLabel}>Fat</Text>
                            <Text style={styles.nutritionValue}>
                              {String(product.nutrition.per_100g.fat)}g
                            </Text>
                          </View>
                        )}
                    </View>
                  )}
                </View>
              )}

              {product.allergens && product.allergens.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Allergens</Text>
                  <View style={styles.allergenList}>
                    {product.allergens.map((allergen, index) => (
                      <View key={index} style={styles.allergenTag}>
                        <Text style={styles.allergenText}>{allergen}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {product.ingredients_raw && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Ingredients</Text>
                  <Text style={styles.ingredientsText}>
                    {product.ingredients_raw}
                  </Text>
                </View>
              )}

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => {
                    if (product?.id) {
                      handleProductClose();
                      router.push(`/product/${product.id}`);
                    } else {
                      Alert.alert("Error", "Product ID not available");
                    }
                  }}
                >
                  <Text style={styles.actionButtonText}>View Full Details</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </View>
      </Modal>

      {/* Manual Entry Modal (Android) */}
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
  permissionText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 16,
    paddingHorizontal: 40,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
    marginTop: 24,
    marginBottom: 8,
  },
  permissionButton: {
    marginTop: 32,
    paddingVertical: 14,
    paddingHorizontal: 32,
    backgroundColor: "#6B46C1",
    borderRadius: 25,
  },
  permissionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  productHeader: {
    marginBottom: 24,
  },
  productName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 8,
  },
  productBrand: {
    fontSize: 18,
    color: "#666",
    marginBottom: 4,
  },
  productBarcode: {
    fontSize: 14,
    color: "#999",
  },
  healthScoreContainer: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
  },
  healthScoreLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 8,
  },
  healthScoreBar: {
    height: 8,
    backgroundColor: "#e0e0e0",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  healthScoreFill: {
    height: "100%",
    backgroundColor: "#6B46C1",
  },
  healthScoreValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#6B46C1",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 12,
  },
  nutritionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  nutritionItem: {
    flex: 1,
    minWidth: "45%",
    padding: 12,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
  },
  nutritionLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  nutritionValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  allergenList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  allergenTag: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#ffebee",
    borderRadius: 16,
  },
  allergenText: {
    fontSize: 14,
    color: "#c62828",
    fontWeight: "500",
  },
  ingredientsText: {
    fontSize: 16,
    color: "#444",
    lineHeight: 24,
  },
  modalActions: {
    marginTop: 24,
    marginBottom: 40,
  },
  actionButton: {
    backgroundColor: "#6B46C1",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
