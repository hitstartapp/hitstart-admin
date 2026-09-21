# Architecture & Core Concepts

## 1. Next.js 15 App Router & React 19
- Uses Next.js 15 Server and Client components where appropriate.
- Server-side rendering (SSR) is used for data-heavy pages and analytics (`actions.ts` using `createServerClient(cookieStore)`).
- Dynamic client components (`'use client'`) are used for interactive tables, drag-and-drop ordering, and form side panels.
- URL search parameters (`searchParams`) drive the active UI state (e.g. `?view=exercises&exerciseId=123&action=edit&id=456`).

## 2. Centralized Data Access Layer & Supabase Architecture
- **Type Safety (`lib/types/database.ts`):** Complete, strongly typed interfaces for all 18 PostgreSQL tables and relationships.
- **Server Supabase:** Imported via `@/utils/supabase/server` (`createClient(cookieStore)`) in Server Actions (`actions.ts`). All data queries, mutations, relational joins, and batch updates are centralized in domain-specific `actions.ts` files with automated `revalidatePath()`.
- **Client Components (`'use client'`):** Client components do NOT make direct `supabase.from()` calls. They invoke typed Server Actions to ensure security, consistency, and automated cache revalidation.
- **Client Supabase:** Restricted to Supabase Auth login (`app/(auth)/login/page.tsx`) and Topbar session display (`components/Topbar.tsx`).
- **Middleware Guard (`middleware.ts` & `utils/supabase/middleware.ts`):** 
  - Verifies user authentication with `supabase.auth.getUser()`.
  - Unauthenticated users are redirected to `/login`.
  - Authenticated users visiting `/login` are automatically redirected to `/`.

---

# Development & Contribution Guidelines

## Environment Variables
Ensure `.env.local` is configured:
```env
NEXT_PUBLIC_SUPABASE_URL="https://<your-project-id>.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="<your-publishable-key>"
GEMINI_API_KEY="<your-gemini-api-key>"
APP_URL="http://localhost:3000"
```

## Running Locally
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build production bundle
npm run build

# Run linter
npm run lint
```
