import { validateGenerateParams, validateVideoId, validateJourneyParams } from '../validation';
import { VloexError } from '../types/error';

describe('validateGenerateParams', () => {
  it('accepts valid params', () => {
    expect(() => validateGenerateParams({ script: 'Hello' })).not.toThrow();
  });

  it('accepts params with all optional fields', () => {
    expect(() => validateGenerateParams({
      script: 'Hello',
      webhookUrl: 'https://example.com/hook',
      webhookSecret: 'secret123',
      idempotencyKey: 'uuid-123',
      options: { avatar: 'lily' },
    })).not.toThrow();
  });

  it('rejects missing script', () => {
    expect(() => validateGenerateParams({ script: '' })).toThrow(VloexError);
    expect(() => validateGenerateParams({ script: '' })).toThrow('script is required');
  });

  it('rejects non-string script', () => {
    expect(() => validateGenerateParams({ script: 123 as any })).toThrow(VloexError);
    expect(() => validateGenerateParams({ script: 123 as any })).toThrow('script is required');
  });

  it('rejects whitespace-only script', () => {
    expect(() => validateGenerateParams({ script: '   ' })).toThrow(VloexError);
    expect(() => validateGenerateParams({ script: '   ' })).toThrow('must not be empty or whitespace');
  });

  it('rejects non-string webhookUrl', () => {
    expect(() => validateGenerateParams({ script: 'Hi', webhookUrl: 123 as any })).toThrow(VloexError);
    expect(() => validateGenerateParams({ script: 'Hi', webhookUrl: 123 as any })).toThrow('webhookUrl must be a string');
  });

  it('rejects non-string webhookSecret', () => {
    expect(() => validateGenerateParams({ script: 'Hi', webhookSecret: true as any })).toThrow(VloexError);
    expect(() => validateGenerateParams({ script: 'Hi', webhookSecret: true as any })).toThrow('webhookSecret must be a string');
  });

  it('rejects non-string idempotencyKey', () => {
    expect(() => validateGenerateParams({ script: 'Hi', idempotencyKey: 42 as any })).toThrow(VloexError);
    expect(() => validateGenerateParams({ script: 'Hi', idempotencyKey: 42 as any })).toThrow('idempotencyKey must be a string');
  });
});

describe('validateVideoId', () => {
  it('accepts valid IDs', () => {
    expect(() => validateVideoId('abc-123')).not.toThrow();
    expect(() => validateVideoId('job_456')).not.toThrow();
    expect(() => validateVideoId('ABC-def-789')).not.toThrow();
  });

  it('rejects empty string', () => {
    expect(() => validateVideoId('')).toThrow(VloexError);
    expect(() => validateVideoId('')).toThrow('Video ID is required');
  });

  it('rejects non-string', () => {
    expect(() => validateVideoId(null as any)).toThrow(VloexError);
    expect(() => validateVideoId(null as any)).toThrow('Video ID is required');
  });

  it('rejects path traversal characters', () => {
    expect(() => validateVideoId('../admin')).toThrow(VloexError);
    expect(() => validateVideoId('../admin')).toThrow('invalid characters');
  });

  it('rejects slashes', () => {
    expect(() => validateVideoId('foo/bar')).toThrow(VloexError);
    expect(() => validateVideoId('foo/bar')).toThrow('invalid characters');
  });

  it('rejects special characters', () => {
    expect(() => validateVideoId('id with spaces')).toThrow(VloexError);
    expect(() => validateVideoId('id;DROP TABLE')).toThrow(VloexError);
  });
});

describe('validateJourneyParams', () => {
  it('accepts valid screenshot-mode params', () => {
    expect(() => validateJourneyParams({
      screenshots: ['base64data'],
      productContext: 'My App',
    })).not.toThrow();
  });

  it('accepts screenshots with matching descriptions', () => {
    expect(() => validateJourneyParams({
      screenshots: ['img1', 'img2'],
      descriptions: ['Page 1', 'Page 2'],
      productContext: 'My App',
    })).not.toThrow();
  });

  it('accepts valid URL-mode params', () => {
    expect(() => validateJourneyParams({
      productUrl: 'https://example.com',
      pages: ['/home', '/about'],
      productContext: 'My App',
    })).not.toThrow();
  });

  it('accepts URL-mode without pages', () => {
    expect(() => validateJourneyParams({
      productUrl: 'https://example.com',
      productContext: 'My App',
    })).not.toThrow();
  });

  it('rejects missing productContext', () => {
    expect(() => validateJourneyParams({
      screenshots: ['img'],
      productContext: '',
    })).toThrow(VloexError);
    expect(() => validateJourneyParams({
      screenshots: ['img'],
      productContext: '',
    })).toThrow('productContext is required');
  });

  it('rejects non-string productContext', () => {
    expect(() => validateJourneyParams({
      screenshots: ['img'],
      productContext: 123 as any,
    })).toThrow(VloexError);
  });

  it('rejects when neither screenshots nor URL provided', () => {
    expect(() => validateJourneyParams({
      productContext: 'My App',
    })).toThrow(VloexError);
    expect(() => validateJourneyParams({
      productContext: 'My App',
    })).toThrow('Either screenshots or productUrl');
  });

  it('rejects empty screenshots array (treated as no screenshots)', () => {
    expect(() => validateJourneyParams({
      screenshots: [],
      productContext: 'My App',
    })).toThrow(VloexError);
    expect(() => validateJourneyParams({
      screenshots: [],
      productContext: 'My App',
    })).toThrow('Either screenshots or productUrl');
  });

  it('rejects both screenshots and URL', () => {
    expect(() => validateJourneyParams({
      screenshots: ['img'],
      productUrl: 'https://example.com',
      productContext: 'My App',
    })).toThrow(VloexError);
    expect(() => validateJourneyParams({
      screenshots: ['img'],
      productUrl: 'https://example.com',
      productContext: 'My App',
    })).toThrow('Cannot provide both');
  });

  it('rejects mismatched descriptions length', () => {
    expect(() => validateJourneyParams({
      screenshots: ['img1', 'img2', 'img3'],
      descriptions: ['desc1'],
      productContext: 'My App',
    })).toThrow(VloexError);
    expect(() => validateJourneyParams({
      screenshots: ['img1', 'img2', 'img3'],
      descriptions: ['desc1'],
      productContext: 'My App',
    })).toThrow('descriptions length (1) must match screenshots length (3)');
  });

  it('rejects descriptions without screenshots', () => {
    expect(() => validateJourneyParams({
      productUrl: 'https://example.com',
      descriptions: ['desc'],
      productContext: 'My App',
    })).toThrow(VloexError);
    expect(() => validateJourneyParams({
      productUrl: 'https://example.com',
      descriptions: ['desc'],
      productContext: 'My App',
    })).toThrow('descriptions can only be used with screenshots');
  });

  it('rejects pages without URL', () => {
    expect(() => validateJourneyParams({
      screenshots: ['img'],
      pages: ['/home'],
      productContext: 'My App',
    })).toThrow(VloexError);
    expect(() => validateJourneyParams({
      screenshots: ['img'],
      pages: ['/home'],
      productContext: 'My App',
    })).toThrow('pages can only be used with productUrl');
  });

  it('rejects invalid stepDuration', () => {
    expect(() => validateJourneyParams({
      screenshots: ['img'],
      productContext: 'My App',
      stepDuration: -5,
    })).toThrow(VloexError);
    expect(() => validateJourneyParams({
      screenshots: ['img'],
      productContext: 'My App',
      stepDuration: -5,
    })).toThrow('stepDuration must be a positive number');
  });

  it('rejects non-number stepDuration', () => {
    expect(() => validateJourneyParams({
      screenshots: ['img'],
      productContext: 'My App',
      stepDuration: 'ten' as any,
    })).toThrow(VloexError);
    expect(() => validateJourneyParams({
      screenshots: ['img'],
      productContext: 'My App',
      stepDuration: 'ten' as any,
    })).toThrow('stepDuration must be a positive number');
  });

  it('rejects zero stepDuration', () => {
    expect(() => validateJourneyParams({
      screenshots: ['img'],
      productContext: 'My App',
      stepDuration: 0,
    })).toThrow(VloexError);
  });
});
