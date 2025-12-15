# Vite Migration Summary

## Overview
This document describes the migration from browser-based import maps to Vite build system.

## Key Changes

### 1. Build System
- **Before**: Browser import maps loading React/Firebase from CDN
- **After**: Vite build system with npm dependencies

### 2. Entry Point
- **Before**: `index.html` with inline script loading `src/App.js`
- **After**: `src/main.jsx` as entry point, imported by `index.html`

### 3. Dependencies
All dependencies are now installed via npm:
- React & ReactDOM
- Firebase
- Tailwind CSS v3 (downgraded from v4 for stability)
- Required libraries: @headlessui/react, @heroicons/react, recharts, @tanstack/react-table, clsx, date-fns

### 4. Configuration Files

#### vite.config.js
- Base path: `/job-traking/` (for GitHub Pages)
- React plugin enabled
- JSX support for .js files
- Output directory: `dist/`

#### postcss.config.js
- Tailwind CSS processing
- Autoprefixer

#### tailwind.config.js
- ESM syntax (export default)
- Simplified configuration (v3)
- Custom animations moved to CSS

#### package.json
- Added "type": "module"
- Scripts: dev, build, preview

### 5. Styles
- `src/css/styles.css` now includes Tailwind directives:
  - `@tailwind base;`
  - `@tailwind components;`
  - `@tailwind utilities;`
- All custom animations preserved

### 6. GitHub Actions
- `.github/workflows/deploy.yml` for automatic deployment
- Triggers on push to main branch
- Builds and deploys dist/ to GitHub Pages

## Commands

### Development
```bash
npm run dev
```
Starts dev server at `http://localhost:3000/job-traking/`

### Production Build
```bash
npm run build
```
Builds to `dist/` directory

### Preview Build
```bash
npm run preview
```
Preview production build at `http://localhost:4173/job-traking/`

## Deployment

### Automatic (Recommended)
Push to `main` branch triggers GitHub Actions workflow

### Manual
1. Run `npm run build`
2. Deploy `dist/` directory to hosting

## GitHub Pages Setup

1. Go to repository Settings → Pages
2. Set Source to "GitHub Actions"
3. Push to main branch

Site will be available at: `https://zcrafters.github.io/job-traking/`

## Troubleshooting

### Dev server not starting
- Check Node.js version (requires 20.x+)
- Delete `node_modules` and run `npm install`

### Build fails
- Clear cache: `rm -rf dist node_modules/.vite`
- Reinstall: `npm install`
- Rebuild: `npm run build`

### Blank page after deployment
- Verify base path in `vite.config.js` matches repository name
- Check GitHub Pages settings
- Verify dist/ directory has correct file structure

## Files Changed
- `index.html` - Simplified for Vite
- `package.json` - Added dependencies and scripts
- `src/main.jsx` - New entry point (created)
- `src/css/styles.css` - Added Tailwind directives
- `vite.config.js` - New configuration (created)
- `postcss.config.js` - New configuration (created)
- `tailwind.config.js` - Updated to ESM
- `.github/workflows/deploy.yml` - New workflow (created)
- `README.md` - Updated with new instructions

## Files Not Changed
- All React components in `src/components/`
- All utility functions in `src/utils/`
- Application logic in `src/App.js`
- Business logic remains unchanged

## Notes
- Repository name contains typo: "job-traking" instead of "job-tracking"
- Base path must match repository name for GitHub Pages
- JSX files use .js extension (configured in Vite)
- Tailwind v3 used for stability (v4 had compatibility issues)
