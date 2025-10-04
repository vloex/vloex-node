/**
 * Generate Videos from GitHub Releases with Webhooks
 * ==================================================
 *
 * This example shows how to use webhooks for async video generation,
 * eliminating the need for polling.
 *
 * Benefits of Webhooks:
 * --------------------
 * - ✅ No polling required - get notified when video is ready
 * - ✅ Reduced API calls - save on rate limits
 * - ✅ Better architecture - event-driven, not polling-based
 * - ✅ Faster response - instant notification vs 5-second polling
 *
 * Requirements:
 * -------------
 * npm install vloex express axios crypto
 *
 * Get your API key from: https://vloex.com/dashboard/api-keys
 */

const axios = require('axios');
const express = require('express');
const crypto = require('crypto');

// ============================================================================
// Part 1: Video Generation with Webhook
// ============================================================================

async function generateReleaseVideoWithWebhook(apiKey, repoOwner, repoName, webhookUrl, webhookSecret = null) {
  /**
   * Generate a video from GitHub release with webhook notification.
   *
   * @param {string} apiKey - Your VLOEX API key
   * @param {string} repoOwner - GitHub repo owner (e.g., 'vercel')
   * @param {string} repoName - GitHub repo name (e.g., 'next.js')
   * @param {string} webhookUrl - Your webhook endpoint URL
   * @param {string} webhookSecret - Optional: Secret for HMAC signature verification
   * @returns {Promise<Object>} Video job details
   */

  // Fetch latest release
  const releaseUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/releases/latest`;
  const response = await axios.get(releaseUrl);
  const release = response.data;

  // Extract release information
  const version = release.tag_name || 'Unknown';
  const name = release.name || version;
  const body = release.body || 'No release notes available.';

  // Format script for video
  const script = `
    Hey everyone! ${name} is here!

    We're excited to announce ${version} with some amazing updates.

    ${body.substring(0, 500)}...

    Check out the full release notes on GitHub to learn more.
    Update now to get these improvements!
  `;

  // Initialize VLOEX client
  const vloexInit = require('vloex').default || require('vloex');
  const vloex = vloexInit(apiKey);

  // Create video with webhook (no need to wait!)
  const video = await vloex.videos.create({
    script: script,
    webhookUrl: webhookUrl,
    webhookSecret: webhookSecret  // Optional: for signature verification
  });

  console.log(`✅ Video job created: ${video.id}`);
  console.log(`📤 Webhook will be called at: ${webhookUrl}`);
  console.log(`🎬 You can continue with other tasks - webhook will notify you when ready!`);

  return video;
}

// ============================================================================
// Part 2: Webhook Receiver (Express.js)
// ============================================================================

const app = express();
app.use(express.json());

// Store your webhook secret (same as used in generateVideo call)
const WEBHOOK_SECRET = process.env.VLOEX_WEBHOOK_SECRET || 'my_secret_key_123';

function verifyWebhookSignature(payloadJson, signature, timestamp, secret) {
  /**
   * Verify HMAC signature from VLOEX webhook.
   * This prevents unauthorized webhook calls and replay attacks.
   */

  // Check timestamp is not too old (prevent replay attacks)
  const currentTime = Math.floor(Date.now() / 1000);
  if (Math.abs(currentTime - parseInt(timestamp)) > 300) {  // 5 minutes tolerance
    return false;
  }

  // Reconstruct the signed message
  const message = `${timestamp}.${payloadJson}`;

  // Calculate expected signature
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(message)
    .digest('hex');

  // Extract provided signature
  const providedSignature = signature.split('=')[1] || signature;

  // Compare signatures (constant-time comparison prevents timing attacks)
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(providedSignature)
    );
  } catch (e) {
    return false;
  }
}

app.post('/api/vloex-webhook', (req, res) => {
  /**
   * Handle incoming VLOEX webhooks.
   * This endpoint receives notifications when videos are completed.
   */

  // Get headers
  const signature = req.headers['x-vloex-signature'] || '';
  const timestamp = req.headers['x-vloex-timestamp'] || '';

  // Get payload as JSON string for signature verification
  const payloadJson = JSON.stringify(req.body);

  // Verify signature (if secret was provided)
  if (WEBHOOK_SECRET && signature) {
    if (!verifyWebhookSignature(payloadJson, signature, timestamp, WEBHOOK_SECRET)) {
      console.error('❌ Invalid webhook signature!');
      return res.status(401).json({ error: 'Invalid signature' });
    }
  }

  // Handle different webhook events
  const { event, job_id, video_url, error } = req.body;

  if (event === 'video.completed') {
    console.log(`✅ Video ${job_id} completed!`);
    console.log(`📹 Video URL: ${video_url}`);

    // TODO: Process the completed video
    // - Upload to CDN
    // - Send email notification
    // - Update database
    // - Trigger next step in pipeline

  } else if (event === 'video.failed') {
    console.log(`❌ Video ${job_id} failed!`);
    console.log(`🔴 Error: ${error}`);

    // TODO: Handle failure
    // - Retry with different options
    // - Send error notification
    // - Log to error tracking
  }

  // Always return 200 to acknowledge receipt
  // (Prevents VLOEX from retrying)
  res.status(200).json({ status: 'received' });
});

// ============================================================================
// Part 3: Python Flask Webhook Receiver (Alternative)
// ============================================================================

/**
 * Python / Flask example:
 *
 * from flask import Flask, request, jsonify
 * import hmac
 * import hashlib
 * import time
 *
 * app = Flask(__name__)
 * WEBHOOK_SECRET = 'my_secret_key_123'
 *
 * def verify_webhook_signature(payload_json, signature, timestamp, secret):
 *     if abs(time.time() - int(timestamp)) > 300:
 *         return False
 *
 *     message = f"{timestamp}.{payload_json}"
 *     expected = hmac.new(
 *         secret.encode('utf-8'),
 *         message.encode('utf-8'),
 *         hashlib.sha256
 *     ).hexdigest()
 *
 *     provided = signature.split('=')[1] if '=' in signature else signature
 *     return hmac.compare_digest(expected, provided)
 *
 * @app.route('/api/vloex-webhook', methods=['POST'])
 * def handle_webhook():
 *     signature = request.headers.get('X-VLOEX-Signature', '')
 *     timestamp = request.headers.get('X-VLOEX-Timestamp', '')
 *     payload_json = request.get_data(as_text=True)
 *
 *     if not verify_webhook_signature(payload_json, signature, timestamp, WEBHOOK_SECRET):
 *         return jsonify({"error": "Invalid signature"}), 401
 *
 *     payload = request.get_json()
 *     if payload['event'] == 'video.completed':
 *         print(f"Video {payload['job_id']} completed: {payload['video_url']}")
 *
 *     return jsonify({"status": "received"}), 200
 */

// ============================================================================
// Part 4: Usage Examples
// ============================================================================

async function exampleBasicWebhook() {
  /**
   * Basic webhook usage - start video generation and move on
   */
  const apiKey = process.env.VLOEX_API_KEY;
  const webhookUrl = "https://your-app.com/api/vloex-webhook";

  const video = await generateReleaseVideoWithWebhook(
    apiKey,
    'vercel',
    'next.js',
    webhookUrl
  );

  // Video is generating in background
  // Your webhook will be called when ready
  // Continue with other tasks...
  console.log("🚀 Video generation started, continuing with other tasks...");
}

async function exampleWebhookWithSignature() {
  /**
   * Webhook with HMAC signature for security
   */
  const apiKey = process.env.VLOEX_API_KEY;
  const webhookUrl = "https://your-app.com/api/vloex-webhook";
  const webhookSecret = "my_secret_key_123";  // Store this securely!

  const video = await generateReleaseVideoWithWebhook(
    apiKey,
    'vercel',
    'next.js',
    webhookUrl,
    webhookSecret  // Enables HMAC signature
  );

  console.log("✅ Video generation started with webhook signature verification");
}

async function exampleNgrokLocalTesting() {
  /**
   * Test webhooks locally using ngrok
   */
  // 1. Start your Express webhook receiver:
  //    node github-release-with-webhook.js

  // 2. In another terminal, start ngrok:
  //    ngrok http 3000

  // 3. Use the ngrok HTTPS URL as your webhookUrl:
  const apiKey = process.env.VLOEX_API_KEY;
  const ngrokUrl = "https://abc123.ngrok.io/api/vloex-webhook";  // Replace with your ngrok URL

  const video = await generateReleaseVideoWithWebhook(
    apiKey,
    'vercel',
    'next.js',
    ngrokUrl
  );

  console.log("🔗 Webhook will be delivered to ngrok tunnel");
  console.log("   Check ngrok dashboard to see incoming webhook: http://localhost:4040");
}

// ============================================================================
// Part 5: Production Best Practices
// ============================================================================

/**
 * Production Checklist:
 * --------------------
 *
 * 1. ✅ Verify webhook signatures (use webhookSecret)
 * 2. ✅ Return 200 OK quickly (process async)
 * 3. ✅ Handle duplicate deliveries (use job_id for idempotency)
 * 4. ✅ Validate timestamp (prevent replay attacks)
 * 5. ✅ Use HTTPS webhook URLs (required in production)
 * 6. ✅ Implement retry logic on your side (if webhook processing fails)
 * 7. ✅ Log all webhook events for debugging
 * 8. ✅ Monitor webhook delivery success rate
 *
 * Example Production Setup:
 * -------------------------
 *
 * 1. Use a message queue (Bull, RabbitMQ) to process webhooks async
 * 2. Store webhook events in database for audit trail
 * 3. Implement idempotency using job_id
 * 4. Set up monitoring/alerting for failed webhooks
 * 5. Use webhook signatures in production
 * 6. Have a fallback to polling if webhooks fail
 *
 * Example with Bull Queue:
 * -----------------------
 *
 * const Queue = require('bull');
 * const webhookQueue = new Queue('vloex-webhooks', {
 *   redis: { host: 'localhost', port: 6379 }
 * });
 *
 * app.post('/api/vloex-webhook', async (req, res) => {
 *   // Verify signature...
 *
 *   // Add to queue for async processing
 *   await webhookQueue.add(req.body);
 *
 *   // Return immediately
 *   res.status(200).json({ status: 'queued' });
 * });
 *
 * // Process queue
 * webhookQueue.process(async (job) => {
 *   const { event, job_id, video_url } = job.data;
 *   // Process webhook...
 * });
 */

// ============================================================================
// Module Exports
// ============================================================================

module.exports = {
  generateReleaseVideoWithWebhook,
  verifyWebhookSignature
};

// ============================================================================
// CLI Usage
// ============================================================================

if (require.main === module) {
  // Run Express webhook receiver
  const PORT = process.env.PORT || 3000;

  app.listen(PORT, () => {
    console.log('🚀 Starting VLOEX webhook receiver...');
    console.log(`📡 Webhook endpoint: http://localhost:${PORT}/api/vloex-webhook`);
    console.log('\nTo test:');
    console.log('1. Start ngrok: ngrok http 3000');
    console.log('2. Run: node github-release-with-webhook.js');
    console.log('3. Use ngrok URL as webhookUrl\n');
  });
}
