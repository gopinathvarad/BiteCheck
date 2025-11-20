// Scan entity types
import { Product } from '../../product/model/types';

export interface Scan {
  id: string;
  user_id?: string;
  product_id: string;
  scanned_at: string;
  result_snapshot?: Product;
}

