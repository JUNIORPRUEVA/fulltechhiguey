// API Response Types for FULLTECH
import type { Product, HeroSlide, Customer, Admin, SiteConfig, CustomPage, LegalPage, Category } from "@shared/schema";

// Base API response types
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

// Admin API Response Types
export interface AdminCustomersResponse extends Customer {
  referralCount?: number;
  totalPurchases?: number;
  totalSpent?: number;
  lastActivity?: string;
}

export interface AdminProductsResponse extends Product {
  totalSales?: number;
  viewCount?: number;
}

export interface AdminHeroSlidesResponse extends HeroSlide {
  // Additional admin-specific fields if needed
}

export interface AdminAnalyticsData {
  uniqueVisitors: number;
  pageViews: number;
  bounceRate: number;
  avgSessionDuration: number;
  totalRevenue: number;
  totalOrders: number;
  conversionRate: number;
  // Change statistics
  visitorsChange?: number;
  registrationsChange?: number;
  commissionsChange?: number;
  referralsChange?: number;
  // Additional analytics fields
  newRegistrations?: number;
  totalCommissions?: number;
  successfulReferrals?: number;
  topReferrers?: Array<{
    id: string;
    name: string;
    referralCode: string;
    referralCount: number;
    totalCommissions: number;
  }>;
  recentActivity?: Array<{
    id: string;
    description: string;
    timestamp: string;
    icon?: string;
  }>;
  topProducts: Array<{
    id: string;
    name: string;
    sales: number;
    revenue: number;
  }>;
  topCustomers: Array<{
    id: string;
    name: string;
    totalPurchases: number;
    totalSpent: number;
  }>;
  trafficSources: Array<{
    source: string;
    visitors: number;
    percentage: number;
  }>;
  salesTrends: Array<{
    date: string;
    sales: number;
    revenue: number;
  }>;
  customerGrowth: Array<{
    month: string;
    newCustomers: number;
    totalCustomers: number;
  }>;
  performanceMetrics: {
    avgLoadTime: number;
    errorRate: number;
    uptime: number;
  };
  referralStats: {
    totalReferrals: number;
    referralRate: string;
    byAuthProvider: Array<{
      authProvider: string;
      count: number;
    }>;
    byMonth: Array<{
      month: string;
      count: number;
    }>;
  };
}

// Customer API Response Types
export interface CustomerProfile extends Customer {
  referrals?: {
    made: Customer[];
    referredBy: Customer | null;
  };
  totalPurchases?: number;
  totalSpent?: number;
  favoriteProducts?: Product[];
  activityHistory?: CustomerActivity[];
}

export interface CustomerActivity {
  id: string;
  customerId: string;
  activityType: 'visit' | 'like' | 'share' | 'purchase';
  productId?: string;
  metadata?: Record<string, any>;
  createdAt: string | Date;
}

// Product API Response Types
export interface ProductWithStats extends Product {
  totalSales?: number;
  viewCount?: number;
  isLiked?: boolean;
  relatedProducts?: Product[];
}

// Configuration Types
export interface SiteConfigData extends SiteConfig {
  // Additional config fields if needed
}

// Category Types
export interface CategoryWithCount extends Category {
  productCount?: number;
}

// Hook Return Types
export interface UseAdminReturn {
  admin: Admin | null;
  isLoading: boolean;
  error: Error | null;
  isAuthenticated: boolean;
  logout: () => void;
  isLoggingOut: boolean;
}

export interface UseCustomerReturn {
  customer: Customer | null;
  isLoading: boolean;
  error: Error | null;
  isAuthenticated: boolean;
  logout: () => void;
  updateProfile: (data: Partial<Customer>) => Promise<void>;
}

// Form Types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  password: string;
  confirmPassword: string;
}

export interface ProductFormData extends Omit<Product, 'id' | 'images' | 'videos'> {
  images?: string[];
  videos?: string[];
}

export interface HeroSlideFormData extends Omit<HeroSlide, 'id'> {
  // Form-specific fields
}

// Filter and Search Types
export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  featured?: boolean;
  onSale?: boolean;
  search?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

// Error Types
export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, any>;
}

// Upload Types
export interface UploadResponse {
  url: string;
  filename: string;
  size: number;
  mimetype: string;
}

export interface ObjectUploadResponse {
  publicUrl: string;
  objectKey: string;
  bucket: string;
}