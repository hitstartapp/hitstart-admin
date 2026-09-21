# AGENTS.md — Hitstart Admin Dashboard

Welcome to the **Hitstart Admin Dashboard** codebase. This document serves as the top-level architectural guide for AI agents and developers working on this project. 

> [!IMPORTANT]
> **To keep this context window lean, detailed documentation has been split into separate files in the `docs/` directory.** 
> AI Agents: You **MUST** use your `view_file` tool to read the specific documentation files linked below before making any changes in their respective areas.

---

## 1. Project Overview

**Hitstart Admin Dashboard** is a high-performance, responsive administrative web application for managing the Hitstart fitness and nutrition ecosystem. It provides administrative controls, content management, gamification configuration, user management, revenue monitoring, and analytics.

### Tech Stack
- **Framework:** Next.js 15 (App Router, Server Actions, Server & Client Components)
- **Language:** TypeScript 5.9
- **UI & Styling:** Tailwind CSS v4, PostCSS, `@tailwindcss/typography`, `tw-animate-css`
- **Component Primitives & Icons:** Lucide React (`lucide-react`)
- **Animations:** Motion (`motion` / Framer Motion)
- **Data Visualization:** Recharts (`recharts`)
- **Backend & Database:** Supabase (`@supabase/supabase-js`, `@supabase/ssr` with PostgreSQL)
- **AI Integration:** Google GenAI SDK (`@google/genai`)

---

## 2. Repository Structure

```
hitstart-dashboard/
├── app/
│   ├── (auth)/login/       # Authentication route
│   ├── (dashboard)/        # Main application routes (layout, modules)
│   ├── api/                # API routes
│   └── globals.css         # Global styles
├── components/             # Shared UI components (Sidebar, Topbar, CommandBar, etc)
├── docs/                   # Detailed documentation (READ THESE FIRST!)
├── lib/                    # Utilities and Database Types
├── utils/                  # Supabase clients and middleware
├── middleware.ts           # Route protection guard
└── package.json            # Dependencies
```

---

## 3. Agent Directives & Detailed Documentation Links

Before you start writing code, identify the domain of the task and **read the corresponding documentation file**:

- 🏗️ **Architecture & Centralized Data Layer**: Read [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) to understand how Next.js 15 is used with Supabase Server Actions and Client Components.
- 🎨 **UI Rules & Design Principles**: Read [docs/DESIGN_PRINCIPLES.md](docs/DESIGN_PRINCIPLES.md) and [docs/REPORT_DESIGN.md](docs/REPORT_DESIGN.md). You MUST follow the two interaction models (Inline Edit vs Sliding Side Panel) and flex-based tables pattern.
- 🗄️ **Database Tables**: Read [docs/DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md) for the exact schema definitions before writing SQL or modifying `actions.ts`.
- 🧩 **Module Breakdown**: Read [docs/MODULES_BREAKDOWN.md](docs/MODULES_BREAKDOWN.md) for the specific implementation details of `/reporting`, `/users`, `/workout`, `/meal`, `/gamification`, and `/configuration`.
- 🛠️ **Workspace Skills**: We have custom skills in `.agent/skills/` covering React best practices, Next.js cache components, and view transitions. Ensure you use them when working in related domains!