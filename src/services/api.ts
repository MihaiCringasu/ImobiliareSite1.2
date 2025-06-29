import axios from "axios";
import type { AxiosResponse } from "axios";
import type {
  AuthResponse,
  LoginRequest,
  PaginatedData,
  AnalyticsStats,
  VisitorLog,
  ApiResponse,
  Property,
} from "@/types/api";
import type {
  PropertyFormData,
  TeamMember,
  TeamMemberFormData,
} from "@/types/models";

const api = axios.create({
  baseURL: (import.meta.env.VITE_API_URL || "http://localhost:3001") + "/api",
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("admin_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("admin_token");
      if (window.location.pathname !== "/admin/login") {
        window.location.href = "/admin/login";
      }
    }
    return Promise.reject(error);
  },
);

const responseBody = <T>(response: AxiosResponse<T>) => response.data;

export const authService = {
  login: (data: LoginRequest) =>
    api.post<AuthResponse>("/auth/login", data).then(responseBody),
  validateToken: () =>
    api.get<{ valid: boolean }>("/auth/validate").then(responseBody),
};

export const propertyService = {
  getAll: (page: number, limit: number, filters: Record<string, any> = {}) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.append(key, value.toString());
      }
    });
    return api
      .get<
        ApiResponse<PaginatedData<Property>>
      >(`/properties?${params.toString()}`)
      .then(responseBody);
  },
  getById: (id: string) =>
    api.get<ApiResponse<Property>>(`/properties/${id}`).then(responseBody),
  create: (data: PropertyFormData) =>
    api.post<ApiResponse<Property>>("/properties", data).then(responseBody),
  update: (id: string, data: Partial<PropertyFormData>) =>
    api
      .put<ApiResponse<Property>>(`/properties/${id}`, data)
      .then(responseBody),
  delete: (id: string) =>
    api.delete<ApiResponse<void>>(`/properties/${id}`).then(responseBody),
};

// Define the response type for team members list
type TeamMembersResponse = {
  success: boolean;
  data: {
    data: TeamMember[];
    total: number;
  };
  message?: string;
};

export const teamService = {
  getAll: async (): Promise<TeamMembersResponse> => {
    try {
      const response = await api.get<TeamMembersResponse | { data: TeamMember[]; total: number } | TeamMember[]>("/team");
      
      // If response is already in the correct format
      if (response.data && 'success' in response.data) {
        return response.data as TeamMembersResponse;
      }
      
      // If response is an array
      if (Array.isArray(response.data)) {
        return {
          success: true,
          data: {
            data: response.data,
            total: response.data.length
          }
        };
      }
      
      // If response has data and total fields
      if (response.data && 'data' in response.data && 'total' in response.data) {
        return {
          success: true,
          data: {
            data: Array.isArray(response.data.data) ? response.data.data : [response.data.data],
            total: response.data.total
          }
        };
      }
      
      // Fallback for unexpected format
      throw new Error('Unexpected response format');
    } catch (error) {
      console.error('Error fetching team members:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch team members',
        data: {
          data: [],
          total: 0
        }
      };
    }
  },
  getById: (id: string) =>
    api.get<ApiResponse<TeamMember>>(`/team/${id}`).then(responseBody),
  create: (data: TeamMemberFormData) =>
    api.post<ApiResponse<TeamMember>>("/team", data).then(responseBody),
  update: (id: string, data: Partial<TeamMemberFormData>) =>
    api.put<ApiResponse<TeamMember>>(`/team/${id}`, data).then(responseBody),
  delete: (id: string) =>
    api.delete<ApiResponse<void>>(`/team/${id}`).then(responseBody),
};

export const analyticsService = {
  getStats: () =>
    api.get<ApiResponse<AnalyticsStats>>(`/analytics/stats`).then(responseBody),
  getVisitorLogs: (page = 1, limit = 50) =>
    api
      .get<
        ApiResponse<PaginatedData<VisitorLog>>
      >(`/analytics/logs?page=${page}&limit=${limit}`)
      .then(responseBody),
  getDailyStats: (days = 7) =>
    api
      .get<ApiResponse<any[]>>(`/analytics/daily?days=${days}`)
      .then(responseBody),
  getPageStats: () =>
    api.get<ApiResponse<any[]>>("/analytics/pages").then(responseBody),
  trackVisit: (data: Partial<VisitorLog>) =>
    api.post<ApiResponse<void>>("/analytics/track", data).then(responseBody),
};

export default api;
