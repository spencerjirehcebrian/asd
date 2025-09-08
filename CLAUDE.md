# CLAUDE.md - ASD Development Guide

## Project Overview

**ASD** is an ultra-minimalistic, zen-like dark-themed React TypeScript application that serves as a centralized hub for server links and resources. Built with TypeScript, React, and Lucide icons for optimal performance, type safety, and maximum screen density.

## Quick Reference

### Tech Stack
- **Framework:** React 18.2+
- **Build Tool:** Vite 5.0+
- **Styling:** Tailwind CSS 3.4+ (with @tailwindcss/vite)
- **Language:** TypeScript 5.0+
- **Icons:** Lucide React
- **Deployment:** Static hosting (Netlify, Vercel, GitHub Pages)

### Performance Targets
- Load Time: < 1.5 seconds
- Bundle Size: < 400KB (reduced for simplified app)
- Lighthouse Score: 95+ all categories
- Screen Density: Maximum services visible

## Development Commands

### Setup & Installation
```bash
# Install dependencies
npm install

# Install Tailwind CSS and TypeScript
npm install @tailwindcss/vite typescript lucide-react
```

### Development Workflow
```bash
# Start development server (port 3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code (TypeScript + React)
npm run lint
npm run lint:fix

# Format code (with Tailwind class sorting)
npm run format

# TypeScript type checking
npm run type-check
```

## Project Structure

```
asd/
├── public/
│   ├── index.html
│   ├── favicon.ico
│   └── config/
│       └── services.json         # Simplified server links configuration
├── src/
│   ├── components/
│   │   ├── common/               # Minimal reusable components
│   │   │   ├── LoadingSpinner.tsx
│   │   │   └── Footer.tsx
│   │   └── ui/                   # Core UI components
│   │       ├── ServiceCard.tsx   # Simplified service card
│   │       └── ServiceGrid.tsx   # Dense grid layout
│   ├── hooks/
│   │   └── useServices.ts        # Simplified data fetching
│   ├── types/
│   │   └── index.ts              # TypeScript definitions
│   ├── styles/
│   │   └── globals.css           # Tailwind imports
│   ├── App.tsx                   # Minimal app component
│   └── main.tsx                  # Entry point
├── tsconfig.json                 # TypeScript configuration
└── README.md
```

## Component Architecture

### Simplified Component Hierarchy
```
App
├── ServiceGrid (dense layout)
│   └── ServiceCard[] (name + description + icon only)
└── Footer (minimal credits)
```

### Component Responsibilities

**App Component**
- Minimal application container with dark theme
- Simple state management for services
- Error handling and loading states
- Full-width layout for maximum screen density

**ServiceCard Component**
- Ultra-compact cards with Lucide icons
- Hover effects with glass morphism styling
- Click handlers for opening service links
- Display: icon, name, description only

**ServiceGrid Component**
- Dense responsive grid layout (4-5 cols desktop, 2-3 tablet, 2 mobile)
- Minimal spacing for maximum screen utilization
- Smooth hover animations

## Configuration Management

### Services Configuration (`public/config/services.json`)

```json
{
  "services": [
    {
      "id": "unique-id",
      "name": "Service Name",
      "description": "Brief description",
      "url": "https://server.example.com",
      "icon": "Server"
    }
  ]
}
```

### Adding New Services
1. Edit `public/config/services.json`
2. Add new object to `services` array
3. Ensure unique `id` 
4. Use valid Lucide icon name for `icon`

### Available Lucide Icons
Common server-related icons:
- `Server` - General servers
- `Database` - Database services  
- `Code` - Development tools
- `Monitor` - Monitoring services
- `Container` - Docker/containers
- `Folder` - File storage
- `Play` - Media services
- `Shield` - Security tools
- `Globe` - Web services
- `Terminal` - CLI tools

## TypeScript Integration

### Type Definitions (`src/types/index.ts`)

```typescript
export interface Service {
  id: string;
  name: string;
  description: string;
  url: string;
  icon: string;
}

export interface ServicesConfig {
  services: Service[];
}

export interface UseServicesResult {
  services: Service[];
  loading: boolean;
  error: string | null;
}
```

### Component Props
```typescript
interface ServiceCardProps {
  service: Service;
}

interface ServiceGridProps {
  services: Service[];
}
```

## Design System

### Color Palette (Ultra-Minimal Dark Theme)
```css
/* Primary Colors */
--bg-primary: #0a0a0a      /* zinc-950 */
--bg-card: #1a1a1a         /* zinc-900 */

/* Text Colors */
--text-primary: #f5f5f5    /* zinc-100 */
--text-secondary: #a0a0a0  /* zinc-400 */

/* Accent */
--accent-primary: #10b981   /* emerald-500 */
```

### Tailwind Utility Patterns
```css
/* Compact glass effect cards */
bg-zinc-900/40 backdrop-blur-sm border border-zinc-800/30

/* Minimal hover animations */
transition-all duration-200 ease-out hover:scale-[1.02]

/* Dense typography */
text-sm font-medium text-zinc-100    /* Card titles */
text-xs text-zinc-400               /* Descriptions */
```

### Animation Guidelines
- **Transitions:** 200ms duration for snappy feel
- **Hover Effects:** Subtle scale (1.02) for density
- **Loading States:** Minimal spinner animation
- **Micro-interactions:** Immediate visual feedback

## State Management

### Simplified Data Flow
```
services.json → useServices Hook → App State → ServiceGrid → ServiceCard[]
```

### State Structure
```typescript
// Minimal app state
const { services, loading, error } = useServices();
```

### Custom Hooks
- `useServices()` - Fetch and manage services data (TypeScript)

## Dense Layout Strategy

### Maximum Screen Utilization
- **Desktop:** 5 columns with 8px gaps
- **Tablet:** 3 columns with 6px gaps  
- **Mobile:** 2 columns with 4px gaps
- **Card Size:** Compact 200x120px cards
- **Padding:** Minimal 12px internal padding

### Responsive Grid
```css
/* Dense responsive grid */
grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5
gap-2 md:gap-3
```

### Typography Optimization
- **Service Name:** text-sm font-semibold (14px)
- **Description:** text-xs (12px) with line clamping
- **Icon Size:** 20px (w-5 h-5)

## Performance Optimization

### Bundle Management
- TypeScript compilation optimization
- Tree shaking for unused Lucide icons
- Minimal component structure
- No complex state management

### Lucide Icons Optimization
```typescript
// Import only needed icons
import { Server, Database, Code } from 'lucide-react';
```

## TypeScript Configuration

### tsconfig.json Setup
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": false,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

## Development Workflow

### TypeScript Development
1. **Strict typing:** All components fully typed
2. **Interface-driven:** Define interfaces before implementation  
3. **Type-safe hooks:** Proper return type annotations
4. **Component props:** Required prop validation via TypeScript

### Code Quality
- **ESLint:** TypeScript-aware rules
- **Prettier:** Consistent formatting
- **Type checking:** Zero TypeScript errors policy

## Common Tasks

### Adding New Services
1. Add entry to `services.json`
2. Use valid Lucide icon name
3. Keep description under 50 characters
4. Test responsiveness

### Adding New Lucide Icons
```typescript
// In ServiceCard.tsx
import { NewIcon } from 'lucide-react';

// Icon mapping
const iconMap = {
  'new-icon': NewIcon,
  // ... other icons
};
```

### Optimizing Screen Density
1. Reduce card padding
2. Adjust grid gaps
3. Optimize typography sizes
4. Test on various screen sizes

## Troubleshooting

### TypeScript Issues
- **Type errors:** Check interface definitions
- **Import errors:** Verify Lucide icon names
- **Build failures:** Run `npm run type-check`

### Performance Issues
- **Bundle size:** Check imported Lucide icons
- **Render performance:** Monitor grid rendering
- **Memory usage:** Profile component renders

### Layout Issues
- **Responsive design:** Test grid breakpoints
- **Card sizing:** Verify fixed dimensions
- **Icon alignment:** Check Lucide icon rendering

---

**Last Updated:** September 8, 2025  
**Project Status:** Simplified & TypeScript Migration  
**Architecture:** Ultra-minimal, maximum density