# 🚀 Deployment Guide - Job Application Tracker

This guide will help you deploy the Job Application Tracker to GitHub Pages.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Quick Deploy (Automatic)](#quick-deploy-automatic)
- [Manual Deployment Steps](#manual-deployment-steps)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)
- [Advanced Topics](#advanced-topics)

---

## Prerequisites

Before deploying, ensure you have:

1. **GitHub Account**: You need a GitHub account with access to this repository
2. **Repository Access**: You must have push access to the `main` branch
3. **Firebase Setup** (for backend functionality):
   - A Firebase project created
   - Firestore database enabled
   - Authentication enabled
   - API keys configured in your application
4. **Google Gemini API Key** (for AI features):
   - Obtain from [Google AI Studio](https://makersuite.google.com/app/apikey)

---

## Quick Deploy (Automatic)

The easiest way to deploy is using GitHub Actions, which is already configured:

### Step 1: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** → **Pages** (in the left sidebar)
3. Under "Build and deployment":
   - **Source**: Select "GitHub Actions"
   - This allows GitHub Actions to deploy directly
4. Click **Save**

### Step 2: Push to Main Branch

The deployment workflow automatically triggers when you push to the `main` branch:

```bash
# Make sure your changes are committed
git add .
git commit -m "Your commit message"

# Push to main branch
git push origin main
```

### Step 3: Monitor Deployment

1. Go to the **Actions** tab in your GitHub repository
2. You'll see the "Deploy to GitHub Pages" workflow running
3. Wait for it to complete (usually takes 2-5 minutes)
4. Once complete, your site will be live at:
   ```
   https://zcrafters.github.io/job-traking/
   ```

---

## Manual Deployment Steps

If you prefer to deploy manually or need to trigger a deployment without pushing to main:

### Option 1: Manual Workflow Trigger

1. Go to **Actions** tab in GitHub
2. Select "Deploy to GitHub Pages" workflow
3. Click **Run workflow** dropdown
4. Select the `main` branch
5. Click **Run workflow**

### Option 2: Build and Deploy Locally

```bash
# 1. Install dependencies
npm install

# 2. Build the project
npm run build

# 3. The build will be in the 'dist' folder
# You can preview it locally before deploying:
npm run preview

# 4. Deploy using GitHub Pages CLI (optional)
npx gh-pages -d dist
```

**Note**: For option 2, you need the `gh-pages` package:
```bash
npm install --save-dev gh-pages
```

---

## Configuration

### Base Path Configuration

The application is configured to run at `/job-traking/` path. This is set in `vite.config.js`:

```javascript
export default defineConfig({
  base: '/job-traking/',
  // ... other config
})
```

**Important**: If you want to deploy to a different path or custom domain:

#### For Root Domain (yourusername.github.io)
Change `base: '/job-traking/'` to `base: '/'`

#### For Custom Subdomain
Keep the current configuration or adjust to match your subdomain structure.

### Environment Variables

For production deployment with Firebase and Gemini API:

1. **Firebase Configuration**: Update in your `index.html` or configuration file:
   ```javascript
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_PROJECT.firebaseapp.com",
     projectId: "YOUR_PROJECT_ID",
     // ... other config
   };
   ```

2. **Gemini API Key**: Configure in your application:
   ```javascript
   const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY";
   ```

**Security Note**: For production, consider using environment variables or GitHub Secrets instead of hardcoding API keys.

---

## Troubleshooting

### Issue: Deployment Workflow Fails

**Symptoms**: The GitHub Action shows a red X and fails to deploy.

**Solutions**:
1. Check the Actions tab for error messages
2. Ensure all dependencies in `package.json` are correct
3. Verify the build succeeds locally: `npm run build`
4. Check that Node.js version matches (v20 specified in workflow)

### Issue: 404 Page Not Found After Deployment

**Symptoms**: Site deploys but shows 404 error.

**Solutions**:
1. Verify GitHub Pages is enabled (Settings → Pages)
2. Check that source is set to "GitHub Actions"
3. Ensure the `base` path in `vite.config.js` matches your repository name
4. Wait a few minutes - GitHub Pages can take time to propagate

### Issue: Assets Not Loading (CSS/JS 404s)

**Symptoms**: Page loads but no styling, JavaScript errors in console.

**Solutions**:
1. Check the browser console for 404 errors
2. Verify the `base` path in `vite.config.js` is correct
3. Ensure all asset paths are relative (not absolute)
4. Clear browser cache and hard refresh (Ctrl+Shift+R)

### Issue: Firebase/API Features Not Working

**Symptoms**: Application loads but AI features or data persistence don't work.

**Solutions**:
1. Verify Firebase configuration is correct
2. Check Firebase Console for API restrictions
3. Ensure Gemini API key is valid and has quota
4. Check browser console for authentication errors
5. Verify Firebase security rules allow read/write operations

### Issue: Build Fails with "Out of Memory"

**Symptoms**: Build process crashes during deployment.

**Solutions**:
1. Increase Node.js memory:
   ```bash
   NODE_OPTIONS=--max-old-space-size=4096 npm run build
   ```
2. Update the GitHub Actions workflow to include this setting
3. Optimize your dependencies and bundle size

---

## Advanced Topics

### Custom Domain Setup

To use a custom domain (e.g., `jobs.yourdomain.com`):

1. **Add CNAME file**:
   ```bash
   echo "jobs.yourdomain.com" > public/CNAME
   ```

2. **Update DNS Settings**:
   - Add a CNAME record pointing to `zcrafters.github.io`
   - Or add A records pointing to GitHub's IPs

3. **Configure in GitHub**:
   - Go to Settings → Pages
   - Enter your custom domain
   - Enable "Enforce HTTPS"

4. **Update base path** in `vite.config.js`:
   ```javascript
   base: '/'  // For custom domain at root
   ```

### Deployment Environments

To set up staging and production environments:

1. **Create branches**:
   - `main` → Production
   - `staging` → Staging environment

2. **Modify workflow** to deploy staging branch:
   ```yaml
   on:
     push:
       branches:
         - main
         - staging
   ```

3. **Use different base paths**:
   - Production: `/job-traking/`
   - Staging: `/job-traking-staging/`

### Performance Optimization

Before deploying, optimize your build:

1. **Enable source maps for debugging** (optional):
   ```javascript
   // vite.config.js
   build: {
     sourcemap: true
   }
   ```

2. **Analyze bundle size**:
   ```bash
   npm run build -- --report
   ```

3. **Enable compression** in GitHub Pages:
   - GitHub Pages automatically serves gzipped content
   - Ensure your assets are optimized

### Continuous Deployment

The current setup already implements CD (Continuous Deployment):

- **Trigger**: Every push to `main` branch
- **Process**: Automated build → test → deploy
- **Rollback**: Revert commit or redeploy previous version

To disable auto-deployment:
- Remove the `push` trigger from `.github/workflows/deploy.yml`
- Keep only `workflow_dispatch` for manual triggers

### Monitoring and Analytics

To track your deployed application:

1. **Add Google Analytics**:
   ```html
   <!-- Add to index.html -->
   <script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
   ```

2. **Monitor GitHub Pages**:
   - View deployment history in Actions tab
   - Check Pages build status in Settings

3. **Error Tracking**:
   - Consider adding Sentry for error monitoring
   - Use browser console for debugging

---

## Deployment Checklist

Before going live, verify:

- [ ] All API keys are configured correctly
- [ ] Firebase security rules are properly set
- [ ] Base path in `vite.config.js` is correct
- [ ] Build succeeds locally (`npm run build`)
- [ ] Preview looks correct (`npm run preview`)
- [ ] GitHub Pages is enabled with correct source
- [ ] All sensitive data is secured (not in code)
- [ ] Links and navigation work correctly
- [ ] Mobile responsiveness is tested
- [ ] Performance is acceptable (< 3s load time)

---

## Resources

### Official Documentation
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [Firebase Hosting](https://firebase.google.com/docs/hosting)

### Useful Tools
- [GitHub Pages Status](https://www.githubstatus.com/)
- [Google PageSpeed Insights](https://pagespeed.web.dev/)
- [WebPageTest](https://www.webpagetest.org/)

### Support
- GitHub Issues: For technical problems
- GitHub Discussions: For questions and community help
- Stack Overflow: Tag with `github-pages`, `vite`, `react`

---

## Summary

**To deploy your Job Application Tracker:**

1. ✅ Enable GitHub Pages (Settings → Pages → Source: GitHub Actions)
2. ✅ Push to `main` branch
3. ✅ Wait for deployment (2-5 minutes)
4. ✅ Access at `https://zcrafters.github.io/job-traking/`

That's it! Your application is now live and will automatically redeploy on every push to `main`.

---

*For questions or issues, please open an issue in the repository.*
