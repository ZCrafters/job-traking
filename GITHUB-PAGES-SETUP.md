# GitHub Pages Setup Guide

This guide walks you through enabling GitHub Pages for your repository with screenshots descriptions.

## Prerequisites

- You must have admin/write access to the repository
- The repository must be public (or you need GitHub Pro for private repos)

---

## Step-by-Step Setup

### 1. Navigate to Repository Settings

1. Go to your repository: `https://github.com/ZCrafters/job-traking`
2. Click the **Settings** tab (top navigation, far right with gear icon)

📍 You should see "Settings" in the navigation bar between "Security" and "Insights"

### 2. Find GitHub Pages Settings

1. In the left sidebar, scroll down to the "Code and automation" section
2. Click on **Pages** (near the bottom of the sidebar)

📍 Pages settings are located under "Code and automation", below "Actions" and "Webhooks"

### 3. Configure Source

Under the "Build and deployment" section:

**Source Setting:**
- Click the dropdown under "Source"
- Select: **GitHub Actions**
- ❌ Do NOT select "Deploy from a branch" (old method)
- ✅ Select "GitHub Actions" (new method)

**Why GitHub Actions?**
- Automatic deployment on every push to `main`
- Custom build process support (Vite, React, etc.)
- Better control over deployment workflow
- Can trigger manual deployments

### 4. Save Configuration

1. Once "GitHub Actions" is selected, the page will show:
   ```
   ✓ Your site is ready to be published at https://zcrafters.github.io/job-traking/
   ```

2. No "Save" button needed - the setting is saved automatically

### 5. Verify Setup

The page should now show:

```
Source: GitHub Actions
```

And possibly a message like:
```
GitHub Pages will be built and deployed via GitHub Actions workflows
```

---

## First Deployment

### Option A: Push to Main (Automatic)

If you have changes ready:

```bash
git add .
git commit -m "Initial deployment"
git push origin main
```

This automatically triggers the deployment workflow.

### Option B: Manual Trigger

If you want to deploy without new commits:

1. Go to the **Actions** tab in your repository
2. Click "Deploy to GitHub Pages" in the left sidebar
3. Click **Run workflow** button (top right)
4. Select branch: `main`
5. Click the green **Run workflow** button

---

## Monitoring Deployment

### 1. Check Workflow Status

1. Go to **Actions** tab
2. You'll see a workflow run called "Deploy to GitHub Pages"
3. Click on it to see details

**Workflow Steps:**
- ✓ Checkout code
- ✓ Setup Node.js
- ✓ Install dependencies
- ✓ Build project
- ✓ Upload artifact
- ✓ Deploy to GitHub Pages

### 2. Wait for Completion

- **Build time**: Usually 1-3 minutes
- **Deployment time**: Additional 1-2 minutes
- **Total time**: Expect 2-5 minutes for first deployment

### 3. Check Deployment Status

In the Pages settings, you'll see:

```
✓ Your site is live at https://zcrafters.github.io/job-traking/
```

With a timestamp of when it was last deployed.

---

## Accessing Your Deployed Site

Once deployment completes, your site is available at:

```
🌐 https://zcrafters.github.io/job-traking/
```

**Important Notes:**
- The `/job-traking/` path matches your repository name
- This is configured in `vite.config.js` as `base: '/job-traking/'`
- Allow 1-2 minutes after deployment for DNS propagation

---

## Troubleshooting

### "Actions" tab is disabled

**Problem:** You don't see the "Actions" tab

**Solution:**
1. Go to Settings → Actions → General
2. Under "Actions permissions":
   - Select "Allow all actions and reusable workflows"
3. Click "Save"

### Workflow doesn't appear

**Problem:** No "Deploy to GitHub Pages" workflow in Actions

**Solution:**
1. Check that `.github/workflows/deploy.yml` exists in your repository
2. Push to `main` branch to trigger the workflow
3. Refresh the Actions tab

### Build fails

**Problem:** Workflow shows red X (failed)

**Solution:**
1. Click on the failed workflow
2. Click on the "build" job
3. Read error messages
4. Common issues:
   - Missing dependencies → Check `package.json`
   - Build errors → Run `npm run build` locally
   - Node version mismatch → Check workflow uses Node 20

### 404 Error on deployed site

**Problem:** Site shows "404 Page Not Found"

**Solutions:**
1. **Wait longer** - First deployment can take 5-10 minutes
2. **Check base path** - Verify `vite.config.js` has `base: '/job-traking/'`
3. **Verify deployment** - Check Actions tab shows successful deployment
4. **Clear cache** - Try incognito/private browser window
5. **Check Pages settings** - Ensure source is "GitHub Actions"

### Styles not loading

**Problem:** Site loads but looks broken (no CSS)

**Solutions:**
1. Open browser console (F12) and check for 404 errors
2. Verify `base` path in `vite.config.js` matches repository name
3. Hard refresh: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)

---

## Custom Domain (Optional)

Want to use your own domain? (e.g., `jobs.yoursite.com`)

### 1. Add CNAME Record

In your DNS provider, add:

```
Type:  CNAME
Name:  jobs (or @ for root)
Value: zcrafters.github.io
TTL:   3600
```

### 2. Configure in GitHub

1. Go to Settings → Pages
2. Under "Custom domain":
   - Enter: `jobs.yoursite.com`
   - Click "Save"
3. Wait for DNS check (can take 24-48 hours)
4. Enable "Enforce HTTPS" once DNS is verified

### 3. Update Vite Config

Change `vite.config.js`:

```javascript
export default defineConfig({
  base: '/',  // Changed from '/job-traking/'
  // ... rest of config
})
```

Then commit and push to redeploy.

---

## Automatic Updates

Once set up, your site automatically updates:

1. Make changes to your code
2. Commit: `git commit -m "Update feature"`
3. Push: `git push origin main`
4. ✨ Site updates automatically in 2-5 minutes

No manual deployment needed!

---

## Disabling Auto-Deploy (Optional)

If you want to deploy only manually:

1. Edit `.github/workflows/deploy.yml`
2. Remove the `push:` section:
   ```yaml
   on:
     # Remove these lines:
     # push:
     #   branches:
     #     - main
     
     # Keep this:
     workflow_dispatch:
   ```
3. Commit and push this change
4. Now deployments only happen when manually triggered

---

## Security Considerations

### API Keys and Secrets

⚠️ **Never commit API keys directly in code!**

For this project (Firebase & Gemini API):

**Current Setup:**
- API keys are in `index.html` (not ideal for production)

**Better Approach:**
1. Use environment variables
2. Store secrets in GitHub Secrets
3. Inject during build process

**How to add GitHub Secrets:**
1. Go to Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Add your API keys
4. Reference in workflow: `${{ secrets.YOUR_SECRET_NAME }}`

### Public Repository Warning

- This repository is public
- Any committed API keys are visible to everyone
- Consider restricting API keys by domain/IP
- Use Firebase security rules to protect data

---

## Additional Resources

### GitHub Documentation
- [About GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/about-github-pages)
- [Configuring a publishing source](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
- [Using custom workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)

### GitHub Actions
- [Workflow syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [Deploy to GitHub Pages](https://github.com/marketplace/actions/deploy-github-pages-site)

### Vite Deployment
- [Vite static deployment guide](https://vitejs.dev/guide/static-deploy.html)
- [Deploying to GitHub Pages](https://vitejs.dev/guide/static-deploy.html#github-pages)

---

## Quick Reference

| Step | Action | Location |
|------|--------|----------|
| 1 | Enable Pages | Settings → Pages → Source: GitHub Actions |
| 2 | Push code | `git push origin main` |
| 3 | Monitor | Actions tab → "Deploy to GitHub Pages" |
| 4 | Access | `https://zcrafters.github.io/job-traking/` |

---

## Support

If you encounter issues:

1. Check this guide's [Troubleshooting section](#troubleshooting) above
2. Review [DEPLOYMENT.md](DEPLOYMENT.md) for additional detailed solutions
3. Try the [Quick Start Guide](DEPLOYMENT-QUICKSTART.md) for common issues
4. Check [GitHub Pages Status](https://www.githubstatus.com/) for service issues
5. Open an issue in the repository for persistent problems

---

**Ready to deploy? Follow these steps and you'll be live in minutes! 🚀**
