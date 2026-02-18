import { HttpClient, sleep } from '../http';
import { VloexError } from '../types/error';

// Mock node-fetch
jest.mock('node-fetch', () => {
  const mockFetch = jest.fn();
  return {
    __esModule: true,
    default: mockFetch,
  };
});

import fetch from 'node-fetch';
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

function mockResponse(body: any, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: jest.fn().mockResolvedValue(body),
  } as any;
}

function mockNonJsonResponse(status = 502) {
  return {
    ok: false,
    status,
    json: jest.fn().mockRejectedValue(new SyntaxError('Unexpected token')),
  } as any;
}

describe('HttpClient', () => {
  let client: HttpClient;

  beforeEach(() => {
    jest.clearAllMocks();
    client = new HttpClient('test-key', 'https://api.test.com', 5000, 0);
  });

  describe('request', () => {
    it('makes a GET request with correct headers', async () => {
      mockFetch.mockResolvedValue(mockResponse({ id: '123' }));

      const result = await client.request({ method: 'GET', path: '/v1/test' });

      expect(result).toEqual({ id: '123' });
      const callArgs = mockFetch.mock.calls[0];
      expect(callArgs[0]).toBe('https://api.test.com/v1/test');
      const options = callArgs[1] as any;
      expect(options.method).toBe('GET');
      expect(options.headers['Authorization']).toBe('Bearer test-key');
      // No Content-Type on GET
      expect(options.headers['Content-Type']).toBeUndefined();
      expect(options.body).toBeUndefined();
    });

    it('makes a POST request with body and Content-Type', async () => {
      mockFetch.mockResolvedValue(mockResponse({ job_id: 'abc' }));

      const result = await client.request({
        method: 'POST',
        path: '/v1/generate',
        body: { input: 'hello' },
      });

      expect(result).toEqual({ job_id: 'abc' });
      const options = mockFetch.mock.calls[0][1] as any;
      expect(options.method).toBe('POST');
      expect(options.headers['Content-Type']).toBe('application/json');
      expect(options.body).toBe(JSON.stringify({ input: 'hello' }));
    });

    it('includes idempotency key header when provided', async () => {
      mockFetch.mockResolvedValue(mockResponse({ id: '1' }));

      await client.request({
        method: 'POST',
        path: '/v1/generate',
        body: { input: 'hi' },
        idempotencyKey: 'uuid-abc',
      });

      const options = mockFetch.mock.calls[0][1] as any;
      expect(options.headers['Idempotency-Key']).toBe('uuid-abc');
    });

    it('throws VloexError on API error with JSON body', async () => {
      mockFetch.mockResolvedValue(mockResponse({ detail: 'Not found' }, 404));

      await expect(client.request({ method: 'GET', path: '/v1/test' }))
        .rejects.toThrow(VloexError);
      await expect(client.request({ method: 'GET', path: '/v1/test' }))
        .rejects.toThrow('Not found');
    });

    it('uses message field when detail is not present', async () => {
      mockFetch.mockResolvedValue(mockResponse({ message: 'Bad request' }, 400));

      await expect(client.request({ method: 'GET', path: '/v1/test' }))
        .rejects.toThrow('Bad request');
    });

    it('uses fallback message when no detail or message', async () => {
      mockFetch.mockResolvedValue(mockResponse({}, 400));

      await expect(client.request({ method: 'GET', path: '/v1/test' }))
        .rejects.toThrow('API request failed');
    });

    it('throws VloexError on non-JSON error response', async () => {
      mockFetch.mockResolvedValue(mockNonJsonResponse(502));

      await expect(client.request({ method: 'GET', path: '/v1/test' }))
        .rejects.toThrow(VloexError);
      await expect(client.request({ method: 'GET', path: '/v1/test' }))
        .rejects.toThrow('non-JSON response');
    });

    it('throws VloexError on invalid JSON from 200 response', async () => {
      const resp = {
        ok: true,
        status: 200,
        json: jest.fn().mockRejectedValue(new SyntaxError('bad json')),
      } as any;
      mockFetch.mockResolvedValue(resp);

      await expect(client.request({ method: 'GET', path: '/v1/test' }))
        .rejects.toThrow('API returned invalid JSON');
    });

    it('preserves statusCode on VloexError', async () => {
      mockFetch.mockResolvedValue(mockResponse({ detail: 'Unauthorized' }, 401));

      try {
        await client.request({ method: 'GET', path: '/v1/test' });
        fail('should have thrown');
      } catch (err) {
        expect(err).toBeInstanceOf(VloexError);
        expect((err as VloexError).statusCode).toBe(401);
      }
    });
  });

  describe('timeout', () => {
    it('throws VloexError when fetch hangs past timeout', async () => {
      const slowClient = new HttpClient('key', 'https://api.test.com', 50, 0);

      // Simulate a fetch that hangs, then aborts when signal fires
      mockFetch.mockImplementation((_url: any, opts: any) => {
        return new Promise((_resolve, reject) => {
          if (opts?.signal) {
            opts.signal.addEventListener('abort', () => {
              const err: any = new Error('The operation was aborted');
              err.name = 'AbortError';
              reject(err);
            });
          }
        });
      });

      await expect(slowClient.request({ method: 'GET', path: '/v1/test' }))
        .rejects.toThrow('Request timed out');
    });

    it('throws VloexError on immediate AbortError', async () => {
      const slowClient = new HttpClient('key', 'https://api.test.com', 50, 0);

      mockFetch.mockImplementation(() => {
        const error: any = new Error('The operation was aborted');
        error.name = 'AbortError';
        return Promise.reject(error);
      });

      await expect(slowClient.request({ method: 'GET', path: '/v1/test' }))
        .rejects.toThrow('Request timed out');
    });

    it('throws VloexError on network error', async () => {
      mockFetch.mockRejectedValue(new Error('ECONNREFUSED'));

      await expect(client.request({ method: 'GET', path: '/v1/test' }))
        .rejects.toThrow('ECONNREFUSED');
    });

    it('wraps network errors without message', async () => {
      const err = new Error();
      err.message = '';
      mockFetch.mockRejectedValue(err);

      await expect(client.request({ method: 'GET', path: '/v1/test' }))
        .rejects.toThrow('Network request failed');
    });
  });

  describe('retries', () => {
    it('retries on 500 errors', async () => {
      const retryClient = new HttpClient('key', 'https://api.test.com', 5000, 2);

      mockFetch
        .mockResolvedValueOnce(mockResponse({ detail: 'server error' }, 500))
        .mockResolvedValueOnce(mockResponse({ detail: 'server error' }, 500))
        .mockResolvedValueOnce(mockResponse({ id: 'ok' }));

      const result = await retryClient.request({ method: 'GET', path: '/v1/test' });
      expect(result).toEqual({ id: 'ok' });
      expect(mockFetch).toHaveBeenCalledTimes(3);
    });

    it('retries on 429 rate limit', async () => {
      const retryClient = new HttpClient('key', 'https://api.test.com', 5000, 1);

      mockFetch
        .mockResolvedValueOnce(mockResponse({ detail: 'rate limited' }, 429))
        .mockResolvedValueOnce(mockResponse({ id: 'ok' }));

      const result = await retryClient.request({ method: 'GET', path: '/v1/test' });
      expect(result).toEqual({ id: 'ok' });
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('does not retry on 400 client error', async () => {
      const retryClient = new HttpClient('key', 'https://api.test.com', 5000, 2);

      mockFetch.mockResolvedValue(mockResponse({ detail: 'bad request' }, 400));

      await expect(retryClient.request({ method: 'GET', path: '/v1/test' }))
        .rejects.toThrow('bad request');
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('does not retry on 401', async () => {
      const retryClient = new HttpClient('key', 'https://api.test.com', 5000, 2);

      mockFetch.mockResolvedValue(mockResponse({ detail: 'unauthorized' }, 401));

      await expect(retryClient.request({ method: 'GET', path: '/v1/test' }))
        .rejects.toThrow('unauthorized');
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('does not retry on 402', async () => {
      const retryClient = new HttpClient('key', 'https://api.test.com', 5000, 2);

      mockFetch.mockResolvedValue(mockResponse({ detail: 'payment required' }, 402));

      await expect(retryClient.request({ method: 'GET', path: '/v1/test' }))
        .rejects.toThrow('payment required');
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('retries on network errors', async () => {
      const retryClient = new HttpClient('key', 'https://api.test.com', 5000, 1);

      mockFetch
        .mockRejectedValueOnce(new Error('ECONNRESET'))
        .mockResolvedValueOnce(mockResponse({ id: 'recovered' }));

      const result = await retryClient.request({ method: 'GET', path: '/v1/test' });
      expect(result).toEqual({ id: 'recovered' });
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('throws after exhausting retries', async () => {
      const retryClient = new HttpClient('key', 'https://api.test.com', 5000, 1);

      mockFetch
        .mockResolvedValueOnce(mockResponse({ detail: 'error' }, 500))
        .mockResolvedValueOnce(mockResponse({ detail: 'still error' }, 500));

      await expect(retryClient.request({ method: 'GET', path: '/v1/test' }))
        .rejects.toThrow('still error');
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('throws network error after exhausting retries', async () => {
      const retryClient = new HttpClient('key', 'https://api.test.com', 5000, 1);

      mockFetch
        .mockRejectedValueOnce(new Error('ECONNRESET'))
        .mockRejectedValueOnce(new Error('ECONNRESET'));

      await expect(retryClient.request({ method: 'GET', path: '/v1/test' }))
        .rejects.toThrow('ECONNRESET');
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });
});

describe('sleep', () => {
  it('resolves after given ms', async () => {
    const start = Date.now();
    await sleep(50);
    const elapsed = Date.now() - start;
    expect(elapsed).toBeGreaterThanOrEqual(40);
  });
});
