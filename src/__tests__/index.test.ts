import vloex, { Vloex, VloexError, VideosResource, HttpClient } from '../index';
import type { GenerateParams, Video, JourneyParams, JourneyVideo, VloexConfig } from '../index';

// Mock dependencies
jest.mock('../http');
jest.mock('../resources/videos');

describe('index exports', () => {
  describe('default export (factory function)', () => {
    it('creates a Vloex instance', () => {
      const client = vloex('vs_live_test');
      expect(client).toBeInstanceOf(Vloex);
    });

    it('passes config to Vloex constructor', () => {
      const client = vloex('vs_live_test', { baseUrl: 'https://custom.com' });
      expect(client).toBeInstanceOf(Vloex);
    });

    it('throws on missing API key', () => {
      expect(() => vloex('')).toThrow('VLOEX API key required');
    });
  });

  describe('named exports', () => {
    it('exports Vloex class', () => {
      expect(Vloex).toBeDefined();
      expect(typeof Vloex).toBe('function');
    });

    it('exports VloexError class', () => {
      expect(VloexError).toBeDefined();
      const err = new VloexError('test', 400);
      expect(err).toBeInstanceOf(VloexError);
      expect(err).toBeInstanceOf(Error);
    });

    it('exports VideosResource class', () => {
      expect(VideosResource).toBeDefined();
      expect(typeof VideosResource).toBe('function');
    });

    it('exports HttpClient class', () => {
      expect(HttpClient).toBeDefined();
      expect(typeof HttpClient).toBe('function');
    });

    it('type exports compile correctly', () => {
      // These just verify the types compile - runtime check
      const params: GenerateParams = { script: 'test' };
      expect(params.script).toBe('test');

      const video: Video = { id: '1', status: 'queued' };
      expect(video.id).toBe('1');

      const jParams: JourneyParams = { productContext: 'App', screenshots: ['img'] };
      expect(jParams.productContext).toBe('App');

      const jVideo: JourneyVideo = { success: true };
      expect(jVideo.success).toBe(true);

      const config: VloexConfig = { timeout: 5000 };
      expect(config.timeout).toBe(5000);
    });
  });
});
