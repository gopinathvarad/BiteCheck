/**
 * Favorites Feature Types
 *
 * Types for managing user favorite products
 */

import { Product } from "../../../entities/product/model/types";

/**
 * Product data within a favorite item
 */
export interface FavoriteProduct {
  id: string;
  barcode?: string;
  name: string;
  brand?: string;
  images?: string[];
  health_score?: number;
  nutri_score?: string;
}

/**
 * A single favorite item from the API
 */
export interface FavoriteItem {
  id: string;
  product_id: string;
  product: FavoriteProduct | null;
  created_at: string;
}

/**
 * Response from the favorites list API
 */
export interface FavoritesResponse {
  success: boolean;
  data: {
    favorites: FavoriteItem[];
    page: number;
    total_pages: number;
    total_count: number;
  };
  message?: string;
}

/**
 * Request to add a product to favorites
 */
export interface AddFavoriteRequest {
  product_id: string;
}

/**
 * Response from adding a favorite
 */
export interface AddFavoriteResponse {
  success: boolean;
  data: FavoriteItem;
  message?: string;
}

/**
 * Response from removing a favorite
 */
export interface RemoveFavoriteResponse {
  success: boolean;
  data: {
    removed: boolean;
  };
  message?: string;
}

/**
 * Response from checking favorite status
 */
export interface FavoriteStatusResponse {
  success: boolean;
  data: {
    is_favorite: boolean;
    favorite_id?: string;
  };
  message?: string;
}
