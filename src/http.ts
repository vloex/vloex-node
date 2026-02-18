/**
 * HTTP transport layer
 * Handles fetch, retries, timeouts, and error parsing
 */
import fetch, { Response } from 'node-fetch';
import { VloexError } from './types';

export interface HttpRequestOptions {
  method: string;
  path: string;
  body?: Record<string, unknown>;
  idempotencyKey?: string;
}

export class HttpClient {
  private baseUrl: string;
  private apiKey: string;
  private timeout: number;
  private maxRetries: number;

  constructor(apiKey: string, baseUrl: string, timeout: number, maxRetries: number) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.timeout = timeout;
    this.maxRetries = maxRetries;
  }

  async request(options: HttpRequestOptions): Promise<Record<string, unknown>> {
    const url = `${this.baseUrl}${options.path}`;

    const headers: Record<string, string> = {
      'Authorization': `Bearer ${this.apiKey}`,
    };

    // Only set Content-Type when there's a body
    if (options.body) {
      headers['Content-Type'] = 'application/json';
    }

    if (options.idempotencyKey) {
      headers['Idempotency-Key'] = options.idempotencyKey;
    }

    const fetchOptions: Record<string, unknown> = {
      method: options.method,
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    };

    let lastError!: Error;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      if (attempt > 0) {
        // Exponential backoff: 1s, 2s, 4s
        const delay = Math.pow(2, attempt - 1) * 1000;
        await sleep(delay);
      }

      try {
        const response = await this.fetchWithTimeout(url, fetchOptions);
        return await this.parseResponse(response);
      } catch (error) {
        lastError = error as Error;

        // Only retry on network errors or 5xx/429
        if (error instanceof VloexError) {
          const status = error.statusCode;
          if (status && status >= 400 && status < 500 && status !== 429) {
            // Client errors (except 429) are not retryable
            throw error;
          }
        }
      }
    }

    throw lastError;
  }

  private async fetchWithTimeout(url: string, options: Record<string, unknown>): Promise<Response> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal as any,
      });
      return response;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new VloexError(`Request timed out after ${this.timeout}ms`);
      }
      throw new VloexError(error.message || 'Network request failed');
    } finally {
      clearTimeout(timer);
    }
  }

  private async parseResponse(response: Response): Promise<Record<string, unknown>> {
    let data: any;

    try {
      data = await response.json();
    } catch {
      if (!response.ok) {
        throw new VloexError(
          `API returned ${response.status} with non-JSON response`,
          response.status
        );
      }
      throw new VloexError('API returned invalid JSON');
    }

    if (!response.ok) {
      throw new VloexError(
        data.detail || data.message || 'API request failed',
        response.status
      );
    }

    return data;
  }
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
