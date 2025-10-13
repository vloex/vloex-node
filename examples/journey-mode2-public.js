/**
 * VLOEX SDK Example: Journey Mode 2 - URL with Guided Navigation (Public Site)
 * Use this to automate screenshot capture for public documentation sites
 */
const vloex = require('@vloex/sdk');

async function main() {
  // Initialize VLOEX SDK
  const client = vloex('vs_live_...');  // Replace with your API key

  // Generate video from public URL
  const result = await client.videos.fromJourney({
    productUrl: 'https://api.vloex.com/docs',
    pages: [
      { path: '', description: 'VLOEX API Homepage' },
      { path: '#tag/videos/POST/v1/generate', description: 'Generate Endpoint' },
      { path: '#tag/videos/GET/v1/jobs/{job_id}/status', description: 'Status Endpoint' }
    ],
    productContext: 'VLOEX API Documentation',
    stepDuration: 15,
    avatarPosition: 'bottom-right',
    tone: 'professional'
  });

  if (result.success) {
    console.log('Video generated successfully!');
    console.log(`Video URL: ${result.videoUrl}`);
    console.log(`Duration: ${result.durationSeconds}s`);
    console.log(`File size: ${result.fileSizeMb.toFixed(2)} MB`);
    console.log(`Cost: $${result.cost.toFixed(2)}`);
    console.log(`Steps: ${result.stepsCount}`);
  } else {
    console.error(`Video generation failed: ${result.error}`);
  }
}

main().catch(console.error);
