import apiClient from '../../../shared/api/client';
import { Product } from '../../../entities/product/model/types';

export interface ScanRequest {
  code: string;
  type: 'barcode' | 'qr';
  country?: string;
}

export interface ScanResponse {
  success: boolean;
  data: Product;
  message?: string;
  timestamp?: string;
}

export async function scanProduct(request: ScanRequest): Promise<ScanResponse> {
  const response = await apiClient.post<ScanResponse>('/scan', request);
  return response.data;
}

