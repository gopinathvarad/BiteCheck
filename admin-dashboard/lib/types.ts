/**
 * TypeScript types for admin dashboard
 */

export interface Correction {
  id: string;
  product_id: string;
  product_name?: string;
  product_barcode?: string;
  field_name: string;
  old_value: string;
  new_value: string;
  photo_url?: string;
  status: "pending" | "approved" | "rejected";
  submitted_at: string;
  reviewed_at?: string;
  submitter_user_id?: string;
  reviewer_user_id?: string;
  review_notes?: string;
}

export interface CorrectionListResponse {
  corrections: Correction[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface AdminStats {
  total_corrections: number;
  pending_corrections: number;
  approved_corrections: number;
  rejected_corrections: number;
  approval_rate: number;
  recent_corrections: Correction[];
}

export interface ApproveRequest {
  notes?: string;
}

export interface RejectRequest {
  reason: string;
}
