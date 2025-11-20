import apiClient from '../../../shared/api/client';
import { Product } from '../../../entities/product/model/types';

export interface ProductResponse {
  success: boolean;
  data: Product;
  message?: string;
  timestamp?: string;
}

export async function getProductById(productId: string): Promise<ProductResponse> {
  const response = await apiClient.get<ProductResponse>(`/product/${productId}`);
  return response.data;
}

