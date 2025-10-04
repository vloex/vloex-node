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

// What you get back
export interface Video {
  id: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  url?: string;
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
