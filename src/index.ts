/**
 * VLOEX SDK - Video generation as a computing primitive
 *
 * Usage:
 *   const vloex = require('@vloex/sdk')('vs_live_...');
 *   const video = await vloex.videos.create({ script: 'Hello world' });
 */

import { Vloex } from './client';
import { VloexConfig } from './types';

/**
 * Initialize VLOEX SDK
 * @param apiKey - Your VLOEX API key
 * @param config - Optional configuration
 */
export default function vloex(apiKey: string, config?: VloexConfig): Vloex {
  return new Vloex(apiKey, config);
}

// Named exports for everything
export { Vloex } from './client';
export { VloexError, GenerateParams, Video, JourneyParams, JourneyVideo, VloexConfig } from './types';
export { VideosResource } from './resources/videos';
export { HttpClient } from './http';
