/**
 * VLOEX SDK - Video generation as a computing primitive
 *
 * Usage:
 *   const vloex = require('@vloex/sdk')('vs_live_...');
 *   const video = await vloex.videos.create({ script: 'Hello world' });
 */

import fetch from 'node-fetch';
import { GenerateParams, Video, VloexError, JourneyParams, JourneyVideo } from './types';

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
     *
     * Example with idempotency:
     *   const { v4: uuidv4 } = require('uuid');
     *   const video = await vloex.videos.create({
     *     script: 'Version 2.0 is live!',
     *     webhookUrl: 'https://your-app.com/webhook',
     *     idempotencyKey: uuidv4()  // Prevents duplicate charges
     *   });
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

      return this.request('POST', '/v1/generate', payload, params.idempotencyKey);
    },

    /**
     * Retrieve a video by ID
     * @param id - Video job ID
     * @returns Video with current status
     */
    retrieve: async (id: string): Promise<Video> => {
      return this.request('GET', `/v1/jobs/${id}/status`);
    },

    /**
     * Create a video from journey - 2 simple modes
     *
     * Mode 1a - Provide screenshots with descriptions (fastest):
     *   const video = await vloex.videos.fromJourney({
     *     screenshots: ['base64img1...', 'base64img2...'],
     *     descriptions: ['Login page', 'Dashboard overview'],
     *     productContext: 'My Product Demo'
     *   });
     *
     * Mode 1b - Provide screenshots only (Vision AI analyzes):
     *   const video = await vloex.videos.fromJourney({
     *     screenshots: ['base64img1...', 'base64img2...'],
     *     productContext: 'My Product Demo'
     *   });
     *
     * Mode 2 - URL with page paths (public pages only):
     *   const video = await vloex.videos.fromJourney({
     *     productUrl: 'https://myapp.com',
     *     pages: ['/dashboard', '/features', '/pricing'],
     *     productContext: 'MyApp Product Tour'
     *   });
     *
     * @param params - Journey parameters
     * @returns Journey video result
     */
    fromJourney: async (params: JourneyParams): Promise<JourneyVideo> => {
      const payload: any = {
        product_context: params.productContext,
        step_duration: params.stepDuration || 15,
        avatar_position: params.avatarPosition || 'bottom-right',
        tone: params.tone || 'professional'
      };

      // Mode 1: Screenshots provided
      if (params.screenshots) {
        payload.screenshots = params.screenshots;

        // Optional descriptions (Mode 1a vs 1b)
        if (params.descriptions) {
          payload.descriptions = params.descriptions;
        }
      }

      // Mode 2: URL-based (public pages only)
      if (params.productUrl) {
        payload.product_url = params.productUrl;
      }

      if (params.pages) {
        payload.pages = params.pages;
      }

      return this.request('POST', '/v1/videos/from-journey', payload);
    }
  };

  /**
   * Internal: Make HTTP request
   */
  private async request(method: string, path: string, body?: any, idempotencyKey?: string): Promise<any> {
    const url = `${this.baseUrl}${path}`;

    const headers: any = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };

    // Add idempotency key if provided
    if (idempotencyKey) {
      headers['Idempotency-Key'] = idempotencyKey;
    }

    const response = await fetch(url, {
      method,
      headers,
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

    if (path.includes('/from-journey')) {
      return {
        success: data.success,
        videoPath: data.video_path,
        videoUrl: data.video_url,
        durationSeconds: data.duration_seconds,
        fileSizeMb: data.file_size_mb,
        cost: data.cost,
        stepsCount: data.steps_count,
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

export { Vloex, Video, GenerateParams, VloexError, JourneyParams, JourneyVideo };
