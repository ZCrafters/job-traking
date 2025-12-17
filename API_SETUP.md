# API Configuration Guide

This guide provides step-by-step instructions for configuring API keys for the Job Application Tracker.

## Required API Keys

The application requires the following API keys to function:

### 1. Google Gemini API (Required for AI Features)
- **Purpose**: Powers AI features including:
  - Image scanning (OCR) to extract job details
  - CV quality check and suggestions
  - Interview strategy generation
  - Follow-up email drafting
  - Profile analysis from documents
- **Get your key**: [Google AI Studio](https://aistudio.google.com/app/apikey)
- **Environment variable**: `VITE_GEMINI_API_KEY`

### 2. DeepSeek API (Optional - Fallback AI)
- **Purpose**: Fallback AI provider for image scanning when Gemini fails
- **Get your key**: [DeepSeek Platform](https://platform.deepseek.com/)
- **Environment variable**: `VITE_DEEPSEEK_API_KEY`

### 3. Firebase Configuration (Required)
- **Purpose**: Database, authentication, and storage
- **Get your config**: [Firebase Console](https://console.firebase.google.com/)
- **Environment variables**: 
  - `VITE_FIREBASE_API_KEY`
  - `VITE_FIREBASE_AUTH_DOMAIN`
  - `VITE_FIREBASE_PROJECT_ID`
  - `VITE_FIREBASE_STORAGE_BUCKET`
  - `VITE_FIREBASE_MESSAGING_SENDER_ID`
  - `VITE_FIREBASE_APP_ID`
  - `VITE_FIREBASE_MEASUREMENT_ID`
  - `VITE_APP_ID`

---

## Setup for Local Development

### Step 1: Copy Environment Template

```bash
cp .env.example .env
```

### Step 2: Edit .env File

Open the `.env` file and add your API keys:

```bash
# Google Gemini API Key (for AI features)
VITE_GEMINI_API_KEY=AIzaSyD7LEdqnb0Wcg-ah5omXsY0TyuzfYo5mpQ

# DeepSeek API Key (optional fallback)
VITE_DEEPSEEK_API_KEY=your-deepseek-api-key-here

# Firebase Configuration
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
VITE_APP_ID=your-app-id
```

### Step 3: Verify Configuration

Run the development server to verify your configuration:

```bash
npm run dev
```

The application should load at `http://localhost:5173/job-traking/` with all AI features working.

---

## Setup for GitHub Pages Deployment

For production deployment on GitHub Pages, you need to configure GitHub Secrets instead of using a `.env` file.

### Step 1: Navigate to GitHub Secrets

1. Go to your repository on GitHub
2. Click **Settings** (top navigation)
3. In the left sidebar, click **Secrets and variables** → **Actions**
4. Click **New repository secret**

### Step 2: Add Required Secrets

Add each of the following secrets one by one:

#### Google Gemini API Key

| Field | Value |
|-------|-------|
| **Name** | `VITE_GEMINI_API_KEY` |
| **Secret** | `AIzaSyD7LEdqnb0Wcg-ah5omXsY0TyuzfYo5mpQ` |

Click "Add secret" and repeat for the remaining secrets:

#### DeepSeek API Key (Optional)

| Field | Value |
|-------|-------|
| **Name** | `VITE_DEEPSEEK_API_KEY` |
| **Secret** | Your DeepSeek API key |

#### Firebase Configuration

Add each Firebase configuration variable as a separate secret:

| Secret Name | Description | Example Value |
|-------------|-------------|---------------|
| `VITE_FIREBASE_API_KEY` | Firebase API Key | `AIzaSyDxxx...` |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain | `your-project.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | Firebase Project ID | `your-project-id` |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase Storage Bucket | `your-project.appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase Messaging Sender ID | `123456789` |
| `VITE_FIREBASE_APP_ID` | Firebase App ID | `1:123456789:web:abc123` |
| `VITE_FIREBASE_MEASUREMENT_ID` | Firebase Measurement ID | `G-XXXXXXXXXX` |
| `VITE_APP_ID` | Application ID | `default-app-id` |

### Step 3: Verify Secrets Configuration

After adding all secrets:

1. Go to the **Actions** tab in your repository
2. Find the latest "Deploy to GitHub Pages" workflow
3. Click on it to view details
4. Check that the build step completed successfully
5. If there are errors, verify that all secret names are spelled correctly

### Step 4: Trigger Deployment

Push a change to the `main` branch or manually trigger the deployment workflow:

1. Go to **Actions** tab
2. Click "Deploy to GitHub Pages"
3. Click **Run workflow**
4. Select branch: `main`
5. Click **Run workflow**

The deployment will use your configured secrets to build the application with all API keys properly embedded.

---

## How GitHub Secrets Work

### Security Benefits

- **Encrypted Storage**: Secrets are encrypted and not visible in logs
- **Protected Access**: Only the GitHub Actions workflow can access them
- **No Repository Exposure**: Secrets never appear in repository code
- **Audit Trail**: GitHub tracks when secrets are accessed

### Build Process

During the GitHub Actions build:

1. The workflow reads secrets from GitHub Secrets
2. Sets them as environment variables (`env:` in `deploy.yml`)
3. Vite build process reads them via `import.meta.env.VITE_*`
4. Values are embedded in the built JavaScript (in `dist/`)
5. Deployed site has API keys embedded securely

### Important Notes

⚠️ **The .env file is gitignored** - It should never be committed to the repository

✅ **GitHub Secrets are the production method** - Always use secrets for deployed sites

⚠️ **Built files contain API keys** - The `dist/` folder is also gitignored

🔒 **API Key Security** - Consider adding domain restrictions in Google Cloud Console

---

## Verifying API Configuration

### Test Gemini API

1. Open the deployed application
2. Click "Scan Image" (camera icon)
3. Upload a job posting screenshot
4. If successful, job details will be extracted automatically
5. Check browser console (F12) for any API errors

### Test Firebase

1. Try adding a new job application
2. If successful, the application is saved to Firebase
3. Refresh the page - data should persist
4. Check Firebase Console to see stored data

### Common Issues

#### "API key not configured" Error

**Problem**: Gemini API key is missing or invalid

**Solutions**:
- For local dev: Check your `.env` file has `VITE_GEMINI_API_KEY`
- For production: Verify GitHub Secret `VITE_GEMINI_API_KEY` exists
- Verify the API key is valid at [Google AI Studio](https://aistudio.google.com/app/apikey)

#### "Failed to fetch" Error

**Problem**: API endpoint is unreachable

**Solutions**:
- Check your internet connection
- Verify API key has not exceeded quota
- Check Google Cloud Console for API restrictions
- Try the DeepSeek fallback if configured

#### Firebase Connection Errors

**Problem**: Cannot save or load data

**Solutions**:
- Verify all Firebase secrets are configured correctly
- Check Firebase Console for project status
- Verify Firebase security rules allow access
- Check browser console for detailed error messages

---

## API Key Best Practices

### Security

1. ✅ **Never commit API keys** to the repository
2. ✅ **Use environment variables** for all API keys
3. ✅ **Use GitHub Secrets** for production deployments
4. ✅ **Restrict API keys** by domain/IP in provider console
5. ✅ **Rotate keys periodically** for enhanced security
6. ❌ **Never share API keys** publicly or in screenshots
7. ❌ **Never log API keys** in application code

### Management

1. **Store backups**: Keep a secure record of your API keys
2. **Document sources**: Note where each key came from
3. **Monitor usage**: Check API dashboards regularly
4. **Set quotas**: Configure usage limits to prevent abuse
5. **Review access**: Audit who has access to secrets

### Development vs Production

| Aspect | Development | Production |
|--------|-------------|------------|
| Storage | `.env` file | GitHub Secrets |
| Access | Local only | Build pipeline |
| Security | Lower risk | Higher risk |
| Rotation | Optional | Recommended |
| Restrictions | Not needed | Recommended |

---

## Updating API Keys

### For Local Development

1. Open your `.env` file
2. Update the API key value
3. Restart the development server (`npm run dev`)
4. Changes take effect immediately

### For Production (GitHub Pages)

1. Go to repository **Settings** → **Secrets and variables** → **Actions**
2. Click on the secret you want to update (e.g., `VITE_GEMINI_API_KEY`)
3. Click **Update secret**
4. Enter the new value
5. Click **Update secret**
6. Trigger a new deployment (push to main or manual workflow trigger)
7. Wait for deployment to complete (2-5 minutes)

---

## Getting Your API Keys

### Google Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click **Get API key** or **Create API key**
4. Copy the generated key (starts with `AIzaSy...`)
5. Use this key for `VITE_GEMINI_API_KEY`

**Notes**:
- Free tier available with generous quotas
- May require enabling the Generative Language API
- Can be restricted to specific domains or IPs

### DeepSeek API Key

1. Visit [DeepSeek Platform](https://platform.deepseek.com/)
2. Sign up or log in to your account
3. Navigate to API Keys section
4. Generate a new API key
5. Copy the key and use for `VITE_DEEPSEEK_API_KEY`

**Notes**:
- Optional - only needed as fallback
- Check pricing and quotas
- Different from Gemini key

### Firebase Configuration

1. Visit [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create a new one)
3. Click the gear icon → **Project settings**
4. Scroll down to "Your apps" section
5. Select your web app (or add one)
6. Copy the configuration object values
7. Map each value to the corresponding `VITE_FIREBASE_*` variable

**Notes**:
- All Firebase config values are required
- Not sensitive but should still use secrets for production
- Enable Firestore and Authentication in Firebase Console

---

## Support

If you encounter issues with API configuration:

1. Check this guide's [Verifying API Configuration](#verifying-api-configuration) section
2. Review the [Common Issues](#common-issues) section
3. Check the main [DEPLOYMENT.md](DEPLOYMENT.md) for additional troubleshooting
4. Verify API keys are valid in their respective provider consoles
5. Check GitHub Actions logs for build errors
6. Open an issue in the repository for persistent problems

---

## Quick Reference

### Environment Variables

| Variable | Required | Purpose | Example |
|----------|----------|---------|---------|
| `VITE_GEMINI_API_KEY` | Yes | AI features | `AIzaSyD7L...` |
| `VITE_DEEPSEEK_API_KEY` | No | Fallback AI | `sk-xxx...` |
| `VITE_FIREBASE_API_KEY` | Yes | Firebase auth | `AIzaSyD...` |
| `VITE_FIREBASE_AUTH_DOMAIN` | Yes | Firebase domain | `project.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | Yes | Firebase project | `project-id` |
| `VITE_FIREBASE_STORAGE_BUCKET` | Yes | Firebase storage | `project.appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Yes | Firebase messaging | `123456789` |
| `VITE_FIREBASE_APP_ID` | Yes | Firebase app ID | `1:123:web:abc` |
| `VITE_FIREBASE_MEASUREMENT_ID` | Yes | Analytics | `G-XXXXXXXXXX` |
| `VITE_APP_ID` | Yes | App identifier | `default-app-id` |

### Quick Setup Commands

```bash
# Local development setup
cp .env.example .env
# Edit .env with your API keys
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

**Ready to configure your API keys? Follow the steps above and you'll have all features working! 🚀**
