/**
 * Journey video types
 */

export interface JourneyParams {
  // Mode 1: Provide screenshots (with optional descriptions)
  screenshots?: string[];
  descriptions?: string[];

  // Mode 2: URL-based (public pages only)
  productUrl?: string;
  pages?: string[];

  // Common settings
  productContext: string;
  stepDuration?: number;
  avatarPosition?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  tone?: 'professional' | 'casual' | 'excited';
}

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
