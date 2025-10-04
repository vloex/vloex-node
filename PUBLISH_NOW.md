# Ready to Publish to npm!

Package name changed to: `vloex` (simpler, no organization needed)

## Run These Commands:

```bash
cd /Users/vegullasatyaveerendra/Desktop/vloex/sdks/node

# Step 1: Login to npm
npm login
# Username: satsvloex
# Password: SecureUsa@9099
# Email: sats@vloex.com

# Step 2: Publish
npm publish

# Step 3: Verify
npm view vloex
```

That's it! After publishing, anyone can install with:
```bash
npm install vloex
```

## Usage after publishing:

```javascript
const vloex = require('vloex')('vs_live_...');
const video = await vloex.videos.create({ script: 'Hello world' });
```

---

**Note:** If you want to use `@vloex/sdk` instead:
1. Create organization at: https://www.npmjs.com/org/create
2. Change package.json name back to `"@vloex/sdk"`
3. Rebuild: `npm run build`
4. Publish: `npm publish --access public`
