/**
 * VLOEX SDK Example: Journey Mode 2 - URL with Guided Navigation (Authenticated)
 * Use this to automate screenshot capture for authenticated dashboards
 */
const vloex = require('@vloex/sdk');

async function main() {
  // Initialize VLOEX SDK
  const client = vloex('vs_live_...');  // Replace with your API key

  // Generate video from authenticated URL
  const result = await client.videos.fromJourney({
    productUrl: 'https://myapp.com',
    auth: {
      loginUrl: 'https://myapp.com/login',
      credentials: {
        email: 'demo@example.com',
        password: 'demo123'
      },
      selectors: {
        email: '#email',
        password: '#password',
        submit: 'button[type=submit]'
      }
    },
    pages: [
      { path: '/dashboard', description: 'Main Dashboard' },
      { path: '/analytics', description: 'Analytics View' },
      { path: '/settings', description: 'User Settings' }
    ],
    productContext: 'MyApp Dashboard Tour',
    stepDuration: 20,  // Longer duration for complex dashboards
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
