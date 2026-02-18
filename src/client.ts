/**
 * Vloex client
 * Main entry point for the SDK
 */
import { HttpClient } from './http';
import { VideosResource } from './resources/videos';
import { VloexConfig, DEFAULT_BASE_URL, DEFAULT_TIMEOUT, DEFAULT_MAX_RETRIES } from './types';

export class Vloex {
  readonly videos: VideosResource;

  constructor(apiKey: string, config?: VloexConfig) {
    if (!apiKey || typeof apiKey !== 'string') {
      throw new Error('VLOEX API key required. Get one at https://vloex.com/api-keys');
    }

    const baseUrl = config?.baseUrl || DEFAULT_BASE_URL;
    const timeout = config?.timeout || DEFAULT_TIMEOUT;
    const maxRetries = config?.maxRetries ?? DEFAULT_MAX_RETRIES;

    const http = new HttpClient(apiKey, baseUrl, timeout, maxRetries);
    this.videos = new VideosResource(http);
  }
}
