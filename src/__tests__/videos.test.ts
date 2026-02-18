import { VideosResource } from '../resources/videos';
import { HttpClient } from '../http';
import { VloexError } from '../types/error';

// Mock HttpClient
jest.mock('../http');

describe('VideosResource', () => {
  let videos: VideosResource;
  let mockRequest: jest.Mock;

  beforeEach(() => {
    mockRequest = jest.fn();
    const mockHttp = { request: mockRequest } as unknown as HttpClient;
    videos = new VideosResource(mockHttp);
  });

  describe('create', () => {
    it('creates a video with minimal params', async () => {
      mockRequest.mockResolvedValue({
        job_id: 'job-123',
        status: 'queued',
      });

      const result = await videos.create({ script: 'Hello world' });

      expect(result).toEqual({
        id: 'job-123',
        status: 'queued',
        url: undefined,
        error: undefined,
      });

      expect(mockRequest).toHaveBeenCalledWith({
        method: 'POST',
        path: '/v1/generate',
        body: { input: 'Hello world' },
        idempotencyKey: undefined,
      });
    });

    it('creates a video with all options', async () => {
      mockRequest.mockResolvedValue({
        id: 'job-456',
        status: 'queued',
        url: 'https://cdn.vloex.com/v.mp4',
      });

      const result = await videos.create({
        script: 'Demo video',
        webhookUrl: 'https://hook.example.com',
        webhookSecret: 'secret',
        idempotencyKey: 'idem-key',
        options: { avatar: 'lily' },
      });

      expect(result.id).toBe('job-456');
      expect(result.url).toBe('https://cdn.vloex.com/v.mp4');

      const call = mockRequest.mock.calls[0][0];
      expect(call.body.webhook_url).toBe('https://hook.example.com');
      expect(call.body.webhook_secret).toBe('secret');
      expect(call.body.options).toEqual({ avatar: 'lily' });
      expect(call.idempotencyKey).toBe('idem-key');
    });

    it('omits empty options object', async () => {
      mockRequest.mockResolvedValue({ job_id: 'j1', status: 'queued' });

      await videos.create({ script: 'test', options: {} });

      const call = mockRequest.mock.calls[0][0];
      expect(call.body.options).toBeUndefined();
    });

    it('falls back to data.id when job_id absent', async () => {
      mockRequest.mockResolvedValue({ id: 'fallback-id', status: 'queued' });

      const result = await videos.create({ script: 'test' });
      expect(result.id).toBe('fallback-id');
    });

    it('maps error field from response', async () => {
      mockRequest.mockResolvedValue({
        job_id: 'j1',
        status: 'failed',
        error: 'generation failed',
      });

      const result = await videos.create({ script: 'test' });
      expect(result.error).toBe('generation failed');
    });

    it('throws VloexError on empty script', async () => {
      await expect(videos.create({ script: '' })).rejects.toThrow(VloexError);
    });

    it('throws VloexError on whitespace script', async () => {
      await expect(videos.create({ script: '   ' })).rejects.toThrow(VloexError);
    });

    it('does not include webhookUrl if not provided', async () => {
      mockRequest.mockResolvedValue({ job_id: 'j1', status: 'queued' });

      await videos.create({ script: 'test' });

      const call = mockRequest.mock.calls[0][0];
      expect(call.body.webhook_url).toBeUndefined();
      expect(call.body.webhook_secret).toBeUndefined();
    });
  });

  describe('retrieve', () => {
    it('retrieves video status', async () => {
      mockRequest.mockResolvedValue({
        id: 'job-123',
        status: 'completed',
        video_url: 'https://cdn.vloex.com/result.mp4',
      });

      const result = await videos.retrieve('job-123');

      expect(result).toEqual({
        id: 'job-123',
        status: 'completed',
        url: 'https://cdn.vloex.com/result.mp4',
        error: undefined,
      });

      expect(mockRequest).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v1/jobs/job-123/status',
      });
    });

    it('falls back to url when video_url absent', async () => {
      mockRequest.mockResolvedValue({
        id: 'j1',
        status: 'completed',
        url: 'https://fallback.url',
      });

      const result = await videos.retrieve('j1');
      expect(result.url).toBe('https://fallback.url');
    });

    it('maps error_message to error', async () => {
      mockRequest.mockResolvedValue({
        id: 'j1',
        status: 'failed',
        error_message: 'timeout occurred',
      });

      const result = await videos.retrieve('j1');
      expect(result.error).toBe('timeout occurred');
    });

    it('falls back to error field when error_message absent', async () => {
      mockRequest.mockResolvedValue({
        id: 'j1',
        status: 'failed',
        error: 'generic error',
      });

      const result = await videos.retrieve('j1');
      expect(result.error).toBe('generic error');
    });

    it('rejects empty ID', async () => {
      await expect(videos.retrieve('')).rejects.toThrow(VloexError);
    });

    it('rejects path traversal in ID', async () => {
      await expect(videos.retrieve('../../admin')).rejects.toThrow(VloexError);
    });
  });

  describe('fromJourney', () => {
    it('creates journey from screenshots', async () => {
      mockRequest.mockResolvedValue({
        success: true,
        video_url: 'https://cdn.vloex.com/journey.mp4',
        duration_seconds: 45,
        file_size_mb: 12.5,
        cost: 0.50,
        steps_count: 3,
      });

      const result = await videos.fromJourney({
        screenshots: ['img1', 'img2'],
        descriptions: ['Login', 'Dashboard'],
        productContext: 'My App',
      });

      expect(result).toEqual({
        success: true,
        videoPath: undefined,
        videoUrl: 'https://cdn.vloex.com/journey.mp4',
        durationSeconds: 45,
        fileSizeMb: 12.5,
        cost: 0.50,
        stepsCount: 3,
        error: undefined,
      });

      const call = mockRequest.mock.calls[0][0];
      expect(call.body.screenshots).toEqual(['img1', 'img2']);
      expect(call.body.descriptions).toEqual(['Login', 'Dashboard']);
      expect(call.body.product_context).toBe('My App');
      expect(call.body.step_duration).toBe(15);
      expect(call.body.avatar_position).toBe('bottom-right');
      expect(call.body.tone).toBe('professional');
    });

    it('creates journey from screenshots without descriptions', async () => {
      mockRequest.mockResolvedValue({ success: true });

      await videos.fromJourney({
        screenshots: ['img1'],
        productContext: 'My App',
      });

      const call = mockRequest.mock.calls[0][0];
      expect(call.body.screenshots).toEqual(['img1']);
      expect(call.body.descriptions).toBeUndefined();
    });

    it('creates journey from URL', async () => {
      mockRequest.mockResolvedValue({ success: true, video_path: '/path/to/vid' });

      const result = await videos.fromJourney({
        productUrl: 'https://example.com',
        pages: ['/home', '/pricing'],
        productContext: 'Example App',
        stepDuration: 20,
        avatarPosition: 'top-left',
        tone: 'casual',
      });

      expect(result.success).toBe(true);
      expect(result.videoPath).toBe('/path/to/vid');

      const call = mockRequest.mock.calls[0][0];
      expect(call.body.product_url).toBe('https://example.com');
      expect(call.body.pages).toEqual(['/home', '/pricing']);
      expect(call.body.step_duration).toBe(20);
      expect(call.body.avatar_position).toBe('top-left');
      expect(call.body.tone).toBe('casual');
      // Should not have screenshot fields
      expect(call.body.screenshots).toBeUndefined();
    });

    it('maps error_message to error', async () => {
      mockRequest.mockResolvedValue({
        success: false,
        error_message: 'journey failed',
      });

      const result = await videos.fromJourney({
        screenshots: ['img'],
        productContext: 'App',
      });
      expect(result.error).toBe('journey failed');
    });

    it('falls back to error field', async () => {
      mockRequest.mockResolvedValue({
        success: false,
        error: 'generic journey error',
      });

      const result = await videos.fromJourney({
        screenshots: ['img'],
        productContext: 'App',
      });
      expect(result.error).toBe('generic journey error');
    });

    it('rejects both modes provided', async () => {
      await expect(videos.fromJourney({
        screenshots: ['img'],
        productUrl: 'https://example.com',
        productContext: 'App',
      })).rejects.toThrow(VloexError);
    });

    it('rejects missing mode', async () => {
      await expect(videos.fromJourney({
        productContext: 'App',
      })).rejects.toThrow(VloexError);
    });

    it('rejects mismatched array lengths', async () => {
      await expect(videos.fromJourney({
        screenshots: ['a', 'b'],
        descriptions: ['only one'],
        productContext: 'App',
      })).rejects.toThrow(VloexError);
    });

    it('does not include productUrl or pages for screenshot mode', async () => {
      mockRequest.mockResolvedValue({ success: true });

      await videos.fromJourney({
        screenshots: ['img'],
        productContext: 'App',
      });

      const call = mockRequest.mock.calls[0][0];
      expect(call.body.product_url).toBeUndefined();
      expect(call.body.pages).toBeUndefined();
    });
  });
});
