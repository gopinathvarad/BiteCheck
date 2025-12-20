/**
 * History API
 *
 * API client functions for authenticated user scan history
 */

import apiClient from "../../../shared/api/client";
import {
  ScanHistoryResponse,
  MigrateScansRequest,
  MigrateScansResponse,
} from "../model/types";

/**
 * Fetch paginated scan history for the authenticated user
 *
 * @param page - Page number (1-indexed)
 * @param limit - Number of items per page
 * @returns Paginated scan history
 */
export async function getUserScanHistory(
  page: number = 1,
  limit: number = 20
): Promise<ScanHistoryResponse> {
  const response = await apiClient.get<ScanHistoryResponse>("/user/history", {
    params: { page, limit },
  });
  return response.data;
}

/**
 * Migrate guest scans to the authenticated user's account
 *
 * @param request - The scans to migrate
 * @returns Migration result with count of migrated scans
 */
export async function migrateGuestScans(
  request: MigrateScansRequest
): Promise<MigrateScansResponse> {
  const response = await apiClient.post<MigrateScansResponse>(
    "/user/history/migrate",
    request
  );
  return response.data;
}
