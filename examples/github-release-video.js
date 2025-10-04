/**
 * Generate Videos from GitHub Release Notes
 * ==========================================
 *
 * This example demonstrates how to automatically create announcement videos
 * for GitHub releases using the VLOEX Node.js SDK.
 *
 * Use Case:
 * ---------
 * Perfect for:
 * - Open source project maintainers announcing new releases
 * - Developer relations teams creating release highlight videos
 * - Product teams sharing feature updates
 * - CI/CD pipelines with automated video generation
 *
 * What This Example Does:
 * -----------------------
 * 1. Fetches the latest release from any GitHub repository
 * 2. Extracts key information (version, changes, highlights)
 * 3. Formats a professional video script
 * 4. Generates a video using VLOEX
 * 5. Polls for completion and returns the video URL
 *
 * Requirements:
 * -------------
 * npm install vloex node-fetch
 *
 * Get your API key from: https://vloex.com/dashboard/api-keys
 */

const fetch = require('node-fetch');

/**
 * Fetch the latest release from a GitHub repository.
 *
 * @param {string} repoOwner - GitHub username or organization (e.g., 'vercel')
 * @param {string} repoName - Repository name (e.g., 'next.js')
 * @returns {Promise<object>} Release data from GitHub API
 */
async function fetchLatestRelease(repoOwner, repoName) {
  const url = `https://api.github.com/repos/${repoOwner}/${repoName}/releases/latest`;

  console.log(`🔍 Fetching latest release from ${repoOwner}/${repoName}...`);

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`);
  }

  return response.json();
}

/**
 * Extract key changes from release notes.
 *
 * @param {string} releaseBody - Raw release notes from GitHub
 * @param {number} maxItems - Maximum number of changes to include
 * @returns {string[]} List of change descriptions
 */
function extractReleaseHighlights(releaseBody, maxItems = 5) {
  // Extract bullet points (lines starting with '- ')
  const changes = releaseBody
    .split('\n')
    .filter(line => line.trim().startsWith('- '))
    .map(line => line.slice(2).trim())  // Remove '- ' prefix
    .slice(0, maxItems);

  return changes;
}

/**
 * Format a professional script for the release video.
 *
 * @param {string} version - Release version (e.g., 'v15.5.4')
 * @param {string[]} changes - List of key changes
 * @param {string} repoName - Repository name
 * @returns {string} Formatted video script
 */
function createReleaseScript(version, changes, repoName) {
  let script = `${repoName} ${version} has been released!\n\n`;

  if (changes.length > 0) {
    script += 'This release includes important updates:\n\n';
    script += changes.join('\n');
    script += '\n\n';
  }

  script += 'Check out the full release notes on GitHub!';

  return script.trim();
}

/**
 * Complete workflow: Fetch release → Generate video → Return URL
 *
 * @param {string} apiKey - Your VLOEX API key
 * @param {string} repoOwner - GitHub repository owner
 * @param {string} repoName - GitHub repository name
 * @returns {Promise<object>} Video metadata including URL and status
 */
async function generateReleaseVideo(apiKey, repoOwner, repoName) {
  // Step 1: Initialize VLOEX SDK
  const vloexInit = require('vloex').default || require('vloex');
  const vloex = vloexInit(apiKey);

  // Step 2: Fetch latest release from GitHub
  const release = await fetchLatestRelease(repoOwner, repoName);

  const version = release.tag_name;
  const publishedDate = release.published_at.substring(0, 10);

  console.log(`📦 Found: ${version}`);
  console.log(`📝 Published: ${publishedDate}`);

  // Step 3: Extract and format key changes
  const changes = extractReleaseHighlights(release.body);
  const script = createReleaseScript(version, changes, repoName);

  console.log('\n📄 Video Script:');
  console.log('─'.repeat(60));
  console.log(script);
  console.log('─'.repeat(60));

  // Step 4: Create video job
  console.log('\n🎬 Creating video with VLOEX...');

  try {
    const video = await vloex.videos.create({ script });

    console.log(`✅ Video job created: ${video.id}`);
    console.log(`📊 Initial status: ${video.status}`);

    // Step 5: Poll for completion
    console.log('\n⏳ Waiting for video generation...');

    const maxAttempts = 60;  // 5 minutes max (60 * 5 seconds)
    let attempt = 0;

    while (attempt < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000));  // Wait 5 seconds

      const status = await vloex.videos.retrieve(video.id);
      attempt++;

      // Show progress
      process.stdout.write(`   Attempt ${attempt}/${maxAttempts} - Status: ${status.status}\r`);

      if (status.status === 'completed') {
        console.log('\n\n🎉 Video generation complete!');
        console.log(`🎥 Video URL: ${status.url}`);
        console.log('\n📊 Full Response:');
        console.log(JSON.stringify(status, null, 2));
        return status;
      }

      if (status.status === 'failed') {
        console.log('\n\n❌ Video generation failed');
        console.log(`Error: ${status.error || 'Unknown error'}`);
        return status;
      }
    }

    // Timeout
    console.log('\n\n⏰ Timeout: Video generation took longer than expected');
    console.log('   Check the video status later using:');
    console.log(`   vloex.videos.retrieve("${video.id}")`);

    return await vloex.videos.retrieve(video.id);

  } catch (error) {
    console.log(`\n❌ VLOEX API Error: ${error.message}`);
    if (error.statusCode) {
      console.log(`   HTTP Status: ${error.statusCode}`);
    }
    throw error;
  }
}

/**
 * Example usage with different repositories
 */
async function main() {
  // Get API key from environment variable (recommended for security)
  const apiKey = process.env.VLOEX_API_KEY;

  if (!apiKey) {
    console.log('⚠️  VLOEX_API_KEY environment variable not set');
    console.log('   Set it with: export VLOEX_API_KEY=vs_live_your_key_here');
    console.log('   Or get your key from: https://vloex.com/dashboard/api-keys');
    process.exit(1);
  }

  console.log('🚀 GitHub Release Video Generator');
  console.log('='.repeat(60));

  // Example 1: Next.js Release
  console.log('\n📦 Example: Next.js Latest Release\n');

  try {
    const result = await generateReleaseVideo(
      apiKey,
      'vercel',
      'next.js'
    );

    if (result.status === 'completed') {
      console.log('\n✅ Success! Video is ready to share.');
    }

  } catch (error) {
    console.log(`\n❌ Error: ${error.message}`);
    console.error(error);
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n💡 Try other repositories:');
  console.log('   - facebook/react');
  console.log('   - microsoft/vscode');
  console.log('   - vuejs/vue');
  console.log('   - angular/angular');
  console.log('\n📚 Documentation: https://docs.vloex.com');
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

// Export functions for use as a module
module.exports = {
  fetchLatestRelease,
  extractReleaseHighlights,
  createReleaseScript,
  generateReleaseVideo
};
