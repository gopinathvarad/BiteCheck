import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Animated,
  Dimensions,
  Modal,
  TextInput,
  Platform,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import apiClient from '../../lib/api';
import { Product } from '../../types';

const { width, height } = Dimensions.get('window');
const SCAN_FRAME_SIZE = width * 0.7;

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [flash, setFlash] = useState<'on' | 'off'>('off');
  const [scanning, setScanning] = useState(true);
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scanLineAnim] = useState(new Animated.Value(0));
  const [manualEntryVisible, setManualEntryVisible] = useState(false);
  const [manualEntryCode, setManualEntryCode] = useState('');
  const router = useRouter();

  // Animate scanning line
  useEffect(() => {
    if (scanning && !scanned) {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(scanLineAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(scanLineAnim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
      return () => animation.stop();
    }
  }, [scanning, scanned]);

  // Request camera permission on mount
  useEffect(() => {
    if (permission && !permission.granted && !permission.canAskAgain) {
      Alert.alert(
        'Camera Permission Required',
        'Please enable camera access in your device settings to scan products.',
        [{ text: 'OK' }]
      );
    }
  }, [permission]);

  const handleBarCodeScanned = async ({ type, data }: BarcodeScanningResult) => {
    if (scanned || loading) return;

    setScanned(true);
    setScanning(false);
    setLoading(true);

    try {
      // Call scan API
      const response = await apiClient.post('/scan', {
        code: data,
        type: type,
      });

      if (response.data && response.data.success !== false) {
        const product: Product = response.data.data || response.data;
        
        // Navigate to product detail (we'll create this screen)
        // For now, show alert with product info
        Alert.alert(
          'Product Found!',
          `Name: ${product.name || 'Unknown'}\nBarcode: ${product.barcode}`,
          [
            {
              text: 'View Details',
              onPress: () => {
                // TODO: Navigate to product detail screen
                resetScanner();
              },
            },
            {
              text: 'Scan Again',
              onPress: resetScanner,
            },
          ]
        );
      } else {
        throw new Error('Product not found');
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.detail ||
        error.message ||
        'Failed to scan product';
      
      Alert.alert(
        'Scan Failed',
        errorMessage,
        [
          {
            text: 'Try Again',
            onPress: resetScanner,
          },
          {
            text: 'Manual Entry',
            onPress: () => {
              // TODO: Open manual entry modal
              resetScanner();
            },
          },
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const resetScanner = () => {
    setScanned(false);
    setScanning(true);
  };

  const toggleFlash = () => {
    setFlash(flash === 'off' ? 'on' : 'off');
  };

  const toggleCameraFacing = () => {
    setFacing(facing === 'back' ? 'front' : 'back');
  };

  const openGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant access to your photo library.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      // TODO: Process image for barcode detection
      Alert.alert('Coming Soon', 'Image barcode detection will be available soon.');
    }
  };

  const openManualEntry = () => {
    setManualEntryVisible(true);
    setManualEntryCode('');
  };

  const handleManualScan = async () => {
    if (!manualEntryCode.trim()) {
      Alert.alert('Error', 'Please enter a barcode or QR code.');
      return;
    }

    setManualEntryVisible(false);
    setScanned(true);
    setScanning(false);
    setLoading(true);

    try {
      const response = await apiClient.post('/scan', {
        code: manualEntryCode.trim(),
      });

      if (response.data && response.data.success !== false) {
        const product: Product = response.data.data || response.data;
        Alert.alert(
          'Product Found!',
          `Name: ${product.name || 'Unknown'}\nBarcode: ${product.barcode}`,
          [
            {
              text: 'View Details',
              onPress: () => {
                // TODO: Navigate to product detail screen
                resetScanner();
              },
            },
            {
              text: 'Scan Again',
              onPress: resetScanner,
            },
          ]
        );
      } else {
        throw new Error('Product not found');
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.detail ||
        error.message ||
        'Failed to scan product';

      Alert.alert('Scan Failed', errorMessage, [
        { text: 'OK', onPress: resetScanner },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Checking permissions...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <Ionicons name="camera-outline" size={64} color="#4CAF50" />
          <Text style={styles.permissionTitle}>Camera Access Required</Text>
          <Text style={styles.permissionText}>
            We need access to your camera to scan product barcodes and QR codes.
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={requestPermission}
          >
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const scanLineTranslateY = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-SCAN_FRAME_SIZE / 2, SCAN_FRAME_SIZE / 2],
  });

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <CameraView
        style={styles.camera}
        facing={facing}
        barcodeScannerSettings={{
          barcodeTypes: [
            'ean13',
            'ean8',
            'upc_a',
            'upc_e',
            'qr',
            'code128',
            'code39',
            'code93',
            'itf14',
          ],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        enableTorch={flash === 'on'}
      >
        {/* Top overlay */}
        <View style={styles.topOverlay}>
          <Text style={styles.instructionText}>
            {loading ? 'Scanning code...' : 'Place barcode inside the frame'}
          </Text>
        </View>

        {/* Scanning frame overlay */}
        <View style={styles.frameContainer}>
          <View style={styles.scanFrame}>
            {/* Corner indicators */}
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
            
            {/* Scanning line */}
            {scanning && !scanned && (
              <Animated.View
                style={[
                  styles.scanLine,
                  {
                    transform: [{ translateY: scanLineTranslateY }],
                  },
                ]}
              />
            )}
          </View>
        </View>

        {/* Bottom controls */}
        <View style={styles.controlsContainer}>
          <View style={styles.controlsRow}>
            {/* Gallery button */}
            <TouchableOpacity
              style={styles.controlButton}
              onPress={openGallery}
              disabled={loading}
            >
              <Ionicons name="images-outline" size={28} color="#fff" />
            </TouchableOpacity>

            {/* Shutter button */}
            <TouchableOpacity
              style={styles.shutterButton}
              onPress={resetScanner}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="large" color="#fff" />
              ) : scanned ? (
                <Ionicons name="refresh" size={32} color="#fff" />
              ) : (
                <View style={styles.shutterInner} />
              )}
            </TouchableOpacity>

            {/* Flash button */}
            <TouchableOpacity
              style={styles.controlButton}
              onPress={toggleFlash}
              disabled={loading}
            >
              <Ionicons
                name={flash === 'on' ? 'flash' : 'flash-off'}
                size={28}
                color="#fff"
              />
            </TouchableOpacity>
          </View>

          {/* Manual entry button */}
          <TouchableOpacity
            style={styles.manualEntryButton}
            onPress={openManualEntry}
            disabled={loading}
          >
            <Ionicons name="create-outline" size={20} color="#fff" />
            <Text style={styles.manualEntryText}>Enter code manually</Text>
          </TouchableOpacity>
        </View>
      </CameraView>

      {/* Manual Entry Modal */}
      <Modal
        visible={manualEntryVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setManualEntryVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enter Barcode</Text>
            <Text style={styles.modalSubtitle}>
              Type the barcode or QR code number
            </Text>
            <TextInput
              style={styles.modalInput}
              value={manualEntryCode}
              onChangeText={setManualEntryCode}
              placeholder="Enter code..."
              placeholderTextColor="#999"
              autoFocus
              keyboardType="number-pad"
              returnKeyType="done"
              onSubmitEditing={handleManualScan}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  setManualEntryVisible(false);
                  setManualEntryCode('');
                }}
              >
                <Text style={styles.modalButtonTextCancel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonScan]}
                onPress={handleManualScan}
              >
                <Text style={styles.modalButtonTextScan}>Scan</Text>
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
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  topOverlay: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  instructionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  frameContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: SCAN_FRAME_SIZE,
    height: SCAN_FRAME_SIZE,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#4CAF50',
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
    position: 'absolute',
    width: SCAN_FRAME_SIZE,
    height: 2,
    backgroundColor: '#4CAF50',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 5,
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 40,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shutterButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  shutterInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
  },
  manualEntryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  manualEntryText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 8,
    fontWeight: '500',
  },
  loadingText: {
    marginTop: 16,
    color: '#fff',
    fontSize: 16,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#fff',
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  permissionButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#000',
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    marginBottom: 24,
    backgroundColor: '#f9f9f9',
    color: '#000',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 6,
  },
  modalButtonCancel: {
    backgroundColor: '#f0f0f0',
  },
  modalButtonScan: {
    backgroundColor: '#4CAF50',
  },
  modalButtonTextCancel: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  modalButtonTextScan: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
