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

## 🚀 Quick Start

### Step 1: Get Your API Key

1. Sign up at [vloex.com](https://vloex.com)
2. Go to **Dashboard** → **API Keys**
3. Click **Create New Key**
4. Copy your key (starts with `vs_live_...`)

### Step 2: Create Your First Video

```javascript
const Vloex = require('@vloex/sdk');

// Initialize with your API key
const vloex = new Vloex('vs_live_your_key_here');

// Create a video
const video = await vloex.videos.create({
  script: "Hello! This is my first AI-generated video."
});

console.log(`✅ Video created: ${video.id}`);
console.log(`📊 Status: ${video.status}`);
```

### Step 3: Get Your Video

```javascript
// Wait for video to complete
while (true) {
  const status = await vloex.videos.retrieve(video.id);

  if (status.status === 'completed') {
    console.log(`🎉 Video ready: ${status.url}`);
    break;
  }

  if (status.status === 'failed') {
    console.log(`❌ Failed: ${status.error}`);
    break;
  }

  await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5s
}
```

**That's it!** Your video is ready to share.

---

## 📖 Usage

### Basic Video Generation

```javascript
const Vloex = require('@vloex/sdk');

const vloex = new Vloex('vs_live_your_key_here');

// Simple text to video
const video = await vloex.videos.create({
  script: "We just launched version 2.0 with dark mode!"
});
```

### With Custom Options

```javascript
const video = await vloex.videos.create({
  script: "Welcome to our product demo!",
  options: {
    avatar: 'lily',         // Professional presenter
    voice: 'friendly',      // Warm tone
    background: 'modern_office'
  }
});
```

### Using Environment Variables

```javascript
const Vloex = require('@vloex/sdk');

// Set environment variable
// export VLOEX_API_KEY='vs_live_...'

const vloex = new Vloex(process.env.VLOEX_API_KEY);
const video = await vloex.videos.create({ script: "..." });
```

### With Webhooks (Get Notified When Ready)

```javascript
const video = await vloex.videos.create({
  script: "Your video content here",
  webhookUrl: "https://your-app.com/webhook"
});

// Your code continues immediately
// We'll POST to your webhook when the video is ready
```

---

## 📚 API Reference

### `vloex.videos.create()`

Create a new video.

**Parameters:**
- `script` (string, required) - The text script for your video
- `options` (object, optional) - Customize avatar, voice, background
  - `avatar`: `'lily'` (default), `'anna'`, `'tyler'`
  - `voice`: `'excited'` (default), `'friendly'`, `'professional'`
  - `background`: `'modern_office'` (default), `'conference_room'`, `'tech_office'`
- `webhookUrl` (string, optional) - URL to receive completion notification

**Returns:**
```javascript
{
  id: 'abc-123-def-456',
  status: 'pending',
  createdAt: '2025-01-04T12:00:00Z',
  estimatedCompletion: '2025-01-04T12:05:00Z'
}
```

### `vloex.videos.retrieve(id)`

Get video status and URL.

**Parameters:**
- `id` (string, required) - Video job ID

**Returns:**
```javascript
{
  id: 'abc-123-def-456',
  status: 'completed',  // or 'pending', 'processing', 'failed'
  url: 'https://...',   // Video URL when completed
  duration: 12.5,       // Video length in seconds
  createdAt: '...',
  updatedAt: '...'
}
```

---

## 💡 Examples

### Example 1: Simple Video

```javascript
const Vloex = require('@vloex/sdk');

const vloex = new Vloex('vs_live_your_key_here');

const video = await vloex.videos.create({
  script: "Check out our new features!"
});

console.log(`Video ID: ${video.id}`);
```

### Example 2: GitHub Release Announcement

```javascript
const Vloex = require('@vloex/sdk');
const axios = require('axios');

// Fetch latest release
const { data: release } = await axios.get(
  'https://api.github.com/repos/vercel/next.js/releases/latest'
);

// Create announcement video
const vloex = new Vloex('vs_live_your_key_here');

const video = await vloex.videos.create({
  script: `Next.js ${release.tag_name} is here! ${release.body.substring(0, 200)}`
});

console.log(`Release video: ${video.id}`);
```

**See more examples:** [examples/](./examples)

---

## ⚠️ Error Handling

```javascript
const { Vloex, VloexError } = require('@vloex/sdk');

const vloex = new Vloex('vs_live_...');

try {
  const video = await vloex.videos.create({ script: "Hello!" });

} catch (error) {
  if (error instanceof VloexError) {
    if (error.statusCode === 401) {
      console.error("Invalid API key");
    } else if (error.statusCode === 429) {
      console.error("Rate limit exceeded - wait a moment");
    } else if (error.statusCode === 402) {
      console.error("Quota exceeded - upgrade your plan");
    } else {
      console.error(`Error: ${error.message}`);
    }
  }
}
```

**Common Errors:**

| Code | Meaning | What to Do |
|------|---------|------------|
| 401 | Invalid API key | Check your key at vloex.com/dashboard |
| 429 | Too many requests | Wait 60 seconds and try again |
| 402 | Quota exceeded | Upgrade your plan |
| 400 | Bad request | Check your script/parameters |
| 500 | Server error | Retry in a few seconds |

---

## 🔧 Advanced

### Custom Timeout

```javascript
const vloex = new Vloex('vs_live_...', {
  timeout: 60000  // milliseconds
});
```

### Custom API Endpoint

```javascript
const vloex = new Vloex('vs_live_...', {
  baseUrl: 'https://custom-api.example.com'
});
```

### Debug Mode

```javascript
const vloex = new Vloex('vs_live_...', {
  debug: true  // Logs all API requests
});
```

---

## 📚 Resources

- **Documentation:** https://docs.vloex.com
- **API Docs:** https://api.vloex.com/docs
- **Examples:** [examples/](./examples)
- **GitHub:** https://github.com/vloex/vloex-node
- **npm Package:** https://www.npmjs.com/package/@vloex/sdk

---

## 🆘 Support

- **Email:** support@vloex.com
- **Issues:** https://github.com/vloex/vloex-node/issues

---

## 📄 License

MIT License
