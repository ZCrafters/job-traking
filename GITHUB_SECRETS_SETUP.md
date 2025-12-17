# Quick Guide: Adding Gemini API Key to GitHub Secrets

This is a quick reference guide for adding the Gemini API key to your GitHub repository secrets for production deployment.

## What You Need

- **Gemini API Key**: Get yours from [Google AI Studio](https://aistudio.google.com/app/apikey)
- Repository admin access
- 5 minutes of your time

## Step-by-Step Instructions

### Step 1: Open GitHub Secrets Settings

1. Go to your repository: **https://github.com/ZCrafters/job-traking**
2. Click the **Settings** tab (top navigation bar)
3. In the left sidebar, click **Secrets and variables** → **Actions**

### Step 2: Add the Gemini API Key

1. Click the green **New repository secret** button
2. Fill in the form:
   - **Name**: `VITE_GEMINI_API_KEY`
   - **Secret**: Paste your Gemini API key here (starts with `AIzaSy...`)
3. Click **Add secret**

### Step 3: Verify the Secret Was Added

You should now see `VITE_GEMINI_API_KEY` in your list of secrets with:
- A green checkmark
- The date it was created
- "Updated X seconds/minutes ago"

### Step 4: Trigger a Deployment

The new secret will be used in the next deployment. You can either:

**Option A: Push to main branch**
```bash
git push origin main
```

**Option B: Manually trigger deployment**
1. Go to the **Actions** tab
2. Click "Deploy to GitHub Pages" workflow
3. Click **Run workflow** button
4. Select branch: `main`
5. Click **Run workflow**

### Step 5: Verify Deployment

1. Wait 2-5 minutes for deployment to complete
2. Visit your site: **https://zcrafters.github.io/job-traking/**
3. Test the AI features:
   - Click "Scan Image" (camera icon)
   - Upload a job posting screenshot
   - AI should extract job details automatically

## What This Enables

With the Gemini API key configured, your application will have:

✅ **Image Scanning (OCR)** - Extract job details from screenshots  
✅ **CV Quality Check** - Get AI-powered feedback on your CV  
✅ **Interview Strategy** - Generate interview preparation strategies  
✅ **Email Drafting** - AI-assisted follow-up email generation  
✅ **Profile Analysis** - Analyze skills from uploaded documents  

## Additional Secrets (Optional)

If you want to add the optional DeepSeek fallback API:

1. Repeat Steps 1-3 above
2. Use these values:
   - **Name**: `VITE_DEEPSEEK_API_KEY`
   - **Secret**: Your DeepSeek API key from https://platform.deepseek.com/

For Firebase configuration secrets, see the [API Setup Guide](API_SETUP.md#setup-for-github-pages-deployment).

## Security Notes

✅ **GitHub Secrets are secure**:
- Encrypted at rest
- Not visible in logs
- Only accessible to GitHub Actions workflows
- Cannot be viewed after creation (only updated or deleted)

⚠️ **Never commit API keys to code**:
- The `.env` file is gitignored
- Always use GitHub Secrets for production
- Built files (`dist/`) are also gitignored

## Troubleshooting

### Secret Not Working?

**Check the secret name**:
- Must be exactly: `VITE_GEMINI_API_KEY`
- Case-sensitive
- No extra spaces

**Check the workflow file**:
- `.github/workflows/deploy.yml` should reference the secret
- Line should read: `VITE_GEMINI_API_KEY: ${{ secrets.VITE_GEMINI_API_KEY }}`

**Check deployment logs**:
1. Go to **Actions** tab
2. Click on the latest workflow run
3. Click on "build" job
4. Look for errors in the "Build project" step

### API Key Not Valid?

**Verify the key**:
1. Visit https://aistudio.google.com/app/apikey
2. Check if the key is valid and active
3. Verify it hasn't exceeded quota
4. Make sure Generative Language API is enabled

**Check browser console**:
1. Open your deployed site
2. Press F12 to open developer tools
3. Go to Console tab
4. Try using an AI feature
5. Look for any API-related error messages

## Need More Help?

- 📖 **Detailed API Setup**: See [API_SETUP.md](API_SETUP.md)
- 📚 **Full Deployment Guide**: See [DEPLOYMENT.md](DEPLOYMENT.md)
- 🚀 **Quick Deployment**: See [DEPLOYMENT-QUICKSTART.md](DEPLOYMENT-QUICKSTART.md)
- 🏠 **Main README**: See [README.md](README.md)

---

**That's it! Your Gemini API key is now configured for production deployment. 🎉**
