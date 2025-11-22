import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  Platform,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ManualBarcodeEntryProps {
  visible: boolean;
  onClose: () => void;
  onScan: (code: string) => void;
}

export function ManualBarcodeEntry({
  visible,
  onClose,
  onScan,
}: ManualBarcodeEntryProps) {
  const [manualBarcode, setManualBarcode] = useState("");

  const handleManualScan = () => {
    if (manualBarcode && manualBarcode.trim()) {
      onScan(manualBarcode.trim());
      setManualBarcode("");
      onClose();
    }
  };

  const handleClose = () => {
    setManualBarcode("");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.manualEntryModalContainer}>
        <View style={styles.manualEntryModalHeader}>
          <Text style={styles.manualEntryModalTitle}>Enter Barcode</Text>
          <TouchableOpacity onPress={handleClose}>
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
              style={[styles.manualEntryButton, styles.manualEntryButtonCancel]}
              onPress={handleClose}
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
  );
}

const styles = StyleSheet.create({
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
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  manualEntryModalContent: {
    padding: 20,
  },
  manualEntryModalLabel: {
    fontSize: 16,
    color: "#666",
    marginBottom: 12,
  },
  manualEntryInput: {
    backgroundColor: "#f5f5f5",
    padding: 16,
    borderRadius: 12,
    fontSize: 18,
    color: "#000",
    marginBottom: 24,
  },
  manualEntryModalActions: {
    flexDirection: "row",
    gap: 12,
  },
  manualEntryButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
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
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  manualEntryButtonScanText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});
