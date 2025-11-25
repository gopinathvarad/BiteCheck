/**
 * Dashboard Home Page - Stats Overview
 */
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { apiClient } from "@/lib/api-client";
import { AdminStats } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";

export default function DashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadStats = async () => {
      try {
        const supabase = createClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          apiClient.setToken(session.access_token);
          const data = await apiClient.getStats();
          setStats(data);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load stats");
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading stats...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Overview of correction submissions</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Corrections
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats?.total_corrections || 0}
              </p>
            </div>
            <div className="text-4xl">📝</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Pending Review
              </p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">
                {stats?.pending_corrections || 0}
              </p>
            </div>
            <div className="text-4xl">⏳</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {stats?.approved_corrections || 0}
              </p>
            </div>
            <div className="text-4xl">✅</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Approval Rate</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">
                {stats?.approval_rate || 0}%
              </p>
            </div>
            <div className="text-4xl">📈</div>
          </div>
        </div>
      </div>

      {/* Recent Corrections */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Recent Corrections
          </h2>
        </div>
        <div className="divide-y divide-gray-200">
          {stats?.recent_corrections && stats.recent_corrections.length > 0 ? (
            stats.recent_corrections.map((correction) => (
              <div
                key={correction.id}
                className="px-6 py-4 hover:bg-gray-50 transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {correction.product_name || "Unknown Product"}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Field:{" "}
                      <span className="font-medium">
                        {correction.field_name}
                      </span>
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
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
                    <span className="text-sm text-gray-500">
                      {formatDistanceToNow(new Date(correction.submitted_at), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-8 text-center text-gray-500">
              No corrections yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
