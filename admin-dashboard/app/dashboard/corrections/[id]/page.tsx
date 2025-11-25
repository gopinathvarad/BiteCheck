/**
 * Correction Detail and Review Page
 */
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { apiClient } from "@/lib/api-client";
import { Correction } from "@/lib/types";
import { format } from "date-fns";
import Image from "next/image";

export default function CorrectionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const correctionId = params?.id as string;

  const [correction, setCorrection] = useState<Correction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [approveNotes, setApproveNotes] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);

  useEffect(() => {
    const loadCorrection = async () => {
      try {
        const supabase = createClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          apiClient.setToken(session.access_token);
          const data = await apiClient.getCorrection(correctionId);
          setCorrection(data);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load correction");
      } finally {
        setLoading(false);
      }
    };

    if (correctionId) {
      loadCorrection();
    }
  }, [correctionId]);

  const handleApprove = async () => {
    setActionLoading(true);
    setError("");

    try {
      await apiClient.approveCorrection(correctionId, { notes: approveNotes });
      router.push("/dashboard/corrections");
    } catch (err: any) {
      setError(err.message || "Failed to approve correction");
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      setError("Rejection reason is required");
      return;
    }

    setActionLoading(true);
    setError("");

    try {
      await apiClient.rejectCorrection(correctionId, { reason: rejectReason });
      router.push("/dashboard/corrections");
    } catch (err: any) {
      setError(err.message || "Failed to reject correction");
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading correction...</p>
        </div>
      </div>
    );
  }

  if (!correction) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          Correction not found
        </div>
      </div>
    );
  }

  const isPending = correction.status === "pending";

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="text-blue-600 hover:text-blue-700 mb-4 flex items-center"
        >
          ← Back to Corrections
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Correction Review
            </h1>
            <p className="text-gray-600 mt-2">
              Submitted {format(new Date(correction.submitted_at), "PPpp")}
            </p>
          </div>
          <span
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              correction.status === "pending"
                ? "bg-yellow-100 text-yellow-800"
                : correction.status === "approved"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {correction.status.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Product Info */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Product Information
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Product Name</p>
            <p className="font-medium text-gray-900">
              {correction.product_name || "Unknown"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Barcode</p>
            <p className="font-medium text-gray-900">
              {correction.product_barcode || "N/A"}
            </p>
          </div>
        </div>
      </div>

      {/* Correction Details */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Correction Details
        </h2>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">Field Name</p>
            <p className="font-medium text-gray-900">{correction.field_name}</p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-2">Current Value</p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-gray-900 whitespace-pre-wrap line-through">
                  {correction.old_value}
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Proposed Value</p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-gray-900 whitespace-pre-wrap">
                  {correction.new_value}
                </p>
              </div>
            </div>
          </div>

          {correction.photo_url && (
            <div>
              <p className="text-sm text-gray-600 mb-2">Photo Evidence</p>
              <div className="relative w-full max-w-md h-64 bg-gray-100 rounded-lg overflow-hidden">
                <Image
                  src={correction.photo_url}
                  alt="Correction evidence"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Review Info (if reviewed) */}
      {!isPending && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Review Information
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Reviewed At</p>
              <p className="font-medium text-gray-900">
                {correction.reviewed_at
                  ? format(new Date(correction.reviewed_at), "PPpp")
                  : "N/A"}
              </p>
            </div>
            {correction.review_notes && (
              <div>
                <p className="text-sm text-gray-600">Notes</p>
                <p className="font-medium text-gray-900">
                  {correction.review_notes}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Actions (only for pending corrections) */}
      {isPending && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Actions</h2>
          <div className="flex space-x-4">
            <button
              onClick={() => setShowApproveModal(true)}
              disabled={actionLoading}
              className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ✅ Approve Correction
            </button>
            <button
              onClick={() => setShowRejectModal(true)}
              disabled={actionLoading}
              className="flex-1 bg-red-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ❌ Reject Correction
            </button>
          </div>
        </div>
      )}

      {/* Approve Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Approve Correction
            </h3>
            <p className="text-gray-600 mb-4">
              This will apply the correction to the product. You can optionally
              add notes.
            </p>
            <textarea
              value={approveNotes}
              onChange={(e) => setApproveNotes(e.target.value)}
              placeholder="Optional notes..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition mb-4"
              rows={3}
            />
            <div className="flex space-x-3">
              <button
                onClick={() => setShowApproveModal(false)}
                className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                disabled={actionLoading}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50"
              >
                {actionLoading ? "Approving..." : "Confirm Approval"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Reject Correction
            </h3>
            <p className="text-gray-600 mb-4">
              Please provide a reason for rejecting this correction.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason for rejection (required)..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition mb-4"
              rows={3}
              required
            />
            <div className="flex space-x-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading || !rejectReason.trim()}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-700 transition disabled:opacity-50"
              >
                {actionLoading ? "Rejecting..." : "Confirm Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
