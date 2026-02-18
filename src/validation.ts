/**
 * Input validation
 * Validates SDK inputs before sending to the API
 */
import { VloexError } from './types';
import { GenerateParams } from './types/video';
import { JourneyParams } from './types/journey';

const SAFE_ID_PATTERN = /^[a-zA-Z0-9_-]+$/;

export function validateGenerateParams(params: GenerateParams): void {
  if (!params.script || typeof params.script !== 'string') {
    throw new VloexError('script is required and must be a non-empty string');
  }

  if (params.script.trim().length === 0) {
    throw new VloexError('script must not be empty or whitespace-only');
  }

  if (params.webhookUrl !== undefined && typeof params.webhookUrl !== 'string') {
    throw new VloexError('webhookUrl must be a string');
  }

  if (params.webhookSecret !== undefined && typeof params.webhookSecret !== 'string') {
    throw new VloexError('webhookSecret must be a string');
  }

  if (params.idempotencyKey !== undefined && typeof params.idempotencyKey !== 'string') {
    throw new VloexError('idempotencyKey must be a string');
  }
}

export function validateVideoId(id: string): void {
  if (!id || typeof id !== 'string') {
    throw new VloexError('Video ID is required and must be a non-empty string');
  }

  if (!SAFE_ID_PATTERN.test(id)) {
    throw new VloexError('Video ID contains invalid characters');
  }
}

export function validateJourneyParams(params: JourneyParams): void {
  if (!params.productContext || typeof params.productContext !== 'string') {
    throw new VloexError('productContext is required and must be a non-empty string');
  }

  const hasScreenshots = params.screenshots && params.screenshots.length > 0;
  const hasUrl = params.productUrl;

  if (!hasScreenshots && !hasUrl) {
    throw new VloexError(
      'Either screenshots or productUrl must be provided'
    );
  }

  if (hasScreenshots && hasUrl) {
    throw new VloexError(
      'Cannot provide both screenshots and productUrl. Choose one mode.'
    );
  }

  if (hasScreenshots && params.descriptions) {
    if (params.descriptions.length !== params.screenshots!.length) {
      throw new VloexError(
        `descriptions length (${params.descriptions.length}) must match screenshots length (${params.screenshots!.length})`
      );
    }
  }

  if (params.descriptions && !hasScreenshots) {
    throw new VloexError('descriptions can only be used with screenshots');
  }

  if (params.pages && !hasUrl) {
    throw new VloexError('pages can only be used with productUrl');
  }

  if (params.stepDuration !== undefined) {
    if (typeof params.stepDuration !== 'number' || params.stepDuration <= 0) {
      throw new VloexError('stepDuration must be a positive number');
    }
  }
}
