/**
 * VLOEX SDK Types
 * Minimal, Stripe-style API surface
 */

// Core: script → video
export interface GenerateParams {
  script: string;
  webhookUrl?: string;     // Optional webhook for completion notification
  webhookSecret?: string;  // Optional secret for webhook HMAC signature
  options?: {
    avatar?: string;      // Coming soon
    voice?: string;       // Coming soon
    background?: string;  // Coming soon
  };
}

// Journey: screenshots/URL → video
export interface JourneyParams {
  // Mode 1: Provide screenshots (with optional descriptions)
  screenshots?: string[];  // base64-encoded images
  descriptions?: string[];  // Optional - if provided, uses these instead of Vision AI

  // Mode 2: URL-based (public pages only)
  productUrl?: string;
  pages?: string[];  // Just paths like ["/", "/features", "/pricing"]

  // Common settings
  productContext: string;
  stepDuration?: number;
  avatarPosition?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  tone?: 'professional' | 'casual' | 'excited';
}

// What you get back from /v1/generate
export interface Video {
  id: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  url?: string;
  error?: string;
}

// What you get back from /v1/videos/from-journey
export interface JourneyVideo {
  success: boolean;
  videoPath?: string;
  videoUrl?: string;
  durationSeconds?: number;
  fileSizeMb?: number;
  cost?: number;
  stepsCount?: number;
  error?: string;
}

export class VloexError extends Error {
  readonly statusCode?: number;

  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = 'VloexError';
    this.statusCode = statusCode;
  }
}
