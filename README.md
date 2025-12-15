# Job Application Tracker

A modern, AI-powered job application tracking system with advanced features and animations.

🚀 **[Deployment Guide](DEPLOYMENT.md)** | 🎯 **[Quick Start](QUICK_START.md)** | 📝 **[View Demo](https://zcrafters.github.io/job-traking/)**

## 🎯 Features

### Core Functionality
- **Application Management**: Add, edit, delete, and track job applications
- **Status Tracking**: Visual status badges with color-coding
- **AI-Powered Tools**:
  - Image scanning (OCR) to extract job details from screenshots
  - CV quality check and optimization suggestions
  - Interview strategy generator
  - Follow-up email drafting
  - Profile analysis from documents
- **Data Management**: CSV import/export functionality
- **Search & Filter**: Quick search by company or role
- **Pagination**: Smooth navigation through large datasets

### UI/UX Enhancements
- **Modern Component Library**: DaisyUI pre-styled components with theme system
- **3D Visual Effects**: 
  - Animated particle background (Three.js)
  - Interactive 3D icons (Zdog.js)
  - Mouse-following animations
- **Smooth Animations**: Fade-in, slide-in, scale-in, float, glow transitions
- **Interactive Elements**: 
  - DaisyUI tooltips
  - HeadlessUI collapsible sections
  - Loading spinners and states
  - Ripple effects on buttons
  - Accessible modals with focus management
- **Responsive Design**: Mobile-first approach with Tailwind CSS + DaisyUI
- **Visual Analytics**: Interactive pie chart for status distribution
- **KPI Dashboard**: Success rate, active pipeline, last update tracking with 3D icons
- **Theme Support**: Light/Dark mode via DaisyUI themes

## 📁 Project Structure

```
job-traking/
├── index.html                      # Main HTML entry point
├── src/
│   ├── App.js                      # Main React application component
│   ├── css/
│   │   └── styles.css              # Custom CSS styles and animations
│   ├── components/                 # React components (separated)
│   │   ├── index.js                # Components index
│   │   ├── ApplicationCard.js      # Individual application card
│   │   ├── ApplicationCardEnhanced.js # Enhanced card with DaisyUI + HeadlessUI
│   │   ├── ApplicationModal.js     # Add/Edit modal
│   │   ├── CVCheckModal.js         # CV quality check modal
│   │   ├── EmailDraftModal.js      # Email draft display modal
│   │   ├── ProfileAnalysisModal.js # Profile upload/analysis modal
│   │   ├── ModalEnhanced.js        # HeadlessUI Dialog modal
│   │   ├── StatusBadge.js          # Status badge component
│   │   ├── StatusDistributionChart.js # Pie chart visualization
│   │   ├── StrategyModal.js        # Interview strategy modal
│   │   ├── SummaryCard.js          # KPI summary card
│   │   ├── Toast.js                # Notification system
│   │   ├── LoadingOverlay.js       # Full-screen loading
│   │   ├── ThreeBackground.js      # 3D particle background
│   │   └── ZdogIcon.js             # 3D animated icons
│   └── utils/                      # Utility functions (separated)
│       ├── index.js                # Utilities index
│       ├── animationUtils.js       # Animation helper functions
│       ├── chartUtils.js           # Chart calculation functions
│       ├── config.js               # App configuration & constants
│       ├── csvUtils.js             # CSV import/export functions
│       ├── fileUtils.js            # File handling functions
│       ├── kpiUtils.js             # KPI calculation functions
│       └── timeUtils.js            # Time/date utility functions
└── README.md                       # This file
```

## 🎨 Styling Architecture

### CSS Organization
- **Custom Animations**: Defined in `src/css/styles.css`
  - `fadeIn`, `slideInFromRight`, `slideInFromLeft`, `scaleIn`
  - `pulse`, `shimmer`, `bounce` effects
- **Utility Classes**: 
  - `.hover-lift`: Elevation on hover
  - `.transition-all-smooth`: Smooth transitions
  - `.tooltip`: Tooltip positioning
  - `.animate-*`: Animation classes
- **Tailwind CSS**: Used for rapid UI development

### Animation Features
- **Entrance Animations**: Staggered animations for list items
- **Hover Effects**: Lift, glow, and scale effects
- **Loading States**: Skeleton loaders and spinners
- **Modal Animations**: Backdrop fade and content scale
- **Button Interactions**: Ripple effects

## 🔧 Technical Stack

### Core Technologies
- **Frontend Framework**: React 18.2.0
- **Build Tool**: Vite
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **AI Integration**: Google Gemini API (for OCR, CV analysis, etc.)
- **Module System**: ES6 Modules

### UI/UX Libraries
- **Styling Framework**: Tailwind CSS 3.4+
- **Component Library**: DaisyUI 4.4.19
- **Interactive Components**: Flowbite 2.2.0
- **Headless UI**: HeadlessUI 1.7.17 (Accessible components)

### 3D Graphics & Animations
- **3D Engine**: Three.js 0.160.0 (Particle backgrounds)
- **Pseudo-3D Icons**: Zdog.js 1.1.3 (Animated icons)

### Custom Development
- **Custom CSS**: 400+ lines of animations and utilities
- **Custom Components**: 15+ React components
- **Utility Modules**: 7 specialized modules

## 🚀 Getting Started

### Prerequisites
- Node.js 20.x or higher
- npm or yarn
- Firebase project credentials
- Google Gemini API key

### Installation
1. Clone the repository
   ```bash
   git clone https://github.com/ZCrafters/job-traking.git
   cd job-traking
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Configure Firebase credentials in the environment
4. Add Gemini API key to configuration

### Development
Run the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000/job-traking/`

### Build for Production
Build the application:
```bash
npm run build
```

The production build will be created in the `dist/` directory.

Preview the production build:
```bash
npm run preview
```

### Deployment to GitHub Pages

📚 **[See Complete Deployment Guide](DEPLOYMENT.md)** for detailed instructions.

**Quick Start:**
1. Enable GitHub Pages: Settings → Pages → Source: GitHub Actions
2. Push to `main` branch to trigger automatic deployment
3. Access your deployed site at: `https://zcrafters.github.io/job-traking/`

The application automatically deploys via GitHub Actions. You can also trigger deployment manually from the Actions tab.

## 📊 Data Structure

### Application Object
```javascript
{
  id: string,
  role: string,
  company: string,
  location: string,
  appliedDate: string (YYYY-MM-DD),
  status: string (TO_APPLY | SUBMITTED | IN_REVIEW | INTERVIEW | OFFER | REJECTED | DONE_PROJECT | ACTION),
  notes: string,
  link: string,
  timestamp: Date,
  source: string
}
```

## 🎯 Key Improvements

### Code Organization
1. **Separation of Concerns**: HTML, CSS, and JavaScript are now in separate files
2. **Modular Architecture**: Components and utilities are independently maintained
3. **Reusability**: Utility functions can be reused across the application
4. **Maintainability**: Easy to locate and update specific functionality

### New Features
1. **Enhanced Animations**: 
   - Staggered list animations
   - Smooth modal transitions
   - Button ripple effects
   - Hover state improvements

2. **Interactive UI Elements**:
   - Expandable notes section in cards
   - Tooltips on action buttons
   - Loading spinners for async operations
   - Visual feedback on all interactions

3. **Performance Optimizations**:
   - Lazy loading with animations
   - Optimized re-renders
   - Efficient state management

## 🔐 Security

- Firebase security rules should be configured
- API keys should be environment variables (not hardcoded)
- Input validation on all forms
- XSS protection through React's built-in escaping

## 📝 License

This project is proprietary software owned by ZCrafters.

## 👤 Author

**Zefanya Williams**
- Skills: Digital Business, Data Science, Content Creation, Digital Marketing

---

## 🎨 Animation Classes Reference

| Class | Effect | Duration |
|-------|--------|----------|
| `.animate-fadeIn` | Fade in with slight upward movement | 0.5s |
| `.animate-slideInRight` | Slide in from right | 0.4s |
| `.animate-slideInLeft` | Slide in from left | 0.4s |
| `.animate-scaleIn` | Scale up from 95% to 100% | 0.3s |
| `.animate-pulse-slow` | Pulsing opacity | 2s infinite |
| `.animate-shimmer` | Shimmer loading effect | 2s infinite |
| `.animate-bounce-gentle` | Gentle bounce | 2s infinite |
| `.hover-lift` | Lift up 4px on hover | 0.3s |
| `.hover-glow` | Add glow effect on hover | 0.3s |
| `.card-interactive` | Interactive card with hover | 0.3s |

## 🛠️ Utility Functions Reference

### Time Utils
- `timeAgo(date)`: Convert date to "X time ago" format
- `formatDate(date)`: Format date to YYYY-MM-DD
- `isWithinDays(date, days)`: Check if date is within N days

### Chart Utils
- `polarToCartesian(x, y, radius, angle)`: Convert polar to cartesian coordinates
- `describeArc(x, y, radius, startAngle, endAngle)`: Generate SVG arc path
- `calculatePercentages(data)`: Calculate percentage distribution

### CSV Utils
- `convertToCSV(data)`: Convert array to CSV string
- `parseCSV(csvText, STATUS_MAP)`: Parse CSV to array
- `downloadCSV(content, filename)`: Trigger CSV download

### KPI Utils
- `calculateKPIs(apps)`: Calculate success rate, active pipeline, etc.
- `getStatusCounts(apps)`: Get count by status
- `calculateConversionRate(apps, from, to)`: Calculate status conversion rate

### File Utils
- `fileToBase64(file)`: Convert file to base64
- `processFilesForUpload(files)`: Process multiple files for AI analysis
- `validateFileType(file, types)`: Validate file MIME type
- `formatFileSize(bytes)`: Format bytes to human-readable size

### Animation Utils
- `getStaggerDelay(index, baseDelay)`: Calculate stagger delay
- `triggerRippleEffect(element, event)`: Add ripple effect
- `smoothScrollTo(elementId, offset)`: Smooth scroll to element
- `animateCountUp(element, end, duration)`: Animate number count up
- `createParticleEffect(container, options)`: Create particle burst effect
