// TypeScript types for API responses

// Property type for API responses (frontend)
export interface Property {
  id: string;
  title: string;
  description?: string;
  price: number;
  currency: string;
  location: string;
  address?: string;
  city?: string;
  county?: string;
  area: number;
  rooms?: number;
  bathrooms?: number;
  type: string;
  category: string;
  status: string;
  featured: boolean;
  videoUrl?: string;
  thumbnailUrl?: string;
  images?: Array<{
    id: string;
    url: string;
    alt: string;
    order: number;
    isPrimary: boolean;
  }>;
  videos?: Array<{
    id: string;
    url: string;
    title?: string;
    description?: string;
    order: number;
  }>;
  mapUrl?: string;
  mapEmbedUrl?: string;
  amenities: string[];
  energyClass?: string;
  yearBuilt?: number;
  floor?: number;
  totalFloors?: number;
  parking?: boolean;
  agentId: string;
  agent?: {
    id: string;
    name: string;
    email: string;
    phone: string;
    image?: string;
  };
  viewsCount: number;
  contactCount: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  badges?: string[];
  sold?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedData<T> {
  data: T[];
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedProperties {
  properties: Property[];
  totalPages: number;
  currentPage: number;
}

export interface TeamMember {
  id: string;
  name?: string;
  role?: string;
  phone?: string;
  email?: string;
  image?: string;
  firstName?: string;
  lastName?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface CreateTeamMemberData
  extends Omit<TeamMember, "id" | "createdAt" | "updatedAt"> {}

export interface AnalyticsStats {
  totalVisitors: number;
  uniqueVisitors: number;
  pageViews: number;
  avgSessionDuration: string;
  bounceRate: string;
  topCountry: string;
}

export interface VisitorLog {
  id: number;
  ip: string;
  location: string;
  device: string;
  browser: string;
  page: string;
  timestamp: string;
  duration: string;
  referrer: string;
  userAgent: string;
}

export interface PaginatedLogs {
  logs: VisitorLog[];
  totalPages: number;
  currentPage: number;
}

export interface DailyStat {
  date: string;
  visits: number;
}

export interface PageStat {
  page: string;
  visits: number;
}

export interface LoginRequest {
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    role: string;
  };
}
