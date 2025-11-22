import React, { useState, useEffect, useRef } from "react";
import { Animated } from "react-native";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  ScrollView,
  Dimensions,
  Platform,
  TextInput,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import {
  CameraView,
  CameraType,
  useCameraPermissions,
  BarcodeScanningResult,
} from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { scanProduct } from "../../features/scan/api/scan-api";
import { Product } from "../../entities/product/model/types";

const { width, height } = Dimensions.get("window");
const SCAN_AREA_SIZE = width * 0.7;

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [cameraType, setCameraType] = useState<CameraType>("back");
  const [scanning, setScanning] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showManualEntryModal, setShowManualEntryModal] = useState(false);
  const [manualBarcode, setManualBarcode] = useState("");
  const [product, setProduct] = useState<Product | null>(null);
  const cameraRef = useRef<CameraView>(null);
  const scanLineAnim = useRef(new Animated.Value(0)).current;
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

  // Scanning line animation
  useEffect(() => {
    if (!scanned && !scanning) {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(scanLineAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(scanLineAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
      return () => animation.stop();
    }
  }, [scanned, scanning, scanLineAnim]);

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
      setManualBarcode("");
    }
  };

  const handleManualScan = () => {
    if (manualBarcode && manualBarcode.trim()) {
      setScanned(true);
      setScanning(true);
      setShowManualEntryModal(false);
      scanMutation.mutate({ code: manualBarcode.trim() });
      setManualBarcode("");
    }
  };

  const handleManualEntryCancel = () => {
    setShowManualEntryModal(false);
    setManualBarcode("");
  };

  const handleGalleryPress = () => {
    // TODO: Implement image picker for barcode scanning from gallery
    Alert.alert("Coming Soon", "Gallery scanning will be available soon.");
  };

  const handleFlashToggle = () => {
    setFlashEnabled(!flashEnabled);
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

      {/* Camera View */}
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={cameraType}
        barcodeScannerSettings={{
          barcodeTypes: [
            "ean13",
            "ean8",
            "upc_a",
            "upc_e",
            "qr",
            "code128",
            "code39",
            "code93",
            "codabar",
            "itf14",
          ],
        }}
        onBarcodeScanned={
          scanned || scanning ? undefined : handleBarCodeScanned
        }
        enableTorch={flashEnabled}
      >
        {/* Overlay */}
        <View style={styles.overlay}>
          {/* Top Section */}
          <View style={styles.topSection}>
            <Text style={styles.title}>Scan Product</Text>
            <Text style={styles.subtitle}>
              {scanning ? "Scanning code..." : "Place barcode inside the frame"}
            </Text>
          </View>

          {/* Scanning Frame */}
          <View style={styles.scanFrameContainer}>
            <View style={styles.scanFrame}>
              {/* Corner indicators */}
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />

              {/* Scanning line animation */}
              {!scanned && !scanning && (
                <Animated.View
                  style={[
                    styles.scanLine,
                    {
                      transform: [
                        {
                          translateY: scanLineAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, SCAN_AREA_SIZE - 2],
                          }),
                        },
                      ],
                    },
                  ]}
                />
              )}
            </View>
          </View>

          {/* Bottom Controls */}
          <View style={styles.bottomControls}>
            {/* Gallery Button */}
            <TouchableOpacity
              style={styles.controlButton}
              onPress={handleGalleryPress}
              disabled={scanning}
            >
              <Ionicons name="images-outline" size={28} color="#fff" />
            </TouchableOpacity>

            {/* Shutter Button */}
            <TouchableOpacity
              style={[
                styles.shutterButton,
                scanning && styles.shutterButtonDisabled,
              ]}
              onPress={() => {
                if (!scanning) {
                  setScanned(false);
                }
              }}
              disabled={scanning}
            >
              {scanning ? (
                <ActivityIndicator size="large" color="#fff" />
              ) : (
                <View style={styles.shutterInner} />
              )}
            </TouchableOpacity>

            {/* Flash Button */}
            <TouchableOpacity
              style={styles.controlButton}
              onPress={handleFlashToggle}
              disabled={scanning}
            >
              <Ionicons
                name={flashEnabled ? "flash" : "flash-outline"}
                size={28}
                color={flashEnabled ? "#FFD700" : "#fff"}
              />
            </TouchableOpacity>
          </View>

          {/* Manual Entry Button */}
          <TouchableOpacity
            style={styles.manualEntryButton}
            onPress={handleManualEntry}
            disabled={scanning}
          >
            <Text style={styles.manualEntryText}>Enter barcode manually</Text>
          </TouchableOpacity>
        </View>
      </CameraView>

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
      <Modal
        visible={showManualEntryModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleManualEntryCancel}
      >
        <View style={styles.manualEntryModalContainer}>
          <View style={styles.manualEntryModalHeader}>
            <Text style={styles.manualEntryModalTitle}>Enter Barcode</Text>
            <TouchableOpacity onPress={handleManualEntryCancel}>
              <Ionicons name="close" size={28} color="#000" />
            </TouchableOpacity>
          </View>
          <View style={styles.manualEntryModalContent}>
            <Text style={styles.manualEntryModalLabel}>
              Type the barcode number manually
            </Text>
            <TextInput
              style={styles.manualEntryInput}
              value={manualBarcode}
              onChangeText={setManualBarcode}
              placeholder="Enter barcode (EAN, UPC, etc.)"
              placeholderTextColor="#999"
              autoFocus
              keyboardType="numeric"
              returnKeyType="done"
              onSubmitEditing={handleManualScan}
            />
            <View style={styles.manualEntryModalActions}>
              <TouchableOpacity
                style={[
                  styles.manualEntryButton,
                  styles.manualEntryButtonCancel,
                ]}
                onPress={handleManualEntryCancel}
              >
                <Text style={styles.manualEntryButtonCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.manualEntryButton,
                  styles.manualEntryButtonScan,
                  (!manualBarcode || !manualBarcode.trim()) &&
                    styles.manualEntryButtonDisabled,
                ]}
                onPress={handleManualScan}
                disabled={!manualBarcode || !manualBarcode.trim()}
              >
                <Text style={styles.manualEntryButtonScanText}>Scan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  topSection: {
    paddingTop: 60,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
    opacity: 0.9,
  },
  scanFrameContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scanFrame: {
    width: SCAN_AREA_SIZE,
    height: SCAN_AREA_SIZE,
    position: "relative",
  },
  corner: {
    position: "absolute",
    width: 30,
    height: 30,
    borderColor: "#6B46C1",
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  scanLine: {
    position: "absolute",
    top: "50%",
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: "#6B46C1",
    opacity: 0.8,
  },
  bottomControls: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingBottom: 40,
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  shutterButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#6B46C1",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#fff",
  },
  shutterButtonDisabled: {
    opacity: 0.6,
  },
  shutterInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#fff",
  },
  manualEntryButton: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignSelf: "center",
    backgroundColor: "rgba(107, 70, 193, 0.8)",
    borderRadius: 20,
  },
  manualEntryText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
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
    color: "#333",
    lineHeight: 24,
  },
  modalActions: {
    paddingVertical: 20,
  },
  actionButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    backgroundColor: "#6B46C1",
    borderRadius: 12,
    alignItems: "center",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  // Manual Entry Modal Styles
  manualEntryModalContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  manualEntryModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  manualEntryModalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
  },
  manualEntryModalContent: {
    flex: 1,
    padding: 20,
  },
  manualEntryModalLabel: {
    fontSize: 16,
    color: "#666",
    marginBottom: 16,
  },
  manualEntryInput: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 16,
    fontSize: 18,
    backgroundColor: "#f9fafb",
    marginBottom: 24,
  },
  manualEntryModalActions: {
    flexDirection: "row",
    gap: 12,
  },
  manualEntryButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
  },
  manualEntryButtonCancel: {
    backgroundColor: "#f5f5f5",
  },
  manualEntryButtonScan: {
    backgroundColor: "#6B46C1",
  },
  manualEntryButtonDisabled: {
    opacity: 0.5,
  },
  manualEntryButtonCancelText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
  },
  manualEntryButtonScanText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
