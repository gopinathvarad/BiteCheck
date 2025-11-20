import { useQuery } from '@tanstack/react-query';
import { getProductById } from './product-api';
import { Product } from '../../../entities/product/model/types';

export function useProduct(productId: string) {
  return useQuery({
    queryKey: ['product', productId],
    queryFn: () => getProductById(productId),
    enabled: !!productId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

