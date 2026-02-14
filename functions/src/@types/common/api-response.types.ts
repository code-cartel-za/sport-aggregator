export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  fromCache?: boolean;
  timestamp: string;
}

export interface ApiError {
  code: string;
  message: string;
  statusCode: number;
}

export interface CacheDoc<T> {
  key: string;
  data: T;
  createdAt: number;
  expiresAt: number;
  ttlMs: number;
}

export interface CacheStatusEntry {
  key: string;
  createdAt: string;
  expiresAt: string;
  ttlMs: number;
  isStale: boolean;
  ageMs: number;
}
