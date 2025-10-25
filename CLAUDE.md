# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the **ATL Tech Network** website - a Next.js-based community platform for Atlanta's tech ecosystem, featuring meetups, conferences, tech hubs, and online resources. The project was initially generated from v0.app and uses the App Router architecture.

## Development Commands

```bash
# Development server (http://localhost:3000)
npm run dev

# Production build
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Architecture

### Next.js App Router Structure

The project uses **Next.js 15.2 with App Router** (not Pages Router):

- **Routing**: File-based routing in `/app` directory
  - `/app/page.tsx` - Homepage
  - `/app/about/page.tsx` - About page
  - `/app/conferences/page.tsx` - Conferences listing
  - `/app/meetups/page.tsx` - Meetups listing
  - `/app/resources/page.tsx` - Online resources
  - `/app/tech-hubs/page.tsx` - Tech hubs directory
- **Root Layout**: `/app/layout.tsx` includes fonts, metadata, and theme provider
- **Global Styles**: `/app/globals.css` contains CSS variables, custom animations, and Tailwind directives

### Component Organization

**Two-tier component structure:**

1. **UI Primitives** (`/components/ui/`): shadcn/ui components
   - Built on Radix UI primitives
   - Styled with Tailwind CSS and class-variance-authority
   - Examples: `button.tsx`, `card.tsx`, `input.tsx`, `select.tsx`

2. **Feature Components** (`/components/`): Domain-specific components
   - `hero.tsx` - Landing page hero section
   - `navigation.tsx` - Main navigation with mobile menu
   - `*-section.tsx` - Homepage sections for each content type
   - `resource-card.tsx`, `resource-tag.tsx` - Reusable display components
   - `theme-provider.tsx` - Dark theme configuration

**Server vs Client Components:**
- Most pages are Client Components (`"use client"`) due to filters, forms, and interactivity
- Root layout is a Server Component
- UI primitives work in both contexts

### Data Management

Currently using **mock data** in `/lib/sample-data.ts`:
- `meetups` - List of Atlanta tech meetups
- `conferences` - Tech conferences
- `resources` - Online learning resources
- `techHubs` - Coworking spaces and tech hubs

**No database or backend integration yet** - form submissions prepare email data but only log to console.

### Styling System

- **Tailwind CSS 4.1** with custom CSS variables in `globals.css`
- **Dark theme**: Slate-based color palette (slate-900 backgrounds)
- **Accent colors**: Cyan, Blue, Purple, Orange, Red gradients defined as CSS variables using oklch color space
- **Fonts**:
  - Geist Sans/Mono (system fonts via `next/font`)
  - Rubik (Google Font for headings)
- **Component Styling**: Uses `cn()` utility from `/lib/utils.ts` to merge Tailwind classes

### Path Aliases

TypeScript and shadcn/ui are configured with path aliases:
- `@/components` → `/components`
- `@/components/ui` → `/components/ui`
- `@/lib` → `/lib`
- `@/hooks` → `/hooks`
- `@/*` → `/*` (root directory)

## Adding shadcn/ui Components

The project uses shadcn/ui components. To add new components:

```bash
npx shadcn@latest add [component-name]
```

Configuration is in `components.json` with "new-york" style and RSC support enabled.

## Important Configuration Notes

- **Build Configuration** (`next.config.mjs`):
  - ESLint and TypeScript errors are ignored during builds (`ignoreDuringBuilds: true`)
  - Image optimization is disabled (`unoptimized: true`)
  - These settings should be reviewed before production deployment

- **TypeScript** (`tsconfig.json`):
  - Strict mode enabled
  - Target: ES6
  - Module resolution: bundler

## Key Dependencies

**Core:**
- Next.js 15.2, React 19
- TypeScript
- Tailwind CSS 4.1

**UI & Forms:**
- shadcn/ui components (Radix UI primitives)
- Lucide React (icons)
- React Hook Form + Zod (installed but not fully integrated)
- Sonner (toast notifications)

**Utilities:**
- class-variance-authority (component variants)
- clsx + tailwind-merge (className utility)
- date-fns (date handling)

## Common Patterns

### Adding a New Page

1. Create folder in `/app/[page-name]/`
2. Add `page.tsx` with the page component
3. Update navigation in `/components/navigation.tsx`
4. Add data to `/lib/sample-data.ts` if needed

### Creating a Feature Component

1. Add component to `/components/[name].tsx`
2. Use `"use client"` directive if it needs state or event handlers
3. Import UI primitives from `@/components/ui`
4. Use `cn()` from `@/lib/utils` for conditional styling

### State Management

- Local state: `useState`, `useMemo` from React
- Form state: React Hook Form (installed, ready to integrate)
- Toast notifications: `useToast` hook from `@/hooks/use-toast`

## Project Status

This is a **development/prototype stage** project:
- Mock data in memory (no database)
- Form submissions are placeholders (no email backend)
- Build warnings/errors are suppressed
- Image optimization disabled
- No authentication or user accounts

Before production deployment, address these items in `next.config.mjs` and implement backend integrations.
