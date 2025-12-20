/**
 * Scan History Hook
 *
 * Provides unified access to scan history for both guests (local) and authenticated users (remote).
 */

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../auth/lib/auth-context";
import { getLocalScans } from "./local-scan-storage";
import { getUserScanHistory } from "../api/history-api";
import { ScanHistoryItem, LocalScanRecord } from "../model/types";

const HISTORY_QUERY_KEY = "scan-history";

/**
 * Convert local scan records to unified history items
 */
function localScansToHistoryItems(scans: LocalScanRecord[]): ScanHistoryItem[] {
  return scans.map((scan) => ({
    id: scan.id,
    barcode: scan.barcode,
    product: scan.productSnapshot,
    scannedAt: scan.scannedAt,
    isLocal: true,
  }));
}

/**
 * Hook to access scan history
 *
 * For guests: Returns locally stored scans
 * For authenticated users: Fetches from API
 */
export function useScanHistory(page: number = 1, limit: number = 20) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isAuthenticated = !!user;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [HISTORY_QUERY_KEY, isAuthenticated, page, limit],
    queryFn: async () => {
      if (isAuthenticated) {
        // Fetch from API for authenticated users
        const response = await getUserScanHistory(page, limit);
        return {
          scans: response.data.scans,
          page: response.data.page,
          totalPages: response.data.total_pages,
          totalCount: response.data.total_count,
        };
      } else {
        // Get local scans for guests
        const localScans = await getLocalScans();
        const historyItems = localScansToHistoryItems(localScans);

        // Apply pagination locally
        const startIndex = (page - 1) * limit;
        const paginatedScans = historyItems.slice(
          startIndex,
          startIndex + limit
        );

        return {
          scans: paginatedScans,
          page,
          totalPages: Math.ceil(historyItems.length / limit) || 1,
          totalCount: historyItems.length,
        };
      }
    },
    staleTime: 30 * 1000, // 30 seconds
  });

  /**
   * Invalidate and refetch history
   */
  const invalidateHistory = () => {
    queryClient.invalidateQueries({ queryKey: [HISTORY_QUERY_KEY] });
  };

  return {
    scans: data?.scans ?? [],
    page: data?.page ?? 1,
    totalPages: data?.totalPages ?? 1,
    totalCount: data?.totalCount ?? 0,
    isLoading,
    error,
    refetch,
    invalidateHistory,
    isAuthenticated,
  };
}

/**
 * Hook to get just the scan count (for badges, etc.)
 */
export function useScanCount() {
  const { user } = useAuth();
  const isAuthenticated = !!user;

  const { data: count = 0 } = useQuery({
    queryKey: [HISTORY_QUERY_KEY, "count", isAuthenticated],
    queryFn: async () => {
      if (isAuthenticated) {
        const response = await getUserScanHistory(1, 1);
        return response.data.total_count;
      } else {
        const localScans = await getLocalScans();
        return localScans.length;
      }
    },
    staleTime: 60 * 1000, // 1 minute
  });

  return count;
}
