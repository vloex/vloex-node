/**
 * VLOEX SDK - Video generation as a computing primitive
 *
 * Usage:
 *   const vloex = require('@vloex/sdk')('vs_live_...');
 *   const video = await vloex.videos.create({ script: 'Hello world' });
 */

import fetch from 'node-fetch';
import { GenerateParams, Video, VloexError } from './types';

const DEFAULT_BASE_URL = 'https://api.vloex.com';

class Vloex {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, baseUrl: string = DEFAULT_BASE_URL) {
    if (!apiKey) {
      throw new Error('VLOEX API key required. Get one at https://vloex.com/api-keys');
    }
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  /**
   * Videos resource - core primitive
   */
  videos = {
    /**
     * Create a video
     * @param params - script and optional settings
     * @returns Video job with ID
     */
    create: async (params: GenerateParams): Promise<Video> => {
      const payload: any = {
        input: params.script,
        options: params.options || {}
      };

      if (params.webhookUrl) {
        payload.webhook_url = params.webhookUrl;
      }

      if (params.webhookSecret) {
        payload.webhook_secret = params.webhookSecret;
      }

      return this.request('POST', '/v1/generate', payload);
    },

    /**
     * Retrieve a video by ID
     * @param id - Video job ID
     * @returns Video with current status
     */
    retrieve: async (id: string): Promise<Video> => {
      return this.request('GET', `/v1/jobs/${id}/status`);
    }
  };

  /**
   * Internal: Make HTTP request
   */
  private async request(method: string, path: string, body?: any): Promise<any> {
    const url = `${this.baseUrl}${path}`;

    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new VloexError(
        data.detail || data.message || 'API request failed',
        response.status
      );
    }

    // Transform API response to SDK format
    if (path.includes('/generate')) {
      return {
        id: data.job_id || data.id,
        status: data.status,
        url: data.url,
        error: data.error
      };
    }

    if (path.includes('/status')) {
      return {
        id: data.id,
        status: data.status,
        url: data.video_url || data.url,
        error: data.error_message || data.error
      };
    }

    return data;
  }
}

/**
 * Initialize VLOEX SDK
 * @param apiKey - Your VLOEX API key
 * @param baseUrl - Optional custom base URL
 */
export default function vloex(apiKey: string, baseUrl?: string): Vloex {
  return new Vloex(apiKey, baseUrl);
}

export { Vloex, Video, GenerateParams, VloexError };
