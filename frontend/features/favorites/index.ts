/**
 * Favorites Feature Exports
 */

// Types
export type {
  FavoriteItem,
  FavoriteProduct,
  FavoritesResponse,
  AddFavoriteRequest,
  AddFavoriteResponse,
  RemoveFavoriteResponse,
  FavoriteStatusResponse,
} from "./model/types";

// API
export {
  getFavorites,
  addFavorite,
  removeFavorite,
  checkFavoriteStatus,
} from "./api/favorites-api";

// Hooks
export {
  useFavorites,
  useFavoriteStatus,
  useToggleFavorite,
  useFavoritesCount,
} from "./lib/use-favorites";
