import { Vloex } from '../client';
import { VideosResource } from '../resources/videos';

// Mock dependencies
jest.mock('../http');
jest.mock('../resources/videos');

describe('Vloex', () => {
  it('creates instance with API key', () => {
    const client = new Vloex('vs_live_test');
    expect(client).toBeInstanceOf(Vloex);
    expect(client.videos).toBeDefined();
  });

  it('creates instance with config options', () => {
    const client = new Vloex('vs_live_test', {
      baseUrl: 'https://custom.api.com',
      timeout: 60000,
      maxRetries: 5,
    });
    expect(client).toBeInstanceOf(Vloex);
    expect(client.videos).toBeDefined();
  });

  it('creates instance with partial config', () => {
    const client = new Vloex('vs_live_test', { timeout: 10000 });
    expect(client).toBeInstanceOf(Vloex);
  });

  it('creates instance with empty config', () => {
    const client = new Vloex('vs_live_test', {});
    expect(client).toBeInstanceOf(Vloex);
  });

  it('throws when API key is missing', () => {
    expect(() => new Vloex('')).toThrow('VLOEX API key required');
  });

  it('throws when API key is not a string', () => {
    expect(() => new Vloex(null as any)).toThrow('VLOEX API key required');
  });

  it('throws when API key is undefined', () => {
    expect(() => new Vloex(undefined as any)).toThrow('VLOEX API key required');
  });

  it('exposes videos as VideosResource', () => {
    const client = new Vloex('vs_live_test');
    expect(client.videos).toBeInstanceOf(VideosResource);
  });
});
