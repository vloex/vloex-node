# VLOEX Node.js SDK

Video generation as a computing primitive.

## Installation

```bash
npm install @vloex/sdk
```

## Usage

```javascript
const vloex = require('@vloex/sdk')('vs_live_...');

// Generate a video
const video = await vloex.videos.create({
  script: 'Version 2.0 is now live with dark mode and AI chat!'
});

console.log(video.id); // → "job_abc123"
console.log(video.status); // → "processing"

// Check status
const updated = await vloex.videos.retrieve(video.id);
console.log(updated.status); // → "completed"
console.log(updated.url); // → "https://..."
```

## API

### `vloex.videos.create(params)`

Create a video from text.

**Parameters:**
- `script` (string, required) - The text script for your video
- `options` (object, optional)
  - `avatar` - Avatar to use (default: 'lily')
  - `voice` - Voice tone (default: 'excited')
  - `background` - Background setting (default: 'modern_office')
  - `webhook_url` - URL to call when complete

**Returns:** `Video` object with `id` and `status`

### `vloex.videos.retrieve(id)`

Get video status and URL.

**Parameters:**
- `id` (string, required) - Video job ID

**Returns:** `Video` object with current status

## Examples

### Basic video generation

```javascript
const vloex = require('@vloex/sdk')('vs_live_...');

const video = await vloex.videos.create({
  script: 'We just shipped a major update!'
});
```

### With options

```javascript
const video = await vloex.videos.create({
  script: 'Check out our new features',
  options: {
    avatar: 'lily',
    voice: 'professional',
    background: 'modern_office'
  }
});
```

### Wait for completion

```javascript
const video = await vloex.videos.create({
  script: 'Release notes for v2.0'
});

// Poll until complete
while (true) {
  const status = await vloex.videos.retrieve(video.id);

  if (status.status === 'completed') {
    console.log('Video ready:', status.url);
    break;
  }

  if (status.status === 'failed') {
    console.error('Failed:', status.error);
    break;
  }

  await new Promise(r => setTimeout(r, 5000)); // Wait 5s
}
```

### Using webhooks

```javascript
const video = await vloex.videos.create({
  script: 'Product update',
  options: {
    webhook_url: 'https://yourapp.com/webhooks/vloex'
  }
});

// VLOEX will POST to your webhook when done
```

## Error Handling

```javascript
const vloex = require('@vloex/sdk')('vs_live_...');

try {
  const video = await vloex.videos.create({
    script: 'Hello world'
  });
} catch (error) {
  if (error.statusCode === 401) {
    console.error('Invalid API key');
  } else if (error.statusCode === 429) {
    console.error('Rate limit exceeded');
  } else {
    console.error('Error:', error.message);
  }
}
```

## TypeScript

Full TypeScript support included:

```typescript
import vloex from '@vloex/sdk';
import { Video, GenerateParams } from '@vloex/sdk';

const client = vloex('vs_live_...');

const params: GenerateParams = {
  script: 'New release',
  options: { avatar: 'lily' }
};

const video: Video = await client.videos.create(params);
```

## Documentation

Full API documentation: https://docs.vloex.com

## Support

- GitHub: https://github.com/vloex/vloex-node
- Email: support@vloex.com
- Docs: https://docs.vloex.com

## License

MIT
