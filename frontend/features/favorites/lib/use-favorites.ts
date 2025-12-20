/**
 * Favorites Hooks
 *
 * React Query hooks for managing favorites
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query";
import { useAuth } from "../../auth/lib/auth-context";
import {
  getFavorites,
  addFavorite,
  removeFavorite,
  checkFavoriteStatus,
} from "../api/favorites-api";
import { FavoriteItem } from "../model/types";

const FAVORITES_QUERY_KEY = "favorites";
const FAVORITE_STATUS_QUERY_KEY = "favorite-status";

/**
 * Hook to fetch paginated favorites list
 */
export function useFavorites(page: number = 1, limit: number = 20) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isAuthenticated = !!user;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [FAVORITES_QUERY_KEY, page, limit],
    queryFn: async () => {
      const response = await getFavorites(page, limit);
      return {
        favorites: response.data.favorites,
        page: response.data.page,
        totalPages: response.data.total_pages,
        totalCount: response.data.total_count,
      };
    },
    enabled: isAuthenticated,
    staleTime: 30 * 1000, // 30 seconds
  });

  const invalidateFavorites = () => {
    queryClient.invalidateQueries({ queryKey: [FAVORITES_QUERY_KEY] });
    queryClient.invalidateQueries({ queryKey: [FAVORITE_STATUS_QUERY_KEY] });
  };

  return {
    favorites: data?.favorites ?? [],
    page: data?.page ?? 1,
    totalPages: data?.totalPages ?? 1,
    totalCount: data?.totalCount ?? 0,
    isLoading,
    error,
    refetch,
    invalidateFavorites,
    isAuthenticated,
  };
}

/**
 * Hook to check if a product is favorited
 */
export function useFavoriteStatus(productId: string | undefined) {
  const { user } = useAuth();
  const isAuthenticated = !!user;

  return useQuery({
    queryKey: [FAVORITE_STATUS_QUERY_KEY, productId],
    queryFn: async () => {
      if (!productId) return { isFavorite: false, favoriteId: undefined };
      const response = await checkFavoriteStatus(productId);
      return {
        isFavorite: response.data.is_favorite,
        favoriteId: response.data.favorite_id,
      };
    },
    enabled: isAuthenticated && !!productId,
    staleTime: 30 * 1000,
  });
}

/**
 * Hook to toggle favorite status (add/remove)
 */
export function useToggleFavorite() {
  const queryClient = useQueryClient();

  const addMutation = useMutation({
    mutationFn: addFavorite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [FAVORITES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [FAVORITE_STATUS_QUERY_KEY] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: removeFavorite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [FAVORITES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [FAVORITE_STATUS_QUERY_KEY] });
    },
  });

  const toggle = async (productId: string, isFavorite: boolean) => {
    if (isFavorite) {
      await removeMutation.mutateAsync(productId);
    } else {
      await addMutation.mutateAsync(productId);
    }
  };

  return {
    toggle,
    isLoading: addMutation.isPending || removeMutation.isPending,
    error: addMutation.error || removeMutation.error,
  };
}

/**
 * Hook to get favorites count (for badges)
 */
export function useFavoritesCount() {
  const { user } = useAuth();
  const isAuthenticated = !!user;

  const { data: count = 0 } = useQuery({
    queryKey: [FAVORITES_QUERY_KEY, "count"],
    queryFn: async () => {
      const response = await getFavorites(1, 1);
      return response.data.total_count;
    },
    enabled: isAuthenticated,
    staleTime: 60 * 1000, // 1 minute
  });

  return count;
}
