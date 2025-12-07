import React, { useState, useRef } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from "react-native";
import { CameraView, CameraType, BarcodeScanningResult } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import { ScanOverlay } from "./scan-overlay";
import { colors, AppText } from "../../../shared/ui";

interface ScanCameraViewProps {
  onScan: (result: BarcodeScanningResult) => void;
  onManualEntry: () => void;
  scanning: boolean;
  scanned: boolean;
}

export function ScanCameraView({
  onScan,
  onManualEntry,
  scanning,
  scanned,
}: ScanCameraViewProps) {
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [cameraType, setCameraType] = useState<CameraType>("back");
  const cameraRef = useRef<CameraView>(null);

  const handleFlashToggle = () => {
    setFlashEnabled(!flashEnabled);
  };

  const handleGalleryPress = () => {
    // Alert.alert("Coming Soon", "Gallery scanning will be available soon.");
    // Using simple alert for now as it is inside camera view
  };

  return (
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
      onBarcodeScanned={scanned || scanning ? undefined : onScan}
      enableTorch={flashEnabled}
    >
      <ScanOverlay scanning={scanning} scanned={scanned} />

      {/* Bottom Controls Overlay */}
      <View style={styles.controlsOverlay}>
        <View style={styles.bottomControls}>
          {/* Gallery Button */}
          <TouchableOpacity
            style={styles.controlButton}
            onPress={handleGalleryPress}
            disabled={scanning}
          >
            <Ionicons name="images-outline" size={28} color="#fff" />
          </TouchableOpacity>

          {/* Shutter Button (Visual only, since scanning is automatic) */}
          <TouchableOpacity
            style={[
              styles.shutterButton,
              scanning && styles.shutterButtonDisabled,
            ]}
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
          onPress={onManualEntry}
          disabled={scanning}
        >
          <AppText variant="button" style={styles.manualEntryText}>
            Enter barcode manually
          </AppText>
        </TouchableOpacity>
      </View>
    </CameraView>
  );
}

const styles = StyleSheet.create({
  camera: {
    flex: 1,
  },
  controlsOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 40,
  },
  bottomControls: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 40,
    marginBottom: 20,
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
    backgroundColor: colors.primary, // Updated to theme color
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
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignSelf: "center",
    backgroundColor: colors.primary + "CC", // Updated to theme color with opacity
    borderRadius: 20,
  },
  manualEntryText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
