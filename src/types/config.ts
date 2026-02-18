/**
 * SDK configuration types
 */

export interface VloexConfig {
  /** Custom API base URL */
  baseUrl?: string;
  /** Request timeout in milliseconds (default: 30000) */
  timeout?: number;
  /** Max retry attempts for transient failures (default: 3) */
  maxRetries?: number;
}

export const DEFAULT_BASE_URL = 'https://api.vloex.com';
export const DEFAULT_TIMEOUT = 30000;
export const DEFAULT_MAX_RETRIES = 3;
