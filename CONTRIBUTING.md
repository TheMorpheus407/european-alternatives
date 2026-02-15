# Contributing to European Alternatives

First off — thank you for being here. Every contribution helps build a more visible, more accessible European tech ecosystem. Whether you're adding a single alternative or redesigning a component, your work matters.

## Table of Contents

- [Ways to Contribute](#ways-to-contribute)
- [Adding an Alternative](#adding-an-alternative)
- [Adding a New Category](#adding-a-new-category)
- [Code Contributions](#code-contributions)
- [Design Contributions](#design-contributions)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Commit Conventions](#commit-conventions)
- [Pull Request Process](#pull-request-process)
- [What Makes a Good Alternative](#what-makes-a-good-alternative)

---

## Ways to Contribute

| Contribution | Difficulty | Impact |
|---|---|---|
| Add a European alternative | Easy | High |
| Fix a typo or broken link | Easy | Medium |
| Report a bug or inaccuracy | Easy | Medium |
| Suggest a new category | Easy | Medium |
| Fix a bug in code | Medium | High |
| Improve accessibility | Medium | High |
| Add a new feature | Advanced | High |
| Improve the design system | Advanced | High |

The most valuable contribution is **adding alternatives you personally use and trust**. Real-world experience makes entries authentic.

---

## Adding an Alternative

This is the most common and most impactful contribution. You don't need to know React — just TypeScript data entry.

### Step 1: Prepare the Information

Gather the following about the alternative:

| Field | Required | Example |
|---|---|---|
| `id` | Yes | `"nextcloud"` (URL-safe, lowercase, unique) |
| `name` | Yes | `"Nextcloud"` |
| `description` | Yes | 1-2 sentences describing what it does |
| `website` | Yes | `"https://nextcloud.com"` |
| `country` | Yes | Two-letter code: `"de"`, `"fr"`, `"nl"`, etc. |
| `category` | Yes | One of the [existing categories](#available-categories) |
| `replacesUS` | Yes | `["Google Drive", "Dropbox"]` — US services it replaces |
| `isOpenSource` | Yes | `true` or `false` |
| `pricing` | Yes | `"free"`, `"freemium"`, or `"paid"` |
| `tags` | Yes | `["privacy", "self-hosted", "GDPR"]` — relevant keywords |
| `logo` | No | `"/logos/nextcloud.svg"` — path to logo file |
| `sourceCodeUrl` | No | `"https://codeberg.org/nextcloud/server"` |
| `foundedYear` | No | `2016` |
| `headquartersCity` | No | `"Stuttgart"` |
| `license` | No | `"AGPL-3.0"` |

`sourceCodeUrl` can point to any public repository host (GitHub, Codeberg, GitLab, Forgejo, or self-hosted Git).

### Step 2: Add the Entry

Open `src/data/manualAlternatives.ts` and add your entry to the `alternatives` array:

```typescript
{
  id: 'nextcloud',
  name: 'Nextcloud',
  description: 'Self-hosted productivity platform providing file sync, collaboration, and communication tools with full data sovereignty.',
  website: 'https://nextcloud.com',
  logo: '/logos/nextcloud.svg',
  country: 'de',
  category: 'cloud-storage',
  replacesUS: ['Google Drive', 'Dropbox', 'OneDrive'],
  isOpenSource: true,
  sourceCodeUrl: 'https://codeberg.org/nextcloud/server',
  pricing: 'free',
  tags: ['self-hosted', 'file-sync', 'collaboration', 'GDPR', 'privacy'],
  foundedYear: 2016,
  headquartersCity: 'Stuttgart',
  license: 'AGPL-3.0',
},
```

### Step 3: Add a Logo (Optional but Recommended)

- Place an SVG file in `public/logos/` (e.g., `public/logos/nextcloud.svg`)
- SVG is strongly preferred for quality and file size
- Keep logos under 50 KB
- If you can't find an SVG, the site will fall back to the country's flag icon — so no logo is fine too

### Step 4: Verify

```bash
npm run dev       # Check the site — your alternative should appear
npm run build     # Ensure TypeScript compiles without errors
npm run lint      # Ensure no linting issues
```

### Available Categories

| ID | Name | Replaces |
|---|---|---|
| `cloud-storage` | Cloud Storage | Google Drive, Dropbox, iCloud, OneDrive |
| `email` | Email | Gmail, Outlook, Yahoo Mail |
| `search-engine` | Search Engine | Google Search, Bing |
| `social-media` | Social Media | Facebook, Instagram, X/Twitter, LinkedIn |
| `messaging` | Messaging | WhatsApp, iMessage, Discord, Slack |
| `video-hosting` | Video Hosting | YouTube, Vimeo, Twitch |
| `office-suite` | Office Suite | Microsoft Office, Google Workspace |
| `maps` | Maps & Navigation | Google Maps, Apple Maps, Waze |
| `browser` | Browser | Google Chrome, Safari, Edge |
| `vpn` | VPN | NordVPN, ExpressVPN |
| `analytics` | Analytics | Google Analytics, Mixpanel, Amplitude |
| `project-management` | Project Management | Jira, Asana, Monday.com, Trello |
| `password-manager` | Password Manager | LastPass, 1Password, Dashlane |
| `2fa-authenticator` | 2FA Authenticators | Google Authenticator, Microsoft Authenticator, Authy |
| `ai-ml` | AI & Machine Learning | OpenAI, Google AI, AWS AI |
| `hosting` | Cloud & Hosting | AWS, Google Cloud, Azure, Cloudflare |
| `payments` | Payments | Stripe, PayPal, Square |
| `ecommerce` | E-Commerce | Shopify, Amazon, eBay |
| `other` | Other | — |

Don't see a fitting category? You can [propose a new one](#adding-a-new-category).

### Supported Countries

All country codes below are valid in the type system. Note that the browse page's country filter currently shows a popular subset — alternatives from any valid country will still appear in unfiltered results and text search.

**EU Member States:** AT, BE, BG, HR, CY, CZ, DK, EE, FI, FR, DE, GR, HU, IE, IT, LV, LT, LU, MT, NL, PL, PT, RO, SK, SI, ES, SE

**Other European:** CH, NO, GB, IS

**Open-source exception:** US (only for clearly open-source entries that fit project scope)

**Multi-country:** `eu` (for pan-European services)

---

## Adding a New Category

If an alternative doesn't fit any existing category, you can propose a new one.

### Step 1: Add the Category ID to TypeScript Types

In `src/types/index.ts`, add the new ID to the `CategoryId` type:

```typescript
export type CategoryId =
  | 'cloud-storage'
  | 'email'
  // ... existing categories ...
  | 'your-new-category';
```

### Step 2: Add the Category Definition and localization

In `src/data/categories.ts`, add an entry to the `categories` array:

```typescript
{
  id: 'your-new-category',
  name: 'Your Category Name',
  description: 'Brief description of what this category covers.',
  usGiants: ['US Service 1', 'US Service 2'],
  emoji: '🔧',
},
```

In `src/i18n/locales/{de,en}/data.json`, add an entry to the `catagories`

`"cloud-storage": { "name": "Cloud-Speicher", "description": "Dateispeicher- und Synchronisierungsdienste" },`
`"cloud-storage": { "name": "Cloud Storage", "description": "File storage and sync services" },`

### Step 3: Update Filters (If Needed)

The filter component in `src/components/Filters.tsx` dynamically reads categories from the data file, so no changes should be needed there. Verify by running the dev server.

---

## Code Contributions

For bug fixes, features, and improvements to the application itself.

### Before You Start

1. **Check existing issues** — someone might already be working on it
2. **Open an issue first** for large changes — let's discuss the approach before you invest time
3. **Small PRs are better** — easier to review, faster to merge

### Architecture Overview

Understanding the codebase will help you contribute effectively:

- **URL is the source of truth** for category and search filters. These are derived from `useSearchParams()`, not local React state.
- **Local state** is used for non-URL filters (country, pricing, open source toggle, sort order, view mode).
- **`latestParamsRef`** prevents stale reads when multiple URL updates happen in the same tick.
- **`setSearchParamsRef`** avoids dependency array issues with `useCallback`.
- **Logo fallback** — all logo `<img>` elements have an `onError` handler that switches to a country flag icon.
- **Animation delays** are capped at 1 second via `Math.min()` to prevent sluggish rendering on large lists.

### Key Files for Code Changes

| File | Purpose |
|---|---|
| `src/components/App.tsx` | Routing (React Router v7) |
| `src/components/Layout.tsx` | Header, footer, page wrapper |
| `src/components/LandingPage.tsx` | Homepage with stats and featured alternative |
| `src/components/BrowsePage.tsx` | Main browse page with filtering logic |
| `src/components/AlternativeCard.tsx` | Individual alternative card (grid + list view) |
| `src/components/Filters.tsx` | Search, filter, and sort controls |
| `src/types/index.ts` | All TypeScript interfaces and types |
| `src/data/alternatives.ts` | Alternative catalogue data |
| `src/data/categories.ts` | Category definitions |

---

## Design Contributions

The design system is implemented in a single CSS file (`src/index.css`, ~1800 lines) using CSS custom properties. Contributions that improve visual quality, accessibility, or responsive behavior are very welcome.

### Design Principles

1. **Dark theme** — the entire UI uses a dark color scheme with high contrast text
2. **Accessibility first** — WCAG AA minimum, AAA where possible
3. **Mobile-first** — default styles target mobile, enhanced via `min-width` media queries
4. **Minimal motion** — animations are subtle and functional, not decorative
5. **Consistent spacing** — use the spacing scale (`--spacing-xs` through `--spacing-2xl`)

### Color System

| Variable | Value | Usage |
|---|---|---|
| `--bg-primary` | `#0d0d11` | Page background |
| `--bg-card` | `#1a1a1f` | Card surfaces |
| `--accent-primary` | `#6c35de` | Purple — links, active states, focus rings |
| `--accent-secondary` | `#ff6b35` | Orange — highlights, labels |
| `--accent-gradient` | Purple to Orange | Headlines, button backgrounds, brand expression |
| `--text-primary` | `#f0f2f5` | Main text |
| `--text-secondary` | `#d0d2d5` | Descriptions |
| `--text-muted` | `#9a9ca0` | Metadata, disabled text |
| `--success` | `#10b981` | Free/open-source badges |
| `--warning` | `#f59e0b` | Freemium badges |

### Typography

- **Oswald** — headings, navigation, labels (uppercase, 600 weight, tight line-height)
- **Roboto** — body text, descriptions (400 weight, 1.6 line-height)
- Font size scale: `--font-size-xs` (0.75rem) through `--font-size-4xl` (2.5rem)

### Responsive Breakpoints

| Breakpoint | Target |
|---|---|
| Default | Mobile-first base styles |
| `max-width: 480px` | Small mobile overrides |
| `min-width: 768px` | Tablet |
| `min-width: 1024px` | Desktop |
| `min-width: 1200px` | Large desktop |

### Accessibility Standards

- All interactive elements must have a minimum touch target of **44px**
- Use `:focus-visible` for keyboard focus indicators (not `:focus`)
- All images need meaningful `alt` text or `aria-hidden="true"` if decorative
- Color must never be the **only** way to convey information
- Use semantic HTML (`<main>`, `<nav>`, `<header>`, `<footer>`, `<section>`)
- Expandable sections need `aria-expanded` and `aria-controls`

### Making Design Changes

1. All styles live in `src/index.css` — there are no component-level CSS files
2. Use existing CSS variables instead of hardcoding values
3. Follow the existing BEM-inspired class naming convention
4. Test on mobile (375px), tablet (768px), and desktop (1200px+)
5. Verify keyboard navigation works for any interactive elements you add

---

## Development Setup

```bash
# Clone the repo
git clone https://github.com/TheMorpheus407/european-alternatives.git
cd european-alternatives

# Install dependencies
npm install

# Start the dev server (hot-reload)
npm run dev

# The site runs at http://localhost:5173
```

### Useful Commands

| Command | What It Does |
|---|---|
| `npm run dev` | Start Vite dev server with hot reload |
| `npm run build` | Type-check (tsc) + production build (vite) |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint on all TypeScript files |

---

## Coding Standards

### TypeScript

- **Strict mode** is enabled — all strict checks enforced by `tsconfig.app.json`
- All new data structures must be typed in `src/types/index.ts`
- Use `interface` for object shapes, `type` for unions and aliases
- Unused variables and parameters are compile errors (not warnings)

### React

- **Functional components** only — no class components
- Use `useMemo` for expensive computations (filtering, sorting)
- Use `useCallback` for handlers passed as props
- Prefer controlled components for form inputs
- Use Framer Motion for animations (not CSS animations for interactive elements)

### CSS

- Use CSS custom properties (`var(--...)`) for all colors, spacing, fonts, and transitions
- Follow mobile-first responsive approach (`min-width` media queries)
- Keep specificity low — avoid nesting beyond 2 levels
- No inline styles in React components (except for dynamic values like animation delays)

### General

- No `console.log` in committed code
- No commented-out code blocks
- Prefer descriptive variable names over comments
- Keep components under ~300 lines — extract sub-components if needed

---

## Commit Conventions

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>: <short description>
```

### Types

| Type | When to Use |
|---|---|
| `feat` | Adding a new alternative, category, or feature |
| `fix` | Bug fix |
| `docs` | Documentation changes |
| `style` | CSS/formatting changes (no logic change) |
| `refactor` | Code restructuring without behavior change |
| `chore` | Tooling, config, dependency updates |

### Examples

```
feat: add Nextcloud as cloud storage alternative
feat: add password-manager category
fix: correct country flag display for Swiss alternatives
style: improve card spacing on mobile
docs: update contributing guide with new category list
refactor: extract filter logic into custom hook
```

---

## Pull Request Process

1. **Fork the repository** and create a branch from `main`
2. **Make your changes** — follow the relevant guide above
3. **Test locally** — run `npm run dev`, `npm run build`, and `npm run lint`
4. **Commit** with a clear message following the [conventions above](#commit-conventions)
5. **Open a Pull Request** against `main` with:
   - A clear title describing the change
   - A description of what you changed and why
   - Screenshots if the change is visual
6. **Wait for review** — maintainers will review and may request changes

### PR Checklist

- [ ] `npm run build` passes (no TypeScript errors)
- [ ] `npm run lint` passes (no ESLint warnings)
- [ ] Tested on mobile and desktop viewports (for UI changes)
- [ ] New alternatives have all required fields filled in
- [ ] No hardcoded colors/spacing — CSS variables used instead (for design changes)

---

## What Makes a Good Alternative

When adding an alternative, please verify:

- **It's European** — headquartered in a European country (EU, Switzerland, Norway, Iceland, UK)
- **It's actively maintained** — the service or software is alive and receiving updates
- **It actually replaces something** — it should serve a similar purpose to a US product
- **The information is accurate** — double-check the website, pricing, and open-source status
- **It's not a wrapper** — alternatives should be independent products, not reskins of US services

### We Don't Include

- Services that are European in name only but route data through US infrastructure without transparency
- Abandoned or discontinued projects
- Products in pre-alpha without a usable offering
- Services that require US-based dependencies to function (e.g., built entirely on AWS with no alternative)

---

## Questions?

- Open a [GitHub Issue](https://github.com/TheMorpheus407/european-alternatives/issues) for bugs, feature requests, or alternative suggestions
- Check the [README](README.md) for project overview and links

Thank you for helping build a stronger European tech ecosystem.
