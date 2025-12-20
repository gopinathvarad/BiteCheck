/**
 * History Feature Exports
 */

// API
export { getUserScanHistory, migrateGuestScans } from "./api/history-api";

// Hooks
export { useScanHistory, useScanCount } from "./lib/use-scan-history";

// Local Storage
export {
  saveLocalScan,
  getLocalScans,
  clearLocalScans,
  hasLocalScans,
  getLocalScanCount,
  removeLocalScan,
} from "./lib/local-scan-storage";

// Migration
export {
  migrateLocalScansToAccount,
  checkMigrationNeeded,
} from "./lib/migrate-guest-scans";

// Types
export type {
  LocalScanRecord,
  ScanHistoryItem,
  ScanHistoryResponse,
  MigrateScansRequest,
  MigrateScansResponse,
} from "./model/types";
