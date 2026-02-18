/**
 * Videos resource
 * Handles video creation, retrieval, and journey generation
 */
import { HttpClient } from '../http';
import { GenerateParams, Video, JourneyParams, JourneyVideo } from '../types';
import { validateGenerateParams, validateVideoId, validateJourneyParams } from '../validation';

export class VideosResource {
  private http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  /**
   * Create a video from a text script
   */
  async create(params: GenerateParams): Promise<Video> {
    validateGenerateParams(params);

    const payload: Record<string, unknown> = {
      input: params.script,
    };

    if (params.options && Object.keys(params.options).length > 0) {
      payload.options = params.options;
    }

    if (params.webhookUrl) {
      payload.webhook_url = params.webhookUrl;
    }

    if (params.webhookSecret) {
      payload.webhook_secret = params.webhookSecret;
    }

    const data = await this.http.request({
      method: 'POST',
      path: '/v1/generate',
      body: payload,
      idempotencyKey: params.idempotencyKey,
    });

    return {
      id: (data.job_id || data.id) as string,
      status: data.status as Video['status'],
      url: data.url as string | undefined,
      error: data.error as string | undefined,
    };
  }

  /**
   * Retrieve a video by ID
   */
  async retrieve(id: string): Promise<Video> {
    validateVideoId(id);

    const data = await this.http.request({
      method: 'GET',
      path: `/v1/jobs/${id}/status`,
    });

    return {
      id: data.id as string,
      status: data.status as Video['status'],
      url: (data.video_url || data.url) as string | undefined,
      error: (data.error_message || data.error) as string | undefined,
    };
  }

  /**
   * Create a video from a journey (screenshots or URL)
   */
  async fromJourney(params: JourneyParams): Promise<JourneyVideo> {
    validateJourneyParams(params);

    const payload: Record<string, unknown> = {
      product_context: params.productContext,
      step_duration: params.stepDuration || 15,
      avatar_position: params.avatarPosition || 'bottom-right',
      tone: params.tone || 'professional',
    };

    if (params.screenshots) {
      payload.screenshots = params.screenshots;
      if (params.descriptions) {
        payload.descriptions = params.descriptions;
      }
    }

    if (params.productUrl) {
      payload.product_url = params.productUrl;
    }

    if (params.pages) {
      payload.pages = params.pages;
    }

    const data = await this.http.request({
      method: 'POST',
      path: '/v1/videos/from-journey',
      body: payload,
    });

    return {
      success: data.success as boolean,
      videoPath: data.video_path as string | undefined,
      videoUrl: data.video_url as string | undefined,
      durationSeconds: data.duration_seconds as number | undefined,
      fileSizeMb: data.file_size_mb as number | undefined,
      cost: data.cost as number | undefined,
      stepsCount: data.steps_count as number | undefined,
      error: (data.error_message || data.error) as string | undefined,
    };
  }
}
