# Quick Start Guide - Job Application Tracker V2.0

## 🚀 Getting Started

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/ZCrafters/job-traking.git
cd job-traking
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables** (Required for Firebase and AI features)
```bash
cp .env.example .env
```

Edit `.env` file with your credentials:
- Firebase configuration (from Firebase Console)
- Gemini API key (from [Google AI Studio](https://aistudio.google.com/app/apikey))

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed configuration instructions.

4. **Run development server**
```bash
npm run dev
```

Visit `http://localhost:3000/job-traking/` in your browser.

---

## 🎨 Using New UI Components

### 1. Enhanced Application Cards

The new `ApplicationCardEnhanced` component uses DaisyUI and HeadlessUI:

```javascript
import { ApplicationCardEnhanced } from './src/components';

<ApplicationCardEnhanced 
  app={applicationData}
  onEdit={handleEdit}
  onDelete={handleDelete}
  onGenerateEmail={handleEmail}
  isEmailLoading={isLoading}
  onGenerateStrategy={handleStrategy}
  isStrategyLoading={isStrategyLoading}
  onCVCheck={handleCVCheck}
  isCVCheckLoading={isCVCheckLoading}
/>
```

**Features**:
- Click the "Next Step" button to expand/collapse notes
- DaisyUI tooltips appear on hover over action buttons
- Smooth HeadlessUI Transition animations
- 3D Zdog briefcase icon

### 2. 3D Animated Icons

Use Zdog icons throughout your app:

```javascript
import { ZdogIcon } from './src/components';

// Briefcase icon
<ZdogIcon type="briefcase" size={60} rotating={true} color="#667eea" />

// Star icon
<ZdogIcon type="star" size={40} rotating={false} color="#f59e0b" />

// Rocket icon
<ZdogIcon type="rocket" size={50} rotating={true} color="#ef4444" />

// Chart icon
<ZdogIcon type="chart" size={45} rotating={true} color="#10b981" />

// Checkmark icon
<ZdogIcon type="check" size={35} rotating={false} color="#10b981" />
```

**Icon Options**:
- `type`: 'briefcase', 'star', 'rocket', 'chart', 'check'
- `size`: Number (pixels)
- `rotating`: Boolean (auto-rotate animation)
- `color`: Hex color string

### 3. 3D Background Animation

Add the Three.js particle background:

```javascript
import { ThreeBackground } from './src/components';

function App() {
  return (
    <div className="min-h-screen">
      <ThreeBackground />
      {/* Your content here */}
    </div>
  );
}
```

**Features**:
- 1000 animated particles
- Follows mouse movement
- Optimized WebGL rendering
- Responsive to screen size

### 4. Enhanced Modals

Use HeadlessUI Dialog for accessible modals:

```javascript
import { ModalEnhanced } from './src/components';

<ModalEnhanced
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  title="Modal Title"
  size="md"  // sm, md, lg, xl
>
  <div>
    <p>Modal content goes here</p>
  </div>
</ModalEnhanced>
```

**Features**:
- Accessible (ARIA, keyboard navigation)
- Focus trap and restoration
- ESC key to close
- Click backdrop to close
- Smooth enter/exit animations
- Backdrop blur effect

---

## 🎨 DaisyUI Components

### Using Pre-styled Components

DaisyUI provides ready-to-use components:

#### Cards
```html
<div class="card bg-base-100 shadow-xl">
  <div class="card-body">
    <h2 class="card-title">Card Title</h2>
    <p>Card content</p>
  </div>
</div>
```

#### Badges
```html
<div class="badge badge-primary">Primary</div>
<div class="badge badge-outline">Outline</div>
<div class="badge badge-ghost">Ghost</div>
```

#### Buttons
```html
<button class="btn btn-primary">Primary</button>
<button class="btn btn-circle btn-ghost">
  <svg>...</svg>
</button>
```

#### Tooltips
```html
<div class="tooltip tooltip-right" data-tip="Tooltip text">
  <button class="btn">Hover me</button>
</div>
```

#### Loading Spinners
```html
<span class="loading loading-spinner loading-sm"></span>
<span class="loading loading-dots loading-md"></span>
<span class="loading loading-ring loading-lg"></span>
```

#### Alerts
```html
<div class="alert alert-info">
  <svg>...</svg>
  <span>Info alert message</span>
</div>
```

---

## 🎭 Theme Switching

### Change Theme

Update the `data-theme` attribute in HTML:

```html
<!-- Light theme (default) -->
<html data-theme="light">

<!-- Dark theme -->
<html data-theme="dark">
```

### Dynamic Theme Toggle

```javascript
function ThemeToggle() {
  const [theme, setTheme] = useState('light');
  
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };
  
  return (
    <button onClick={toggleTheme} class="btn btn-circle">
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
}
```

---

## 🎬 Animation Examples

### Custom Tailwind Animations

```html
<!-- Fade in -->
<div class="animate-fade-in">Content</div>

<!-- Slide in from right -->
<div class="animate-slide-in-right">Content</div>

<!-- Slide in from left -->
<div class="animate-slide-in-left">Content</div>

<!-- Scale in -->
<div class="animate-scale-in">Content</div>

<!-- Float effect -->
<div class="animate-float">Content</div>

<!-- Glow effect -->
<div class="animate-glow">Content</div>
```

### HeadlessUI Transitions

```javascript
import { Transition } from '@headlessui/react';

<Transition
  show={isOpen}
  enter="transition duration-200 ease-out"
  enterFrom="transform scale-95 opacity-0"
  enterTo="transform scale-100 opacity-100"
  leave="transition duration-150 ease-out"
  leaveFrom="transform scale-100 opacity-100"
  leaveTo="transform scale-95 opacity-0"
>
  <div>Animated content</div>
</Transition>
```

---

## 🔧 Customization

### Custom DaisyUI Theme

Edit `tailwind.config.js`:

```javascript
daisyui: {
  themes: [
    {
      mytheme: {
        "primary": "#667eea",
        "secondary": "#764ba2",
        "accent": "#f093fb",
        "neutral": "#3d4451",
        "base-100": "#ffffff",
        "info": "#3b82f6",
        "success": "#10b981",
        "warning": "#f59e0b",
        "error": "#ef4444",
      },
    },
  ],
}
```

### Custom Animations

Add to `tailwind.config.js`:

```javascript
theme: {
  extend: {
    animation: {
      'my-animation': 'myKeyframes 1s ease-in-out',
    },
    keyframes: {
      myKeyframes: {
        '0%': { transform: 'scale(1)' },
        '50%': { transform: 'scale(1.1)' },
        '100%': { transform: 'scale(1)' },
      }
    }
  }
}
```

---

## 📱 Responsive Design

All components are responsive by default:

```html
<!-- Mobile: stacked, Desktop: grid -->
<div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
  <div>Column 1</div>
  <div>Column 2</div>
  <div>Column 3</div>
</div>

<!-- Hide on mobile, show on desktop -->
<div class="hidden lg:block">Desktop only</div>

<!-- Show on mobile, hide on desktop -->
<div class="lg:hidden">Mobile only</div>
```

---

## 🐛 Troubleshooting

### Issue: 3D animations not working

**Solution**: Ensure your browser supports WebGL. Check:
```javascript
const canvas = document.createElement('canvas');
const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
if (gl) {
  console.log('WebGL is supported');
} else {
  console.log('WebGL is not supported');
}
```

### Issue: DaisyUI styles not applying

**Solution**: Check that:
1. DaisyUI CSS is loaded before custom CSS
2. `data-theme` attribute is set on `<html>` tag
3. Tailwind config includes DaisyUI plugin

### Issue: HeadlessUI components not accessible

**Solution**: Ensure you're using proper ARIA labels:
```javascript
<Dialog.Title as="h3">Modal Title</Dialog.Title>
<button aria-label="Close modal">X</button>
```

---

## 📚 Additional Resources

### Official Documentation
- [DaisyUI Components](https://daisyui.com/components/)
- [HeadlessUI React](https://headlessui.com/react/)
- [Three.js Examples](https://threejs.org/examples/)
- [Zdog Getting Started](https://zzz.dog/getting-started)
- [Flowbite Components](https://flowbite.com/docs/getting-started/introduction/)

### Tutorials
- DaisyUI Themes: [Custom Themes Guide](https://daisyui.com/docs/themes/)
- HeadlessUI: [Building Accessible UIs](https://headlessui.com/react/dialog)
- Three.js: [Particle Systems](https://threejs.org/docs/#manual/en/introduction/Creating-a-scene)

---

## 🎯 Common Patterns

### Loading State with Spinner
```javascript
{isLoading ? (
  <span class="loading loading-spinner loading-md"></span>
) : (
  <button class="btn btn-primary">Submit</button>
)}
```

### Tooltip with Icon Button
```html
<div class="tooltip tooltip-left" data-tip="Delete">
  <button class="btn btn-circle btn-ghost btn-sm">
    <svg>...</svg>
  </button>
</div>
```

### Collapsible Section
```javascript
<Disclosure>
  {({ open }) => (
    <>
      <Disclosure.Button class="btn btn-ghost gap-2">
        Details
        <svg class={`${open ? 'rotate-180' : ''}`}>...</svg>
      </Disclosure.Button>
      <Disclosure.Panel>
        Hidden content here
      </Disclosure.Panel>
    </>
  )}
</Disclosure>
```

---

*Happy coding! 🚀*
