# Contributing to Procurement Analytics & Vendor Intelligence Platform

Welcome to the Procurement Analytics project! This guide will help you understand our architecture, design system, and contribution workflow as we scale this platform.

## Table of Contents

- [Project Overview](#project-overview)
- [Technology Stack](#technology-stack)
- [Architecture & Project Structure](#architecture--project-structure)
- [Design System](#design-system)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Standards](#code-standards)
- [Component Development](#component-development)
- [Testing Guidelines](#testing-guidelines)
- [Scaling Strategy](#scaling-strategy)
- [Pull Request Process](#pull-request-process)

---

## Project Overview

**Procurement Analytics** is an enterprise-grade system designed to help organizations manage vendors, analyze proposals, and gain actionable insights through intelligent automation.

### Core Features

- **Dashboard Analytics**: Real-time procurement metrics and KPIs
- **Vendor Management**: Comprehensive vendor tracking with risk scoring
- **Proposal Analysis**: Automated cost analysis and line-item review (benchmarked against industry standards)
- **Automated Insights**: Intelligence-driven recommendations and risk assessments
- **Glass Morphism UI**: Modern, premium design with neon accents

### Current State

The project is currently in a **single-file architecture** (`App.tsx`) and is being transitioned to a **scalable, feature-based architecture** inspired by [bulletproof-react](https://github.com/alan2207/bulletproof-react).

---

## Technology Stack

### Core Technologies

- **React 19.2.0** - UI library
- **TypeScript 5.8.2** - Type safety
- **Vite 6.2.0** - Build tool and dev server
- **Lucide React 0.554.0** - Icon library
- **Recharts 3.5.0** - Data visualization

### Development Tools

- **Node.js** - Runtime environment
- **ESLint** (planned) - Code linting
- **Prettier** (planned) - Code formatting

---

## Architecture & Project Structure

We are adopting a **feature-based architecture** inspired by bulletproof-react to ensure scalability, maintainability, and clear separation of concerns.

### Target Structure

As we scale, the project will transition from the current flat structure to:

```
src/
├── app/                    # Application layer
│   ├── routes/            # Route definitions
│   ├── App.tsx            # Main application component
│   ├── provider.tsx       # Global providers wrapper
│   └── router.tsx         # Router configuration
│
├── assets/                # Static files (images, fonts, etc.)
│
├── components/            # Shared components
│   ├── ui/               # Base UI components (buttons, inputs, cards)
│   ├── layout/           # Layout components (navbar, sidebar)
│   └── common/           # Common reusable components
│
├── config/               # Global configurations
│   ├── env.ts           # Environment variables
│   └── constants.ts     # App-wide constants
│
├── features/             # Feature-based modules
│   ├── dashboard/
│   │   ├── api/         # Dashboard API calls
│   │   ├── components/  # Dashboard-specific components
│   │   ├── hooks/       # Dashboard-specific hooks
│   │   ├── types/       # Dashboard types
│   │   └── utils/       # Dashboard utilities
│   │
│   ├── vendors/
│   │   ├── api/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── types/
│   │   └── utils/
│   │
│   ├── proposals/
│   │   ├── api/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── types/
│   │   └── utils/
│   │
│   ├── insights/
│       ├── api/
│       ├── components/
│       ├── hooks/
│       ├── types/
│       └── utils/
│
├── hooks/                # Shared hooks
│
├── lib/                  # Pre-configured libraries
│
├── services/            # API services and integrations
│
├── stores/              # Global state management (Zustand/Context)
│
├── styles/              # Global styles and design tokens
│   ├── base.css
│   ├── variables.css    # Design system tokens
│   ├── utilities.css
│   ├── components.css
│   └── animations.css
│
├── types/               # Shared TypeScript types
│
└── utils/               # Shared utility functions
```

### Architectural Principles

#### 1. **Feature-Based Organization**

Each feature is self-contained with its own components, hooks, types, and utilities. This prevents code sprawl and makes features easier to maintain.

```typescript
// ✅ Good: Feature-scoped component
src/features/vendors/components/VendorCard.tsx

// ❌ Bad: Flat component structure
src/components/VendorCard.tsx
```

#### 2. **Unidirectional Code Flow**

Code should flow in one direction: **shared → features → app**

```
┌─────────────────────────────────────────┐
│  App Layer (routes, main app)           │
│  ↑ can import from features & shared    │
└─────────────────────────────────────────┘
                  ↑
┌─────────────────────────────────────────┐
│  Features (dashboard, vendors, etc.)    │
│  ↑ can import from shared only          │
└─────────────────────────────────────────┘
                  ↑
┌─────────────────────────────────────────┐
│  Shared (components, hooks, utils)      │
│  ↓ cannot import from features or app   │
└─────────────────────────────────────────┘
```

#### 3. **No Cross-Feature Imports**

Features should not import from each other. Instead, compose features at the application level.

```typescript
// ❌ Bad: Cross-feature import
import { VendorCard } from '@/features/vendors/components/VendorCard';

// ✅ Good: Compose at app level
// In app/routes/dashboard.tsx
import { DashboardView } from '@/features/dashboard';
import { VendorList } from '@/features/vendors';
```

#### 4. **Direct Imports (No Barrel Files)**

Import files directly to enable better tree-shaking and avoid performance issues.

```typescript
// ❌ Bad: Barrel file import
import { VendorCard, VendorList } from '@/features/vendors';

// ✅ Good: Direct import
import { VendorCard } from '@/features/vendors/components/VendorCard';
import { VendorList } from '@/features/vendors/components/VendorList';
```

---

## Design System

The platform uses a **Glass Morphism + Neon Aesthetic** design system. All design tokens and patterns are documented in [`STYLES.md`](./STYLES.md).

### Key Design Principles

1. **Dark backgrounds** with frosted glass overlays
2. **Subtle cyan neon accents** for highlights and CTAs
3. **Clean typography** with excellent contrast
4. **Smooth animations** and micro-interactions
5. **Consistent spacing** and visual hierarchy

### Design Tokens

All design tokens are defined in CSS variables:

```css
/* Primary colors */
--color-primary: #00d6cb;
--color-primary-alpha-15: rgba(0, 214, 203, 0.15);

/* Glass morphism */
--glass-bg-medium: rgba(255, 255, 255, 0.08);
--glass-blur-lg: blur(20px);
--glass-border-accent: rgba(0, 214, 203, 0.2);

/* Typography */
--font-primary: 'Exo 2', sans-serif;
--text-base: 1rem;

/* Spacing */
--space-4: 1rem;
--space-6: 1.5rem;
```

### Using the Design System

Always use CSS variables instead of hardcoded values:

```css
/* ❌ Bad */
.my-button {
  background: rgba(0, 214, 203, 0.15);
  color: #00d6cb;
  border-radius: 8px;
}

/* ✅ Good */
.my-button {
  background: var(--color-primary-alpha-15);
  color: var(--color-primary);
  border-radius: var(--radius-base);
}
```

### Icon System

We use **Lucide React** for all icons. Maintain consistency:

```typescript
import { LayoutDashboard, Users, FileText } from 'lucide-react';

// Standard sizes
// - Feature grids: 48px
// - Section headers: 32px
// - Card icons: 20-24px
// - Navigation: 16px
```

---

## Getting Started

### Prerequisites

- **Node.js** (v18+ recommended)
- **npm** or **yarn**

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd procurement-analytics
```

2. **Install dependencies**

```bash
npm install
```

3. **Start the development server**

```bash
npm run dev
```

4. **Open your browser**

Navigate to `http://localhost:5173`

---

## Development Workflow

### Branch Strategy

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - Feature branches
- `bugfix/*` - Bug fix branches
- `refactor/*` - Refactoring branches

### Workflow Steps

1. **Create a feature branch**

```bash
git checkout -b feature/vendor-risk-scoring
```

2. **Make your changes**
   - Follow code standards
   - Write tests
   - Update documentation

3. **Commit your changes**

```bash
git add .
git commit -m "feat(vendors): add risk scoring algorithm"
```

4. **Push and create a PR**

```bash
git push origin feature/vendor-risk-scoring
```

### Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting, etc.)
- `refactor` - Code refactoring
- `test` - Adding or updating tests
- `chore` - Maintenance tasks

**Examples:**

```bash
feat(dashboard): add real-time metrics widget
fix(vendors): correct risk score calculation
docs(contributing): update architecture section
refactor(proposals): extract line item component
```

---

## Code Standards

### TypeScript

- **Always use TypeScript** - No `.jsx` files
- **Define interfaces** for all data structures
- **Use type inference** where possible
- **Avoid `any`** - Use `unknown` or proper types

```typescript
// ✅ Good
interface VendorCardProps {
  vendor: Vendor;
  onAnalyze: (vendor: Vendor) => void;
}

export function VendorCard({ vendor, onAnalyze }: VendorCardProps) {
  // ...
}

// ❌ Bad
export function VendorCard({ vendor, onAnalyze }: any) {
  // ...
}
```

### React Components

- **Use functional components** with hooks
- **Use named exports** for components
- **Keep components small** and focused
- **Extract complex logic** into custom hooks

```typescript
// ✅ Good: Named export, focused component
export function VendorCard({ vendor }: VendorCardProps) {
  const { analyzeVendor, isLoading } = useVendorAnalysis();
  
  return (
    <div className="glass-card">
      {/* ... */}
    </div>
  );
}

// ❌ Bad: Default export, too much logic in component
export default function VendorCard(props: any) {
  const [loading, setLoading] = useState(false);
  
  const analyzeVendor = async () => {
    setLoading(true);
    // 50 lines of logic...
  };
  
  return <div>{/* ... */}</div>;
}
```

### File Naming

- **Components**: `PascalCase.tsx` (e.g., `VendorCard.tsx`)
- **Hooks**: `camelCase.ts` with `use` prefix (e.g., `useVendorAnalysis.ts`)
- **Utils**: `camelCase.ts` (e.g., `formatCurrency.ts`)
- **Types**: `camelCase.ts` or `PascalCase.ts` (e.g., `vendor.types.ts`)
- **Constants**: `UPPER_SNAKE_CASE.ts` or `camelCase.ts` (e.g., `constants.ts`)

### CSS/Styling

- **Use CSS Modules** or **scoped CSS** for component-specific styles
- **Use design tokens** from `variables.css`
- **Follow BEM naming** for custom classes
- **Prefer utility classes** when available

```css
/* ✅ Good: Using design tokens */
.vendor-card {
  background: var(--glass-bg-medium);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
}

.vendor-card__title {
  color: var(--color-text-primary);
  font-size: var(--text-xl);
}

/* ❌ Bad: Hardcoded values */
.vendor-card {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 24px;
}
```

---

## Component Development

### Component Structure

Every component should follow this structure:

```typescript
// 1. Imports
import React from 'react';
import { SomeIcon } from 'lucide-react';
import { SomeType } from '../types';
import './ComponentName.css';

// 2. Types/Interfaces
interface ComponentNameProps {
  prop1: string;
  prop2: number;
  onAction?: () => void;
}

// 3. Component
export function ComponentName({ prop1, prop2, onAction }: ComponentNameProps) {
  // 3a. Hooks
  const [state, setState] = React.useState(false);
  
  // 3b. Handlers
  const handleClick = () => {
    setState(true);
    onAction?.();
  };
  
  // 3c. Render
  return (
    <div className="component-name">
      {/* JSX */}
    </div>
  );
}
```

### Creating a New Feature

When adding a new feature:

1. **Create the feature directory**

```bash
mkdir -p src/features/my-feature/{api,components,hooks,types,utils}
```

2. **Define types**

```typescript
// src/features/my-feature/types/index.ts
export interface MyFeatureData {
  id: string;
  name: string;
}
```

3. **Create API layer**

```typescript
// src/features/my-feature/api/getMyFeatureData.ts
import { MyFeatureData } from '../types';

export async function getMyFeatureData(): Promise<MyFeatureData[]> {
  // API call logic
}
```

4. **Build components**

```typescript
// src/features/my-feature/components/MyFeatureCard.tsx
import { MyFeatureData } from '../types';

interface MyFeatureCardProps {
  data: MyFeatureData;
}

export function MyFeatureCard({ data }: MyFeatureCardProps) {
  return <div className="glass-card">{data.name}</div>;
}
```

5. **Create custom hooks**

```typescript
// src/features/my-feature/hooks/useMyFeature.ts
import { useState, useEffect } from 'react';
import { getMyFeatureData } from '../api/getMyFeatureData';
import { MyFeatureData } from '../types';

export function useMyFeature() {
  const [data, setData] = useState<MyFeatureData[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    getMyFeatureData().then(setData).finally(() => setLoading(false));
  }, []);
  
  return { data, loading };
}
```

### Glass Morphism Components

When creating glass morphism components, use the established patterns:

```typescript
export function MyGlassCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="glass-card">
      {children}
    </div>
  );
}
```

```css
.glass-card {
  background: var(--glass-bg-medium);
  backdrop-filter: var(--glass-blur-lg);
  -webkit-backdrop-filter: var(--glass-blur-lg);
  border: 1px solid var(--glass-border-accent);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  transition: all var(--transition-base) var(--ease-out);
}

.glass-card:hover {
  border-color: var(--glass-border-hover);
  box-shadow: var(--glow-subtle);
  transform: translateY(-2px);
}
```

---

## Testing Guidelines

### Testing Strategy

As we scale, we'll implement:

1. **Unit Tests** - Test individual functions and hooks
2. **Component Tests** - Test component rendering and interactions
3. **Integration Tests** - Test feature workflows
4. **E2E Tests** - Test critical user journeys

### Testing Tools (Planned)

- **Vitest** - Unit and component testing
- **React Testing Library** - Component testing
- **Playwright** or **Cypress** - E2E testing

### Writing Tests

```typescript
// Example: Testing a utility function
import { describe, it, expect } from 'vitest';
import { formatCurrency } from './formatCurrency';

describe('formatCurrency', () => {
  it('should format USD correctly', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56');
  });
  
  it('should handle zero', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });
});
```

```typescript
// Example: Testing a component
import { render, screen } from '@testing-library/react';
import { VendorCard } from './VendorCard';

describe('VendorCard', () => {
  it('should render vendor name', () => {
    const vendor = { id: '1', name: 'Acme Corp', /* ... */ };
    render(<VendorCard vendor={vendor} />);
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
  });
});
```

---

## Scaling Strategy

### Phase 1: Foundation (Current)

- ✅ Single-file architecture
- ✅ Basic feature implementation
- ✅ Design system established
- 🔄 Transitioning to feature-based structure

### Phase 2: Feature Extraction

- [ ] Extract Dashboard feature
- [ ] Extract Vendors feature
- [ ] Extract Proposals feature
- [ ] Extract Insights feature
- [ ] Set up shared components library

### Phase 3: Infrastructure

- [ ] Add ESLint with custom rules
- [ ] Add Prettier for code formatting
- [ ] Set up testing framework
- [ ] Implement CI/CD pipeline
- [ ] Add pre-commit hooks (Husky)

### Phase 4: Advanced Features

- [ ] State management (Zustand/Redux)
- [ ] API layer abstraction
- [ ] Real-time updates (WebSockets)
- [ ] Advanced caching strategies
- [ ] Performance monitoring

### Phase 5: Production Readiness

- [ ] Comprehensive test coverage (>80%)
- [ ] Error boundary implementation
- [ ] Logging and monitoring
- [ ] Security audit
- [ ] Performance optimization
- [ ] Documentation completion

### ESLint Rules (Planned)

To enforce architectural boundaries:

```javascript
// .eslintrc.js
module.exports = {
  rules: {
    'import/no-restricted-paths': [
      'error',
      {
        zones: [
          // Prevent cross-feature imports
          {
            target: './src/features/dashboard',
            from: './src/features',
            except: ['./dashboard'],
          },
          {
            target: './src/features/vendors',
            from: './src/features',
            except: ['./vendors'],
          },
          // Enforce unidirectional flow
          {
            target: './src/features',
            from: './src/app',
          },
          {
            target: [
              './src/components',
              './src/hooks',
              './src/utils',
            ],
            from: ['./src/features', './src/app'],
          },
        ],
      },
    ],
  },
};
```

---

## Pull Request Process

### Before Submitting

- [ ] Code follows style guidelines
- [ ] All tests pass
- [ ] No console errors or warnings
- [ ] Design system tokens are used
- [ ] TypeScript types are properly defined
- [ ] Documentation is updated
- [ ] Commit messages follow convention

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Refactoring
- [ ] Documentation update

## Related Issues
Closes #123

## Screenshots (if applicable)
[Add screenshots here]

## Testing
- [ ] Unit tests added/updated
- [ ] Manual testing completed
- [ ] Design system compliance verified

## Checklist
- [ ] Code follows project standards
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
```

### Review Process

1. **Automated checks** - Linting, tests, build
2. **Code review** - At least one approval required
