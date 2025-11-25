/**
 * API client for backend communication
 */

import {
  Correction,
  CorrectionListResponse,
  AdminStats,
  ApproveRequest,
  RejectRequest,
} from "./types";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = API_URL) {
    this.baseUrl = baseUrl;
  }

  setToken(token: string) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ detail: "Unknown error" }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Corrections endpoints
  async listCorrections(
    status?: string,
    page: number = 1,
    pageSize: number = 20
  ): Promise<CorrectionListResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    });

    if (status) {
      params.append("status", status);
    }

    return this.request<CorrectionListResponse>(
      `/admin/corrections?${params.toString()}`
    );
  }

  async getCorrection(id: string): Promise<Correction> {
    return this.request<Correction>(`/admin/corrections/${id}`);
  }

  async approveCorrection(
    id: string,
    data: ApproveRequest
  ): Promise<Correction> {
    return this.request<Correction>(`/admin/corrections/${id}/approve`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async rejectCorrection(id: string, data: RejectRequest): Promise<Correction> {
    return this.request<Correction>(`/admin/corrections/${id}/reject`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async getStats(): Promise<AdminStats> {
    return this.request<AdminStats>("/admin/stats");
  }
}

export const apiClient = new ApiClient();
