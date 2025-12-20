/**
 * Guest Scans Migration
 *
 * Handles migrating locally stored guest scans to the user's account on signup/signin.
 */

import {
  getLocalScans,
  clearLocalScans,
  hasLocalScans,
} from "./local-scan-storage";
import { migrateGuestScans } from "../api/history-api";
import { LocalScanRecord } from "../model/types";

/**
 * Migrate all local guest scans to the authenticated user's account
 *
 * @returns Object with success status and count of migrated scans
 */
export async function migrateLocalScansToAccount(): Promise<{
  success: boolean;
  migratedCount: number;
  error?: string;
}> {
  try {
    // Check if there are scans to migrate
    const hasScans = await hasLocalScans();
    if (!hasScans) {
      return { success: true, migratedCount: 0 };
    }

    // Get all local scans
    const localScans = await getLocalScans();

    if (localScans.length === 0) {
      return { success: true, migratedCount: 0 };
    }

    // Transform to API request format
    const migrateRequest = {
      scans: localScans.map((scan: LocalScanRecord) => ({
        barcode: scan.barcode,
        product_id: scan.productSnapshot.id,
        result_snapshot: scan.productSnapshot,
        scanned_at: scan.scannedAt,
      })),
    };

    // Send to backend
    const response = await migrateGuestScans(migrateRequest);

    if (response.success) {
      // Clear local scans after successful migration
      await clearLocalScans();

      return {
        success: true,
        migratedCount: response.data.migrated_count,
      };
    }

    return {
      success: false,
      migratedCount: 0,
      error: response.message || "Migration failed",
    };
  } catch (error: any) {
    console.error("Error migrating guest scans:", error);

    // Don't block the auth flow - just log the error
    // User can still use the app, scans remain local
    return {
      success: false,
      migratedCount: 0,
      error: error?.message || "Migration failed",
    };
  }
}

/**
 * Check if migration is needed (has local scans)
 */
export async function checkMigrationNeeded(): Promise<boolean> {
  return hasLocalScans();
}
