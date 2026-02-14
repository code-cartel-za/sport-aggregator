export interface B2bApiResponse<T> {
  success: boolean;
  data?: T;
  error?: B2bApiError;
  meta: B2bResponseMeta;
}

export interface B2bApiError {
  code: string;
  message: string;
}

export interface B2bResponseMeta {
  requestId: string;
  timestamp: string;
  cached: boolean;
  rateLimit: {
    remaining: number;
    limit: number;
    resetAt: string;
  };
}
