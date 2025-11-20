import apiClient from '../../../shared/api/client';
import { Product } from '../../../entities/product/model/types';

export interface ProductResponse {
  success: boolean;
  data: Product;
  message?: string;
  timestamp?: string;
}

export async function getProductById(productId: string): Promise<ProductResponse> {
  const response = await apiClient.get<Product | ProductResponse>(`/product/${productId}`);
  const data = response.data;
  
  // Handle both wrapped and direct Product responses
  if ('success' in data && 'data' in data) {
    // Already wrapped in ProductResponse format
    return data as ProductResponse;
  } else {
    // Direct Product response, wrap it
    return {
      success: true,
      data: data as Product,
    };
  }
}

