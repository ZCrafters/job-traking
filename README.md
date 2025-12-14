# Job Application Tracker

A modern, AI-powered job application tracking system with advanced features and animations.

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
- **Smooth Animations**: Fade-in, slide-in, scale-in transitions
- **Interactive Elements**: 
  - Hover effects with tooltips
  - Expandable sections in application cards
  - Loading states with spinners
  - Ripple effects on buttons
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Visual Analytics**: Pie chart for status distribution
- **KPI Dashboard**: Success rate, active pipeline, last update tracking

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
│   │   ├── ApplicationModal.js     # Add/Edit modal
│   │   ├── CVCheckModal.js         # CV quality check modal
│   │   ├── EmailDraftModal.js      # Email draft display modal
│   │   ├── ProfileAnalysisModal.js # Profile upload/analysis modal
│   │   ├── StatusBadge.js          # Status badge component
│   │   ├── StatusDistributionChart.js # Pie chart visualization
│   │   ├── StrategyModal.js        # Interview strategy modal
│   │   └── SummaryCard.js          # KPI summary card
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

- **Frontend Framework**: React 18.2.0
- **Styling**: Tailwind CSS + Custom CSS
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **AI Integration**: Google Gemini API (for OCR, CV analysis, etc.)
- **Module System**: ES6 Modules

## 🚀 Getting Started

### Prerequisites
- Modern web browser with ES6 module support
- Firebase project credentials
- Google Gemini API key

### Setup
1. Clone the repository
2. Configure Firebase credentials in the environment
3. Add Gemini API key to configuration
4. Open `index.html` in a web server (required for ES6 modules)

### Development
The application uses ES6 modules loaded directly in the browser. No build step required for development.

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
