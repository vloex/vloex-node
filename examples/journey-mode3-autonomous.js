/**
 * VLOEX SDK Example: Journey Mode 3 - Autonomous Exploration
 * Use this for AI-driven product exploration (Coming in Week 4)
 */
const vloex = require('@vloex/sdk');

async function main() {
  // Initialize VLOEX SDK
  const client = vloex('vs_live_...');  // Replace with your API key

  // Generate video with autonomous exploration
  const result = await client.videos.fromJourney({
    productUrl: 'https://myapp.com',
    mode: 'autonomous',
    goal: 'Show main features and key workflows',
    productContext: 'MyApp Product Tour',
    stepDuration: 15,
    avatarPosition: 'bottom-right',
    tone: 'excited'
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
