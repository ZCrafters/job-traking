# 🚀 Deployment Quick Start

Get your Job Application Tracker live in 4 simple steps!

## Step 1: Configure API Keys (One-time setup)

**Required for AI Features**: Add your Gemini API key to GitHub Secrets.

🔑 **[Follow this 2-minute guide](GITHUB_SECRETS_SETUP.md)** to add the API key.

Quick summary:
1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Name: `VITE_GEMINI_API_KEY`
4. Secret: `AIzaSyD7LEdqnb0Wcg-ah5omXsY0TyuzfYo5mpQ`
5. Click **Add secret**

✅ API key configured!

## Step 2: Enable GitHub Pages (One-time setup)

1. Go to your repository: `https://github.com/ZCrafters/job-traking`
2. Click **Settings** (top right)
3. Click **Pages** (left sidebar)
4. Under "Build and deployment":
   - Set **Source** to: `GitHub Actions`
5. Click **Save**

✅ Done! GitHub Pages is now enabled.

## Step 3: Push Your Code

```bash
# Commit any changes you have
git add .
git commit -m "Ready to deploy"

# Push to main branch
git push origin main
```

✅ Deployment will start automatically!

## Step 4: Wait & Access

1. Go to **Actions** tab in your repository
2. Watch the "Deploy to GitHub Pages" workflow
3. Wait 2-5 minutes for completion
4. Access your live site at:

```
🌐 https://zcrafters.github.io/job-traking/
```

✅ Your site is now live!

---

## 🔄 Updating Your Site

Every time you push to `main`, your site automatically updates:

```bash
git add .
git commit -m "Your update message"
git push origin main
```

That's it! No extra steps needed.

---

## ❓ Something Not Working?

### Site shows 404
- Wait a few more minutes (GitHub Pages can take 5-10 minutes initially)
- Check that GitHub Pages source is set to "GitHub Actions"
- Verify the workflow completed successfully in Actions tab

### Build fails
- Check Actions tab for error messages
- Run `npm run build` locally to test
- Ensure all dependencies are installed: `npm install`

### Features not working
- Check browser console for errors (F12)
- Verify Firebase credentials are configured
- Ensure API keys are set correctly

---

## 📚 Need More Help?

See the complete guide: **[DEPLOYMENT.md](DEPLOYMENT.md)**

Topics covered:
- Manual deployment options
- Custom domain setup
- Environment configuration
- Troubleshooting guide
- Advanced deployment scenarios

---

## 📋 Pre-Deployment Checklist

Before pushing to `main`, verify:

- [ ] Code builds successfully: `npm run build`
- [ ] App works locally: `npm run dev`
- [ ] Firebase credentials configured (if using backend)
- [ ] API keys configured (for AI features)
- [ ] No sensitive data in code
- [ ] All changes committed

---

**Ready to deploy? Just push to `main`! 🎉**
