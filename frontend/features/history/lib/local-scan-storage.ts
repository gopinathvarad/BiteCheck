/**
 * Local Storage Wrapper for Guest Scan History
 *
 * Uses AsyncStorage to persist scan history for guest (unauthenticated) users.
 * Data is migrated to the server when the user signs up or logs in.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { Product } from "../../../entities/product/model/types";
import { LocalScanRecord } from "../model/types";

const STORAGE_KEY = "@bitecheck/guest_scans";
const MAX_LOCAL_SCANS = 100; // Limit to prevent storage bloat

/**
 * Generate a unique ID for local scans
 */
function generateLocalId(): string {
  return `local_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Save a product scan to local storage
 *
 * @param product - The scanned product to save
 * @returns The created scan record
 */
export async function saveLocalScan(
  product: Product
): Promise<LocalScanRecord> {
  const scanRecord: LocalScanRecord = {
    id: generateLocalId(),
    barcode: product.barcode,
    productSnapshot: product,
    scannedAt: new Date().toISOString(),
  };

  try {
    const existingScans = await getLocalScans();

    // Add new scan at the beginning (most recent first)
    const updatedScans = [scanRecord, ...existingScans];

    // Limit storage size
    const trimmedScans = updatedScans.slice(0, MAX_LOCAL_SCANS);

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(trimmedScans));

    return scanRecord;
  } catch (error) {
    console.error("Error saving local scan:", error);
    throw error;
  }
}

/**
 * Get all locally stored scans
 *
 * @returns Array of local scan records, most recent first
 */
export async function getLocalScans(): Promise<LocalScanRecord[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);

    if (!data) {
      return [];
    }

    return JSON.parse(data) as LocalScanRecord[];
  } catch (error) {
    console.error("Error loading local scans:", error);
    return [];
  }
}

/**
 * Check if there are any local scans to migrate
 *
 * @returns True if local scans exist
 */
export async function hasLocalScans(): Promise<boolean> {
  try {
    const scans = await getLocalScans();
    return scans.length > 0;
  } catch {
    return false;
  }
}

/**
 * Get the count of local scans
 *
 * @returns Number of local scans
 */
export async function getLocalScanCount(): Promise<number> {
  try {
    const scans = await getLocalScans();
    return scans.length;
  } catch {
    return 0;
  }
}

/**
 * Clear all local scans (typically after successful migration)
 */
export async function clearLocalScans(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Error clearing local scans:", error);
    throw error;
  }
}

/**
 * Remove a specific scan from local storage
 *
 * @param scanId - The ID of the scan to remove
 */
export async function removeLocalScan(scanId: string): Promise<void> {
  try {
    const scans = await getLocalScans();
    const filteredScans = scans.filter((scan) => scan.id !== scanId);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filteredScans));
  } catch (error) {
    console.error("Error removing local scan:", error);
    throw error;
  }
}
