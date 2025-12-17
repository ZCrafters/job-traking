# Security Note: API Key Management

## Important Information

This repository originally included a Gemini API key in the problem statement for integration purposes. To maintain security best practices:

### What We Did

✅ **Removed all hardcoded API keys** from documentation  
✅ **Updated all guides** to use placeholder values  
✅ **Maintained .gitignore** to prevent committing .env files  
✅ **Documented GitHub Secrets** as the production method  

### What You Should Do

If you received an API key for this project:

1. **Add it as a GitHub Secret**
   - Go to Settings → Secrets and variables → Actions
   - Add as `VITE_GEMINI_API_KEY`
   - See [GITHUB_SECRETS_SETUP.md](GITHUB_SECRETS_SETUP.md)

2. **For Local Development**
   - Create a `.env` file (it's gitignored)
   - Add your API key there
   - See [API_SETUP.md](API_SETUP.md)

3. **Never commit API keys to code**
   - Don't add them to source files
   - Don't include in documentation
   - Don't share in public channels

### API Key Security Best Practices

#### ✅ DO:
- Store API keys in GitHub Secrets for production
- Use .env files for local development (gitignored)
- Restrict API keys by domain/IP in provider console
- Rotate keys periodically
- Monitor usage in provider dashboards
- Keep backup of keys in secure password manager

#### ❌ DON'T:
- Commit API keys to git repository
- Share keys publicly in issues/PRs
- Include keys in screenshots
- Log keys in application code
- Store keys in plain text files (except .env which is gitignored)
- Use production keys for development

### If an API Key Was Exposed

If you believe an API key was exposed in this repository:

1. **Revoke the key immediately** in the provider console
2. **Generate a new key**
3. **Update GitHub Secrets** with the new key
4. **Update local .env files** with the new key
5. **Monitor usage** for any unauthorized access
6. **Report the incident** if needed

### Current Configuration

This repository is configured to use API keys securely:

- ✅ `.env` is in `.gitignore`
- ✅ `.env.local` is in `.gitignore`
- ✅ `dist/` is in `.gitignore` (contains built files with embedded keys)
- ✅ Workflow uses GitHub Secrets
- ✅ Documentation uses placeholders

### Getting Your Own API Keys

Never share API keys. Get your own:

- **Gemini API**: [Google AI Studio](https://aistudio.google.com/app/apikey)
- **DeepSeek API**: [DeepSeek Platform](https://platform.deepseek.com/)
- **Firebase**: [Firebase Console](https://console.firebase.google.com/)

### Questions?

For detailed setup instructions:
- 🔑 [API Setup Guide](API_SETUP.md)
- 🚀 [Quick Secrets Setup](GITHUB_SECRETS_SETUP.md)
- 📚 [Full Deployment Guide](DEPLOYMENT.md)

---

**Remember: Treat API keys like passwords. Keep them secret, keep them safe! 🔒**
