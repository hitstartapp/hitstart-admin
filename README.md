# Hitstart Admin Dashboard

Welcome to the **Hitstart Admin Dashboard** repository. This is a high-performance, responsive administrative web application for managing the Hitstart fitness and nutrition ecosystem.

It provides administrative controls, content management, gamification configuration, user management, revenue monitoring, and analytics.

## Tech Stack

- **Framework:** Next.js 15 (App Router, Server Actions, Server & Client Components)
- **Language:** TypeScript 5.9
- **UI & Styling:** Tailwind CSS v4, PostCSS, `@tailwindcss/typography`, `tw-animate-css`
- **Component Primitives & Icons:** Lucide React (`lucide-react`)
- **Animations:** Motion (`motion` / Framer Motion)
- **Data Visualization:** Recharts (`recharts`)
- **Backend & Database:** Supabase (`@supabase/supabase-js`, `@supabase/ssr` with PostgreSQL)
- **AI Integration:** Google GenAI SDK (`@google/genai`)

## Project Structure

- `app/`: Next.js app router pages, layouts, and API routes.
- `components/`: Shared UI components (Sidebar, Topbar, CommandBar, etc).
- `docs/`: Detailed documentation on architecture, design principles, database schema, and module breakdowns.
- `lib/`: Utilities and database types.
- `utils/`: Supabase clients and middleware.

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm / pnpm / yarn
- Supabase project credentials
- Gemini API Key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/hitstartapp/hitstart-admin.git
   cd hitstart-admin
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file and add your Supabase and Gemini credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   GEMINI_API_KEY=your_gemini_api_key
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Documentation for Developers / AI Agents

If you are contributing to this project (or you are an AI assistant working on it), please make sure to read the top-level `AGENTS.md` file and the detailed documentation in the `docs/` directory before making changes:
- `docs/ARCHITECTURE.md` - Core architecture and Next.js guidelines.
- `docs/DESIGN_PRINCIPLES.md` - UI Rules and Design Principles.
- `docs/REPORT_DESIGN.md` - Report design specifications.
- `docs/DATABASE_SCHEMA.md` - Database schema definitions.
- `docs/MODULES_BREAKDOWN.md` - Specific implementation details for different modules.
