/**
 * History Feature Types
 *
 * Types for managing scan history both locally (guests) and remotely (authenticated users)
 */

import { Product } from "../../../entities/product/model/types";

/**
 * A scan record stored locally for guest users
 */
export interface LocalScanRecord {
  id: string;
  barcode: string;
  productSnapshot: Product;
  scannedAt: string; // ISO 8601 timestamp
}

/**
 * A unified scan history item (can be from local or remote storage)
 */
export interface ScanHistoryItem {
  id: string;
  barcode: string;
  product: Product | null;
  scannedAt: string;
  isLocal: boolean; // True for guest scans stored locally
}

/**
 * Response from the scan history API
 */
export interface ScanHistoryResponse {
  success: boolean;
  data: {
    scans: ScanHistoryItem[];
    page: number;
    total_pages: number;
    total_count: number;
  };
  message?: string;
}

/**
 * Request body for migrating guest scans
 */
export interface MigrateScansRequest {
  scans: {
    barcode: string;
    product_id?: string;
    result_snapshot: Product;
    scanned_at: string;
  }[];
}

/**
 * Response from migration API
 */
export interface MigrateScansResponse {
  success: boolean;
  data: {
    migrated_count: number;
  };
  message?: string;
}
