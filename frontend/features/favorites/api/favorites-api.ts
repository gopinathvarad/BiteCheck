/**
 * Favorites API
 *
 * API client functions for managing user favorites
 */

import apiClient from "../../../shared/api/client";
import {
  FavoritesResponse,
  AddFavoriteRequest,
  AddFavoriteResponse,
  RemoveFavoriteResponse,
  FavoriteStatusResponse,
} from "../model/types";

/**
 * Fetch paginated list of user favorites
 *
 * @param page - Page number (1-indexed)
 * @param limit - Number of items per page
 * @returns Paginated favorites list
 */
export async function getFavorites(
  page: number = 1,
  limit: number = 20
): Promise<FavoritesResponse> {
  const response = await apiClient.get<FavoritesResponse>("/favorites", {
    params: { page, limit },
  });
  return response.data;
}

/**
 * Add a product to favorites
 *
 * @param productId - The product ID to add
 * @returns The created favorite item
 */
export async function addFavorite(
  productId: string
): Promise<AddFavoriteResponse> {
  const request: AddFavoriteRequest = { product_id: productId };
  const response = await apiClient.post<AddFavoriteResponse>(
    "/favorites",
    request
  );
  return response.data;
}

/**
 * Remove a product from favorites
 *
 * @param productId - The product ID to remove
 * @returns Success response
 */
export async function removeFavorite(
  productId: string
): Promise<RemoveFavoriteResponse> {
  const response = await apiClient.delete<RemoveFavoriteResponse>(
    `/favorites/${productId}`
  );
  return response.data;
}

/**
 * Check if a product is in favorites
 *
 * @param productId - The product ID to check
 * @returns Favorite status
 */
export async function checkFavoriteStatus(
  productId: string
): Promise<FavoriteStatusResponse> {
  const response = await apiClient.get<FavoriteStatusResponse>(
    `/favorites/${productId}/check`
  );
  return response.data;
}
