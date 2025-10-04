# VLOEX Node.js SDK Examples

Production-ready examples showing real-world use cases for the VLOEX Node.js SDK.

## 📦 Available Examples

### [github-release-video.js](./github-release-video.js)
**Automatically generate announcement videos from GitHub releases**

Perfect for:
- Open source project maintainers
- Developer relations teams
- Product teams sharing feature updates
- CI/CD pipelines

**What it does:**
1. Fetches the latest release from any GitHub repository
2. Extracts key changes and highlights
3. Formats a professional video script
4. Generates and polls for video completion
5. Returns the final video URL

### [github-release-with-webhook.js](./github-release-with-webhook.js) 🆕
**GitHub release videos with webhooks (async notifications)**

**Why webhooks?**
- ✅ No polling required - get instant notifications when video is ready
- ✅ Reduced API calls - save on rate limits
- ✅ Better architecture - event-driven, not polling-based
- ✅ Perfect for long-running tasks and serverless environments

**What it includes:**
1. Video generation with webhook URL
2. Complete Express.js webhook receiver with signature verification
3. HMAC security implementation (crypto module)
4. Production best practices
5. ngrok setup for local testing

**Run it:**
```bash
# Set your API key
export VLOEX_API_KEY=vs_live_your_key_here

# Install dependencies
npm install @vloex/sdk node-fetch

# Run the example
node github-release-video.js
```

**Customize it:**
```javascript
// Try different repositories
await generateReleaseVideo(apiKey, 'facebook', 'react');
await generateReleaseVideo(apiKey, 'microsoft', 'vscode');
await generateReleaseVideo(apiKey, 'vuejs', 'vue');
```

**Use as a module:**
```javascript
const { generateReleaseVideo } = require('./github-release-video');

const video = await generateReleaseVideo(
  process.env.VLOEX_API_KEY,
  'your-org',
  'your-repo'
);

console.log(`Video ready: ${video.url}`);
```

## 🔑 Getting Your API Key

1. Sign up at [vloex.com](https://vloex.com)
2. Go to Dashboard → API Keys
3. Create a new key or copy your existing key
4. Set it as an environment variable: `export VLOEX_API_KEY=vs_live_...`

## 🚀 More Examples Coming Soon

- **CI/CD Pipeline Notifications** - Send video updates when builds complete
- **Product Launch Announcements** - Auto-generate launch videos from product data
- **Customer Onboarding** - Create personalized welcome videos
- **Social Media Automation** - Generate content for Twitter, LinkedIn, etc.

## 📚 Documentation

- [Node.js SDK Documentation](../README.md)
- [VLOEX API Docs](https://api.vloex.com/docs)
- [Get Support](https://github.com/vloex/vloex-node/issues)

## 💡 Contributing Examples

Have a great use case? We'd love to add it!

1. Fork the repository
2. Create your example file
3. Add comprehensive JSDoc comments
4. Submit a pull request

Make sure your example:
- Solves a real-world problem
- Includes detailed comments
- Handles errors gracefully
- Uses environment variables for API keys
- Supports both CommonJS and ES modules where possible
- Follows JavaScript/TypeScript best practices
