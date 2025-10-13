/**
 * VLOEX SDK Example: Journey Mode 1 - Provide Screenshots
 * Use this when you already have screenshots or custom automation
 */
const vloex = require('@vloex/sdk');
const fs = require('fs');

async function main() {
  // Initialize VLOEX SDK
  const client = vloex('vs_live_...');  // Replace with your API key

  // Load screenshots from files
  const screenshot1 = fs.readFileSync('screenshot1.png');
  const screenshot2 = fs.readFileSync('screenshot2.png');

  // Convert to base64
  const screenshot1B64 = screenshot1.toString('base64');
  const screenshot2B64 = screenshot2.toString('base64');

  // Generate video from screenshots
  const result = await client.videos.fromJourney({
    screenshots: [screenshot1B64, screenshot2B64],
    productContext: 'My Product Demo - Key Features',
    stepDuration: 15,
    avatarPosition: 'bottom-right',
    tone: 'professional'
  });

  console.log('Video generated successfully!');
  console.log(`Video URL: ${result.videoUrl}`);
  console.log(`Duration: ${result.durationSeconds}s`);
  console.log(`Cost: $${result.cost.toFixed(2)}`);
}

main().catch(console.error);
