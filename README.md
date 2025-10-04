# VLOEX Node.js SDK

Official Node.js SDK for VLOEX - Turn text into professional videos with AI.

[![npm version](https://badge.fury.io/js/%40vloex%2Fsdk.svg)](https://www.npmjs.com/package/@vloex/sdk)
[![Node.js 14+](https://img.shields.io/badge/node-14+-green.svg)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 📦 Installation

```bash
npm install @vloex/sdk
```

**Requirements:** Node.js 14 or higher

---

## 🚀 Quick Start (5 minutes)

### Step 1: Get Your API Key

1. Sign up at [vloex.com](https://vloex.com)
2. Go to **Dashboard** → **API Keys**
3. Click **Create New Key**
4. Copy your key (starts with `vs_live_...`)

### Step 2: Set Your API Key

**Option A: Environment Variable (Recommended)**
```bash
export VLOEX_API_KEY='vs_live_your_key_here'
```

**Option B: In Code**
```javascript
const Vloex = require('@vloex/sdk');

const vloex = new Vloex('vs_live_your_key_here');
```

### Step 3: Generate Your First Video

```javascript
const Vloex = require('@vloex/sdk');

// Initialize client
const vloex = new Vloex('vs_live_your_key_here');

// Create a video
const video = await vloex.videos.create({
  script: "Hello! This is my first AI-generated video using VLOEX."
});

console.log(`✅ Video job created: ${video.id}`);
console.log(`📊 Status: ${video.status}`);
```

### Step 4: Wait for Video to Complete

```javascript
// Poll for completion (simple approach)
while (true) {
  const status = await vloex.videos.retrieve(video.id);

  if (status.status === 'completed') {
    console.log(`🎉 Video ready!`);
    console.log(`📹 URL: ${status.url}`);
    break;
  }

  if (status.status === 'failed') {
    console.log(`❌ Failed: ${status.error}`);
    break;
  }

  console.log(`⏳ Status: ${status.status}... waiting 5 seconds`);
  await new Promise(resolve => setTimeout(resolve, 5000));
}
```

**That's it!** You just created your first AI video. 🎉

---

## 📚 Complete Guide for Beginners

### Understanding Video Generation

1. **You send text** (the script for your video)
2. **VLOEX processes it** (creates video with AI avatar, voice, visuals)
3. **You get back a video URL** (ready to share/download)

**Important:** Video generation takes 2-5 minutes. You have two options:

#### Option 1: Polling (Simple but not ideal)
```javascript
// ❌ Keep checking "is it done yet?" every 5 seconds
while (video.status !== 'completed') {
  await new Promise(resolve => setTimeout(resolve, 5000));
  video = await vloex.videos.retrieve(video.id);
}
```

❌ **Problem:** Wastes API calls, blocks your code

#### Option 2: Webhooks (Recommended ✅)
```javascript
// ✅ Get notified when video is ready - no polling needed!
const video = await vloex.videos.create({
  script: "Hello world",
  webhookUrl: "https://your-app.com/webhook"  // We'll call this when done
});
// Your code continues immediately!
```

✅ **Better:** Event-driven, no wasted API calls, non-blocking

---

## 🎯 Step-by-Step Examples

### Example 1: Basic Video (For Testing)

**Goal:** Create a simple video to test your API key

```javascript
const Vloex = require('@vloex/sdk');

// Step 1: Get API key from environment
const apiKey = process.env.VLOEX_API_KEY;

// Step 2: Initialize client
const vloex = new Vloex(apiKey);

// Step 3: Create video
const video = await vloex.videos.create({
  script: "Testing VLOEX API. This is my first video!"
});

console.log(`Job ID: ${video.id}`);
console.log(`Status: ${video.status}`);
```

**What you'll get:**
- `job_id`: Unique ID like `"abc-123-def-456"`
- `status`: Initially `"pending"` or `"processing"`

---

### Example 2: Wait for Video with Polling

**Goal:** Generate video and wait until it's ready

```javascript
const Vloex = require('@vloex/sdk');

const vloex = new Vloex('vs_live_your_key_here');

// Create video
const video = await vloex.videos.create({
  script: "This video demonstrates polling. We'll check every 5 seconds until it's done."
});

console.log(`🎬 Creating video: ${video.id}`);
console.log("⏳ Waiting for completion...\n");

// Poll every 5 seconds
const maxWait = 300000; // 5 minutes
const startTime = Date.now();

while (Date.now() - startTime < maxWait) {
  // Get current status
  const status = await vloex.videos.retrieve(video.id);

  console.log(`Status: ${status.status}`);

  if (status.status === 'completed') {
    console.log(`\n✅ SUCCESS!`);
    console.log(`📹 Video URL: ${status.url}`);
    console.log(`⏱️  Took ${Math.floor((Date.now() - startTime) / 1000)} seconds`);
    break;
  }

  if (status.status === 'failed') {
    console.log(`\n❌ FAILED: ${status.error || 'Unknown error'}`);
    break;
  }

  // Wait before checking again
  await new Promise(resolve => setTimeout(resolve, 5000));
}

if (Date.now() - startTime >= maxWait) {
  console.log("\n⏱️ Timeout: Video took too long");
}
```

---

### Example 3: Webhooks (Best Practice)

**Goal:** Get notified when video is ready without polling

**Step 1: Create a webhook receiver (Express.js)**

```javascript
// webhook_receiver.js
const express = require('express');
const crypto = require('crypto');

const app = express();
app.use(express.json());

app.post('/webhook', (req, res) => {
  // Receive VLOEX webhook when video completes

  const payload = req.body;

  // Handle different events
  if (payload.event === 'video.completed') {
    console.log(`✅ Video ${payload.job_id} completed!`);
    console.log(`📹 URL: ${payload.video_url}`);

    // TODO: Your code here
    // - Save to database
    // - Send email notification
    // - Upload to CDN
    // - etc.

  } else if (payload.event === 'video.failed') {
    console.log(`❌ Video ${payload.job_id} failed!`);
    console.log(`Error: ${payload.error}`);
  }

  // Always return 200 OK
  res.status(200).json({ status: 'received' });
});

app.listen(3000, () => {
  console.log('📡 Webhook receiver listening on port 3000');
});
```

**Step 2: Generate video with webhook**

```javascript
// generate_with_webhook.js
const Vloex = require('@vloex/sdk');

const vloex = new Vloex('vs_live_your_key_here');

// Create video with webhook
const video = await vloex.videos.create({
  script: "This video uses webhooks. No polling needed!",
  webhookUrl: "https://your-app.com/webhook"  // Your Express endpoint
});

console.log(`✅ Video job created: ${video.id}`);
console.log(`📤 Webhook will be called when ready!`);
console.log(`🚀 Your code can continue immediately...`);

// Your code continues - no need to wait!
// Webhook will notify you when done
```

**Step 3: Test locally with ngrok**

```bash
# Terminal 1: Start Express webhook receiver
node webhook_receiver.js

# Terminal 2: Start ngrok tunnel
ngrok http 3000

# Terminal 3: Use ngrok URL in your code
node generate_with_webhook.js
```

**Full example:** See [examples/github-release-with-webhook.js](./examples/github-release-with-webhook.js)

---

### Example 4: Real-World - GitHub Release Videos

**Goal:** Automatically create videos for GitHub releases

```javascript
const Vloex = require('@vloex/sdk');
const axios = require('axios');

// Step 1: Fetch latest GitHub release
const releaseUrl = 'https://api.github.com/repos/vercel/next.js/releases/latest';
const { data: release } = await axios.get(releaseUrl);

// Step 2: Extract information
const version = release.tag_name;  // e.g., "v15.5.4"
const changes = release.body.substring(0, 500);  // First 500 chars

// Step 3: Create video script
const script = `
Hey everyone! ${version} is here!

We're excited to announce Next.js ${version} with some amazing updates.

${changes}

Check out the full release notes on GitHub to learn more.
Update now to get these improvements!
`;

// Step 4: Generate video
const vloex = new Vloex('vs_live_your_key_here');

const video = await vloex.videos.create({ script });

console.log(`✅ Release video created: ${video.id}`);
```

**Full example:** See [examples/github-release-video.js](./examples/github-release-video.js)

---

## 📖 API Reference

### Initialize Client

```javascript
const Vloex = require('@vloex/sdk');

// From environment variable
const vloex = new Vloex();  // Reads VLOEX_API_KEY automatically

// Or pass directly
const vloex = new Vloex('vs_live_your_key_here');

// With custom options
const vloex = new Vloex('vs_live_...', {
  baseUrl: 'https://api.vloex.com',  // Custom API endpoint
  timeout: 30000  // Request timeout in milliseconds
});
```

---

### Create Video

```javascript
const video = await vloex.videos.create({
  script: "Your video script here",

  // Optional: Customize avatar, voice, background
  options: {
    avatar: 'lily',              // Professional female (default)
    voice: 'excited',            // Enthusiastic tone (default)
    background: 'modern_office'  // Clean workspace (default)
  },

  // Optional: Webhook for async notification
  webhookUrl: "https://your-app.com/webhook",
  webhookSecret: "your_secret_key"  // For HMAC verification
});
```

**Available Customization:**

| Option | Values | Description |
|--------|--------|-------------|
| `avatar` | `lily` (default), `anna`, `tyler` | AI presenter |
| `voice` | `excited` (default), `friendly`, `professional` | Voice tone |
| `background` | `modern_office` (default), `conference_room`, `tech_office` | Background scene |

**Returns:**
```javascript
{
  id: 'abc-123-def-456',       // Job ID
  status: 'pending',            // Current status
  createdAt: '2025-01-04...',  // Timestamp
  estimatedCompletion: '...'   // When it should be done
}
```

---

### Get Video Status

```javascript
const video = await vloex.videos.retrieve('abc-123-def-456');
```

**Returns:**
```javascript
{
  id: 'abc-123-def-456',
  status: 'completed',  // pending | processing | completed | failed
  url: 'https://...',   // Video URL (when completed)
  thumbnailUrl: '...', // Preview image
  duration: 12.5,       // Video length in seconds
  error: null,          // Error message (if failed)
  createdAt: '...',
  updatedAt: '...'
}
```

---

## 🔐 Webhooks (Advanced)

### Why Use Webhooks?

**Polling (Old Way):**
```javascript
// ❌ Bad: Wastes API calls, blocks code
while (video.status !== 'completed') {
  await new Promise(resolve => setTimeout(resolve, 5000));
  video = await vloex.videos.retrieve(video.id);  // API call every 5s
}
```

**Webhooks (Modern Way):**
```javascript
// ✅ Good: Event-driven, no wasted calls, non-blocking
const video = await vloex.videos.create({
  script: "...",
  webhookUrl: "https://your-app.com/webhook"
});
// Your code continues immediately!
// Webhook notifies you when done
```

### Webhook Payload

When video completes, VLOEX sends:

```http
POST https://your-app.com/webhook
Content-Type: application/json

{
  "event": "video.completed",
  "job_id": "abc-123",
  "status": "completed",
  "video_url": "https://api.vloex.com/videos/abc-123.mp4",
  "error": null,
  "timestamp": "2025-01-04T12:00:00Z"
}
```

### Webhook Security (HMAC Verification)

```javascript
const express = require('express');
const crypto = require('crypto');

const app = express();
app.use(express.json());

const WEBHOOK_SECRET = 'your_secret_key';

app.post('/webhook', (req, res) => {
  // Get signature from headers
  const signature = req.headers['x-vloex-signature'] || '';
  const timestamp = req.headers['x-vloex-timestamp'] || '';

  // Get payload as JSON string
  const payloadJson = JSON.stringify(req.body);

  // Verify signature
  if (!verifySignature(payloadJson, signature, timestamp, WEBHOOK_SECRET)) {
    return res.status(401).send('Invalid signature');
  }

  // Process webhook
  const payload = req.body;
  console.log(`Video ${payload.job_id} completed!`);

  res.status(200).send('OK');
});

function verifySignature(payload, signature, timestamp, secret) {
  // Check timestamp (prevent replay attacks)
  const currentTime = Math.floor(Date.now() / 1000);
  if (Math.abs(currentTime - parseInt(timestamp)) > 300) {  // 5 min tolerance
    return false;
  }

  // Calculate expected signature
  const message = `${timestamp}.${payload}`;
  const expected = crypto
    .createHmac('sha256', secret)
    .update(message)
    .digest('hex');

  // Compare (constant-time to prevent timing attacks)
  const provided = signature.split('=')[1] || signature;
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected),
      Buffer.from(provided)
    );
  } catch (e) {
    return false;
  }
}

app.listen(3000);
```

**Full webhook guide:** [Backend WEBHOOKS.md](https://github.com/vloex/vloex-video/blob/main/backend/WEBHOOKS.md)

---

## ⚠️ Error Handling

```javascript
const { Vloex, VloexError } = require('@vloex/sdk');

const vloex = new Vloex('vs_live_...');

try {
  const video = await vloex.videos.create({ script: "Hello world" });

} catch (error) {
  if (error instanceof VloexError) {
    // Handle specific errors
    if (error.statusCode === 401) {
      console.error("❌ Invalid API key");
      console.error("Get your key from: https://vloex.com/dashboard");

    } else if (error.statusCode === 429) {
      console.error("❌ Rate limit exceeded");
      console.error("Wait a moment and try again");

    } else if (error.statusCode === 402) {
      console.error("❌ Quota exceeded");
      console.error("Upgrade your plan or wait for reset");

    } else {
      console.error(`❌ Error: ${error.message}`);
      console.error(`Status: ${error.statusCode}`);
    }
  } else {
    // Unexpected error
    console.error("Unexpected error:", error);
  }
}
```

**Common Error Codes:**

| Code | Error | Solution |
|------|-------|----------|
| 401 | Invalid API key | Check your key at vloex.com/dashboard |
| 429 | Rate limit exceeded | Wait 1 minute or upgrade plan |
| 402 | Quota exceeded | Upgrade plan or wait for monthly reset |
| 400 | Bad request | Check your script/parameters |
| 500 | Server error | Retry in a few seconds |

---

## 📁 Real-World Examples

See the [`examples/`](./examples) directory for production-ready code:

### 1. [GitHub Release Videos](./examples/github-release-video.js)
Automatically create announcement videos from GitHub releases.

**Perfect for:**
- Open source project maintainers
- DevRel teams
- Product announcements
- CI/CD pipelines

**What it does:**
1. Fetches latest release from GitHub API
2. Extracts version and changes
3. Generates professional video
4. Returns shareable URL

### 2. [GitHub Releases with Webhooks](./examples/github-release-with-webhook.js) 🆕
Same as above but using webhooks (event-driven).

**Includes:**
- Complete Express.js webhook receiver
- HMAC signature verification
- Production best practices
- ngrok local testing setup

---

## 🛠️ Advanced Configuration

### Custom API Endpoint

```javascript
const vloex = new Vloex('vs_live_...', {
  baseUrl: 'https://custom-api.vloex.com'
});
```

### Request Timeout

```javascript
const vloex = new Vloex('vs_live_...', {
  timeout: 60000  // 60 seconds (default: 30000)
});
```

### Debug Mode

```javascript
const vloex = new Vloex('vs_live_...', {
  debug: true  // Logs all API requests/responses
});
```

---

## 🚀 Best Practices

### 1. Use Environment Variables for API Keys
```javascript
// ✅ Good
const vloex = new Vloex(process.env.VLOEX_API_KEY);

// ❌ Bad (hardcoded key)
const vloex = new Vloex('vs_live_abc123');  // Don't commit this!
```

### 2. Use Webhooks in Production
```javascript
// ✅ Good: Event-driven
const video = await vloex.videos.create({
  script: "...",
  webhookUrl: "https://your-app.com/webhook"
});

// ❌ Bad: Polling wastes API calls
while (video.status !== 'completed') {
  await new Promise(resolve => setTimeout(resolve, 5000));
  video = await vloex.videos.retrieve(video.id);
}
```

### 3. Handle Errors Gracefully
```javascript
// ✅ Good
try {
  const video = await vloex.videos.create({ script: "..." });
} catch (error) {
  logger.error(`Video failed: ${error}`);
  return fallbackVideoUrl;
}
```

### 4. Set Reasonable Timeouts
```javascript
// ✅ Good: Set timeout based on your use case
const vloex = new Vloex(apiKey, { timeout: 60000 });
```

---

## 📚 Resources

- **Documentation:** https://api.vloex.com/docs
- **Node.js SDK:** https://github.com/vloex/vloex-node
- **Python SDK:** https://github.com/vloex/vloex-python
- **Webhook Guide:** [WEBHOOKS.md](https://github.com/vloex/vloex-video/blob/main/backend/WEBHOOKS.md)
- **Examples:** [examples/](./examples)
- **npm Package:** https://www.npmjs.com/package/@vloex/sdk

---

## 🆘 Support

- **Email:** support@vloex.com
- **GitHub Issues:** https://github.com/vloex/vloex-node/issues
- **Documentation:** https://docs.vloex.com

---

## 📝 Changelog

### v0.1.1 (2025-01-04)
- ✨ Added webhook support for async notifications
- 📝 Comprehensive documentation with step-by-step guides
- 🔒 HMAC signature verification for webhooks
- 📚 Real-world examples (GitHub releases)

### v0.1.0 (2025-01-03)
- 🎉 Initial release
- ✅ Video generation with polling
- ✅ Error handling
- ✅ TypeScript definitions

---

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details

---

**Made with ❤️ by the VLOEX team**
