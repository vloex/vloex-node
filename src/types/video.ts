/**
 * Video generation types
 */

export interface GenerateParams {
  script: string;
  webhookUrl?: string;
  webhookSecret?: string;
  idempotencyKey?: string;
  options?: {
    avatar?: string;
    voice?: string;
    background?: string;
  };
}

export interface Video {
  id: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  url?: string;
  error?: string;
}
