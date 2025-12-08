import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Modal,
  Platform,
  Alert,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  AppText,
  AppButton,
  Input,
  ScreenWrapper,
  colors,
  layout,
} from "@/shared/ui";

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
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <View style={styles.header}>
            <AppText variant="h3">Enter Barcode</AppText>
            <Ionicons
              name="close"
              size={24}
              color={colors.text.primary}
              onPress={handleClose}
            />
          </View>

          <View style={styles.content}>
            <AppText variant="body" style={styles.description}>
              Type the barcode number manually from the product packaging.
            </AppText>

            <Input
              value={manualBarcode}
              onChangeText={(text) => {
                const numericText = text.replace(/[^0-9]/g, "");
                setManualBarcode(numericText);
              }}
              placeholder="e.g. 1234567890123"
              keyboardType="numeric"
              returnKeyType="done"
              onSubmitEditing={handleManualScan}
              autoFocus
              label="Barcode Number"
            />

            <View style={styles.actions}>
              <View style={styles.buttonWrapper}>
                <AppButton
                  title="Cancel"
                  variant="outline"
                  onPress={handleClose}
                />
              </View>
              <View style={styles.buttonWrapper}>
                <AppButton
                  title="Scan"
                  variant="primary"
                  onPress={handleManualScan}
                  disabled={!manualBarcode || !manualBarcode.trim()}
                  icon={
                    <Ionicons
                      name="barcode-outline"
                      size={20}
                      color={colors.text.inverted}
                    />
                  }
                />
              </View>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: layout.spacing.l,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  content: {
    padding: layout.spacing.l,
    flex: 1,
  },
  description: {
    marginBottom: layout.spacing.xl,
    color: colors.text.secondary,
  },
  actions: {
    flexDirection: "row",
    gap: layout.spacing.m,
    marginTop: layout.spacing.xl,
  },
  buttonWrapper: {
    flex: 1,
  },
});
