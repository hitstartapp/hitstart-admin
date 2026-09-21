# Dashboard Design System

This document outlines the design language and component specifications established in the `/reporting` dashboard, serving as a reference for building future dashboards and UI elements to ensure a cohesive, premium aesthetic.

## Core Aesthetic

The design philosophy emphasizes a clean, "floating" UI with generous whitespace, soft shadows, and rounded, friendly borders.

### 1. Colors & Backgrounds
- **App Background:** `#F8FAFC` (Tailwind `slate-50`)
- **Card Background:** Pure white (`bg-white`)
- **Primary Data Colors:**
  - Light Blue: `#38bdf8` (Tailwind `sky-400`)
  - Pink/Orange: `#f472b6` (Tailwind `pink-400`)
- **Text Hierarchy:**
  - Primary Headers/Large Numbers: `text-slate-800`
  - Secondary Text/Subtitles: `text-slate-500`
  - Muted/Disabled Text: `text-slate-400`

### 2. Shadows & Borders
- **Standard Card Shadow:** `shadow-[0_4px_24px_-8px_rgba(0,0,0,0.05)]` - This provides a very soft, diffuse shadow that makes the cards feel like they are floating seamlessly.
- **Card Borders:** `border border-slate-100/50` - Barely visible, used primarily for subtle definition on highly calibrated monitors.
- **Border Radius:** `rounded-[24px]` (or `rounded-3xl`) - Used uniformly on all primary container cards.

## Component Specifications

### KPI Overview Cards
- **Container:** `bg-white rounded-[24px] p-6 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.05)] border border-slate-100/50`
- **Layout:** Flex column with `justify-between`.
- **Top Row:** Title (`text-sm font-medium text-slate-500`) on the left, small circular icon container on the right.
- **Bottom Row:** Large metric (`text-4xl font-light tracking-tight text-slate-800`), followed by a subtle description below it.

### Charts
- **Container:** Matches the KPI cards, explicitly enforcing a height (e.g., `h-[400px]`).
- **Header:** Can include aggregated totals (e.g., `text-3xl font-light`) alongside standard titles, and optional pill-shaped time toggles.
- **Grid Lines:** Soft and horizontal only (`stroke="#f8fafc"`).
- **Axes:** Minimal, removing axis lines and tick marks, using subtle text (`fill="#94a3b8"`).
- **Tooltips:** Custom styling to match cards (`borderRadius: '16px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)'`).

### Data Tables
- **Container:** Matches the KPI cards.
- **Header:** Clean and borderless except for a bottom separator (`border-b border-slate-100`), using subtle text (`text-slate-400 font-normal`).
- **Row Hover:** `hover:bg-slate-50/50 transition-colors`.
- **Dividers:** Very subtle inner row dividers (`divide-y divide-slate-100/60`).

### Status Badges
Status badges are heavily stylized to look soft and pill-shaped, incorporating a colored dot indicator.
- **Base Shape:** `inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border`
- **Success (e.g., Approved):** `bg-emerald-50 text-emerald-700 border-emerald-100` (Dot: `bg-emerald-500`)
- **Warning (e.g., Pending):** `bg-amber-50 text-amber-700 border-amber-100` (Dot: `bg-amber-500`)
- **Error (e.g., Declined):** `bg-rose-50 text-rose-700 border-rose-100` (Dot: `bg-rose-500`)

## Page Layout
- **Container Padding:** `px-6` horizontal padding uniformly applied to headers and grid containers.
- **Grid Gaps:** `gap-6` between cards to maintain breathability.
- **Header:** Generous padding (`py-8 pb-6`) with a clean `text-2xl font-semibold tracking-tight` title.
