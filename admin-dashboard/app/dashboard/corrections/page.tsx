/**
 * Corrections List Page
 */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { apiClient } from "@/lib/api-client";
import { Correction } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";

export default function CorrectionsPage() {
  const router = useRouter();
  const [corrections, setCorrections] = useState<Correction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const loadCorrections = async () => {
      try {
        const supabase = createClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          apiClient.setToken(session.access_token);
          const data = await apiClient.listCorrections(
            statusFilter || undefined,
            page,
            20
          );
          setCorrections(data.corrections);
          setTotalPages(data.total_pages);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load corrections");
      } finally {
        setLoading(false);
      }
    };

    loadCorrections();
  }, [statusFilter, page]);

  const handleStatusChange = (status: string) => {
    setStatusFilter(status);
    setPage(1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading corrections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Corrections</h1>
        <p className="text-gray-600 mt-2">
          Review and manage product corrections
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">
            Filter by status:
          </span>
          <div className="flex space-x-2">
            <button
              onClick={() => handleStatusChange("")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                statusFilter === ""
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All
            </button>
            <button
              onClick={() => handleStatusChange("pending")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                statusFilter === "pending"
                  ? "bg-yellow-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => handleStatusChange("approved")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                statusFilter === "approved"
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Approved
            </button>
            <button
              onClick={() => handleStatusChange("rejected")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                statusFilter === "rejected"
                  ? "bg-red-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Rejected
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Corrections List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="divide-y divide-gray-200">
          {corrections.length > 0 ? (
            corrections.map((correction) => (
              <div
                key={correction.id}
                onClick={() =>
                  router.push(`/dashboard/corrections/${correction.id}`)
                }
                className="px-6 py-4 hover:bg-gray-50 transition cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-semibold text-gray-900">
                        {correction.product_name || "Unknown Product"}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          correction.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : correction.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {correction.status}
                      </span>
                    </div>
                    <div className="mt-2 space-y-1">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Field:</span>{" "}
                        {correction.field_name}
                      </p>
                      <div className="flex items-start space-x-4 text-sm">
                        <div className="flex-1">
                          <span className="font-medium text-gray-700">
                            Old:
                          </span>
                          <span className="text-gray-600 ml-2 line-through">
                            {correction.old_value.substring(0, 50)}
                            {correction.old_value.length > 50 ? "..." : ""}
                          </span>
                        </div>
                        <div className="flex-1">
                          <span className="font-medium text-gray-700">
                            New:
                          </span>
                          <span className="text-green-600 ml-2">
                            {correction.new_value.substring(0, 50)}
                            {correction.new_value.length > 50 ? "..." : ""}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 ml-4">
                    {formatDistanceToNow(new Date(correction.submitted_at), {
                      addSuffix: true,
                    })}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-12 text-center text-gray-500">
              No corrections found
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center space-x-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
