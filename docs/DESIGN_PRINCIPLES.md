# Dashboard Design Principles & Component Guidelines

This document outlines the core design principles, UI patterns, color tokens, and component structures implemented across the **Hitstart Admin Dashboard**. Agents and developers adding new components, views, or restructuring existing screens MUST follow these guidelines strictly to ensure visual and architectural consistency.

---

## 1. Global Implementation Rules (CRITICAL)

The Hitstart Dashboard utilizes two standardized interaction models for record creation and editing, tailored to the complexity and workflow of each dataset:

### 1.1 Creation & Editing Interaction Models

1. **Inline Table Create & Edit (Workout Plans & Exercise Master List)**:
   - For high-frequency table items requiring fast tabular editing—specifically **Workout Plans** (`InteractiveWorkoutTable.tsx`) and **Exercise Master Items** (`InteractiveExerciseList.tsx`)—create and edit actions occur **inline directly within the table rows**.
   - Clicking **"New"** in the Command Bar prepends a new temporary row (`temp-${Date.now()}`) into the table in editing mode.
   - Clicking **"Edit"** or **double-clicking a row** switches that row into inline editable form controls.
   - The Command Bar dynamically transforms to display **Save** (emerald check) and **Cancel** (red X) buttons driven by global event listeners.

2. **Sliding Side Panel for Rich Entities (Users, Variations, Meals, Gamification, Configuration)**:
   - For detailed entity schemas, rich metadata forms, and media-linked items—including **Users**, **Exercise Variations**, **Meal Plans**, **Food items**, **Gamification tiers**, and **System Configuration**—creation and modification **MUST** occur inside a right sliding Side Panel (`fixed inset-y-0 right-0 w-[600px] bg-white shadow-2xl border-l border-slate-200 translate-x-0`).
   - **NEVER** use inline forms, popup modals, or separate full-page routes for these rich entities.

3. **Standardized Command Bar**:
   - The Command Bar **MUST** be placed directly at the top of content areas (`h-11 bg-white border-b border-slate-200 flex items-center px-6 gap-1 select-none flex-shrink-0`).
   - Provides consistent actions: **New**, **Edit**, **Delete**, **Refresh**, and module-specific custom actions (e.g. *Configure Workouts*, *Configure Meals*).
   - Disabled buttons must visually gray out (`text-slate-300 pointer-events-none`) when no row is selected.

4. **Flex-Based Data Tables**:
   - Standard data tables use Flexbox (`flex flex-col`, `flex-row`) with `sticky top-0` headers rather than standard HTML `<table>` elements to ensure precise column sizing, sticky headers, and smooth selection states.

5. **Strict Compliance**:
   - Under no circumstances should an agent create its own alternative implementation, custom popup dialogs for editing, or diverge from the established slate-based visual language.

---

## 2. Color System & Semantic Tokens (Studio Light Mode)

We use a high-contrast athletic light theme, grounded by custom fonts and intense accents.

| Token / Usage | Tailwind Class / Hex | Description |
|---|---|---|
| **Main App Background** | `bg-slate-50` (`#F8FAFC`) | Primary viewport and panel background |
| **Card & Panel Background** | `bg-white` | Surfaces, tables, drawer bodies, cards |
| **Borders & Dividers** | `border-slate-200` | Structural borders, sidebars, headers |
| **Primary Text** | `text-slate-900` | Section titles, active values, headers |
| **Secondary Text** | `text-slate-500` / `text-slate-400` | Subtitles, table cells, descriptions |
| **Primary Action (Fill)** | `bg-indigo-600 hover:bg-indigo-700 text-white` | Submit, Save, primary CTA buttons (Electric Indigo) |
| **Add / Positive Icon** | `text-indigo-600` | "New" command button, active checks |
| **Destructive / Delete Icon** | `text-red-500` | "Delete" action button |
| **Edit / Info Icon** | `text-indigo-500` | "Edit" button, links, selected highlights |
| **Active Row Selection** | `bg-indigo-50 text-indigo-700` | Highlighted row in nav/lists |
| **Inline Editing Indicator** | `text-amber-500 animate-pulse` | Pencil / Loader icon in selection column |
| **Active Row Selection** | `bg-blue-50/30` or `bg-indigo-50/40` | Highlighted row in tables/lists |
| **Row Hover** | `hover:bg-slate-50/40` or `hover:bg-slate-50/50` | Table row hover interaction |

### Status Badges & Chips
- **Success / Active / Boolean True:** `inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wide bg-emerald-50 text-emerald-700 border border-emerald-100`
- **Inactive / Boolean False:** `inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wide bg-slate-100 text-slate-500 border border-slate-200`
- **Category / Variation Badge:** `inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700`
- **Multi-Select Tag Pill:** `inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100`

---

## 3. Typography & Hierarchy

- **Page / Section Titles:** `text-[20px] font-semibold text-slate-800` (or `text-2xl font-semibold tracking-tight`)
- **Panel Header Titles:** `text-lg font-semibold text-slate-800`
- **Table Column Headers:** `text-[10px] font-bold uppercase tracking-widest text-slate-500`
- **Table Cell Text:** `text-[13px]` or `text-[14px] text-slate-600`
- **Form Field Labels:** `text-xs font-bold text-slate-600` with required red asterisk `<span className="text-red-500">*</span>`
- **Code / JSON / Keys:** `font-mono text-xs` or `text-[11px]`
- **CommandBar Action Labels:** `text-[13px] font-medium text-slate-700`

---

## 4. App Shell & Layout Structure

The app layout (`app/(dashboard)/layout.tsx`) is structured as a full-viewport, flex-based container:

```
┌────────┬────────────────────────────────────────────────────────┐
│        │ Topbar (h-[68px], border-b, logo, search, profile)     │
│        ├──────────────┬─────────────────────────────────────────┤
│        │ Secondary    │ CommandBar (h-11, border-b)             │
│ Primary│ Sidebar      ├─────────────────────────────────────────┤
│ Sidebar│ (w-60,       │ Main Content Area                       │
│ (w-[68px]│ sub-nav    │ (min-h-0, flex-1, overflow-y-auto)      │
│ icons) │ tabs)        │                                         │
│        │              │                                         │
└────────┴──────────────┴─────────────────────────────────────────┘
```

### Layout Properties
- **Viewport Wrapper:** `h-screen overflow-hidden bg-[#F8FAFC] text-sm text-[#1E293B] font-sans w-full`
- **Primary Sidebar:** `w-[68px] flex-shrink-0 border-r border-slate-200 flex flex-col items-center py-4 bg-white z-20`
  - Active navigation pill indicator on left edge: `absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-600 rounded-r-md`
- **Secondary Sidebar:** `w-[68px] lg:w-[260px] flex-shrink-0 border-r border-slate-200 bg-white flex flex-col z-10 transition-all` (collapses to 68px icon-only rail on tablet viewports `< 1024px`)
  - Item button: `w-11 lg:w-auto h-11 lg:h-auto px-0 lg:px-3 py-2 text-[13px] font-medium rounded-xl transition-all flex items-center justify-center lg:justify-start gap-2.5 cursor-pointer`
  - Active item: `bg-blue-50 text-blue-600 font-semibold`
- **Content Area:** `flex-1 flex flex-col min-w-0 bg-[#F8FAFC] relative overflow-hidden`

---

## 5. Component Implementations & Patterns

### A. Command Bar Architecture (`CommandBar.tsx`)

The Command Bar resides at the top of content areas (`h-11 bg-white border-b border-slate-200 flex items-center px-6 gap-1 select-none flex-shrink-0`). It features a dual-mode system:

#### 1. Standard Mode vs Inline Editing Mode
- In **Standard Mode**, it displays **New**, **Edit**, **Delete**, **Refresh**, and custom action buttons.
- In **Inline Editing Mode** (triggered by `inline-editing-start` window event), the standard actions are replaced with **Save** and **Cancel** buttons:
  - **Save Inline Button:** Container uses `flex items-center gap-1.5 px-3 py-1.5 rounded text-slate-700 hover:bg-slate-100 text-[13px] font-medium transition-colors cursor-pointer`. Inside, it includes a `Check` icon (`size={15} text-emerald-600 strokeWidth={2.5}`).
  - **Cancel Inline Button:** Same container classes, but includes an `X` icon (`size={15} text-red-500 strokeWidth={2.5}`).

#### 2. Event Bus for Inline Table Synchronization
The Command Bar communicates with inline editable tables via window Custom Events:
| Event Name | Dispatcher | Listener | Description |
|---|---|---|---|
| `add-plan` | CommandBar (New button) | `InteractiveWorkoutTable` | Prepends a temporary new plan row |
| `edit-plan` | CommandBar (Edit button) | `InteractiveWorkoutTable` | Enters inline edit mode for selected plan |
| `add-exercise` | CommandBar (New button) | `InteractiveExerciseList` | Prepends a temporary new exercise row |
| `edit-exercise` | CommandBar (Edit button) | `InteractiveExerciseList` | Enters inline edit mode for selected exercise |
| `delete-exercise` | CommandBar (Delete button) | `InteractiveExerciseList` | Deletes selected exercise from DB |
| `inline-editing-start` | Table / List component | `CommandBar` | Swaps CommandBar to Save/Cancel actions |
| `inline-editing-stop` | Table / List component | `CommandBar` | Restores CommandBar to standard actions |
| `save-inline-edit` | CommandBar (Save button) | Table / List component | Commits inline edits to database |
| `cancel-inline-edit` | CommandBar (Cancel button) | Table / List component | Discards inline edits / removes temp row |
| `configure-workouts` | CommandBar (Configure button) | `InteractiveWorkoutTable` | Opens exercise mapping config panel |

---

### B. Inline Table Editing Pattern (`InteractiveWorkoutTable.tsx`, `InteractiveExerciseList.tsx`)

Used specifically for **Workout Plans** and **Exercise Master Items**:

#### 1. Creation Flow
1. User clicks **"New"** in the Command Bar.
2. `CommandBar` dispatches `add-plan` or `add-exercise`.
3. Table component generates a temporary ID (`temp-${Date.now()}`) and prepends a default blank record to `items`.
4. `editingId` is set to the temp ID, switching the new row to editable input controls.
5. Component dispatches `inline-editing-start`, causing Command Bar to show **Save** and **Cancel**.

#### 2. Inline Row State & Controls
When `editingId === item.id`, table cells render compact, high-performance inputs:
- **Number Inputs (Level, Week, Day):** `w-14 h-9 px-2 text-[13px] rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500 text-center`
- **Text Inputs (Name / Title):** `w-full h-9 px-3 text-[13px] rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500 font-medium text-slate-800`
- **Dropdown Selects (Gender, Fitness Level, Workout Type, Category):** `h-9 px-3 text-[13px] rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500`
- **Boolean / Payment Toggles:** Styled checkbox with conditional price & package fields.
- **Selection Column Status:** Replaces the standard radio input. When saving, display a `Loader2` (`size={12} text-amber-500 animate-spin`). When editing, display a `Pencil` (`size={12} text-amber-500 animate-pulse`). Otherwise display the standard radio input.

#### 3. Keyboard & Double-Click Support
- **Double-Clicking** any row immediately activates inline editing for that record.
- **Enter key** in inputs triggers save.
- **Escape key** cancels editing and restores original values.

---

### C. Right Sliding Side Panel (`*SidePanel.tsx`)

Used for **Users**, **Exercise Variations**, **Meal Plans**, **Food**, **Gamification**, and **Configuration**. Components MUST implement the following structure and class tokens:

- **Backdrop Overlay:** `fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 transition-opacity duration-300` (toggle opacity 0/100 and pointer-events-none based on state).
- **Sliding Drawer Container:** `fixed inset-y-0 right-0 w-[600px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 flex flex-col border-l border-slate-200` (toggle translate-x-0 / translate-x-full based on state).
- **Panel Header:** `h-14 border-b border-slate-200 bg-white px-6 flex items-center justify-between flex-shrink-0`. Title uses `text-lg font-semibold text-slate-800`. Close button uses `text-slate-400 hover:text-slate-600 transition-colors`.
- **In-Panel CommandBar:** `h-11 bg-white border-b border-slate-200 flex items-center px-6 gap-1 select-none flex-shrink-0 z-20`. Contains Save/Cancel buttons styled exactly like the inline editing CommandBar.
- **Scrollable Body Wrapper:** `flex-1 p-6 overflow-y-auto bg-[#F8FAFC] flex flex-col items-center justify-start min-h-0 w-full`.
- **Inner Form Container:** `bg-white border border-slate-200 rounded-2xl shadow-xs p-8 w-full max-w-xl space-y-5`.

---

### D. Flex-Based Data Tables (Standard View)

Tables are built with flex containers to support horizontal and vertical scrolling, sticky headers, and radio selection. Follow these exact layout tokens:

- **Main Wrapper:** `bg-white flex-1 flex flex-col min-h-0 overflow-hidden` containing a scrolling area `flex-1 overflow-auto` and `min-w-max h-full flex flex-col`.
- **Sticky Header Row:** `sticky top-0 z-20 flex items-center bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-widest min-w-full w-max h-9`.
- **Header Cells:** Use `flex items-center gap-1 px-4 border-r border-slate-200 h-7 flex-shrink-0` (or `flex-1` for expanding columns). The leftmost selection column uses `w-12 h-9 flex-shrink-0 border-r border-slate-200`.
- **Rows Container:** `flex flex-col divide-y divide-slate-100 min-w-full w-max`.
- **Data Row:** `flex items-center group border-b border-slate-100 hover:bg-slate-50/40 transition-colors cursor-pointer`. When selected, add `bg-blue-50/30`, otherwise `bg-white`.
- **Data Cells:** `px-4 border-r border-slate-200/50 text-[14px] flex items-center h-14 flex-shrink-0 text-slate-600 font-medium truncate`. (Adjust `flex-1` or fixed width per column). The leftmost radio selection cell uses `w-12 h-14 flex-shrink-0 flex items-center justify-center border-r border-slate-200/50`.

---

### E. Form Controls & Inputs

Forms follow a strict input styling system. Always wrap field blocks in a container with `flex flex-col gap-1.5`. Labels use `text-xs font-bold text-slate-600` with a required asterisk `text-red-500`.

- **Text & Number Inputs:** 
  - Classes: `w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-slate-50 focus:bg-white font-medium text-slate-800 text-sm disabled:bg-slate-50 disabled:text-slate-400`.
- **Select Dropdowns:** 
  - Wrap the `<select>` element in a `relative` container. 
  - Select Classes: Same as Text inputs, but append `appearance-none cursor-pointer pr-10`.
  - Icon: Overlay a `ChevronDown` icon using `absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none size={16}`.
- **Custom Date Picker:** Use the shared `<CustomDatePicker />` component rather than raw `<input type="date">`.
- **JSON / Code Textareas:** Same as Text inputs, but swap the text font classes for `font-mono text-xs`.

---

### F. Hierarchical Configuration Panels (`MealConfigPanel`, `WorkoutConfigPanel`)

Used for complex parent-child configuration (e.g. Plan -> Meals -> Meal Items with Food mapping):
- **Drawer Width:** `w-full md:w-[700px] bg-white shadow-2xl`
- **Drag-and-Drop Reordering:** Use `GripVertical` handle icon (`text-slate-400 hover:text-slate-600 cursor-grab active:cursor-grabbing`) and dynamic drag-over indicator (`border-t-2 border-blue-500`).
- **Internal State Navigation:** Toggle between `'list'`, `'new'`, and `'edit'` panel modes with a breadcrumb or back arrow (`ArrowLeft`).
- **Pill Tag Selectors:** Render relational food tags with removable remove buttons (`X size={12}`).

---

### G. Media Preview Components (`ImagePreview.tsx`, `VideoPreview.tsx`)

- **Thumbnail Trigger Button:** `inline-flex items-center gap-1.5 text-xs text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 px-2 py-1 rounded-md transition-all shadow-sm font-medium`
- **Modal Overlay:** `fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm`
- **Container:** `bg-black rounded-2xl shadow-2xl max-w-4xl w-full h-[80vh] overflow-hidden relative flex items-center justify-center border border-slate-800`

---

### H. Loading Overlays & Skeletons

- **Table Refresh Overlay (`TableRefreshOverlay.tsx`):** Absolute loading overlay listening to `app-refresh-start` / `app-refresh-stop` events.
- **Pulse Skeletons:** `animate-pulse bg-slate-100 rounded` for table header and row placeholders.

---

## 6. Icons Guidelines

- Use **Lucide React** (`lucide-react`).
- Standard action sizes: `size={14}`, `size={15}`, or `size={16}`.
- Stroke width: Use `strokeWidth={2}` or `strokeWidth={2.5}` for crisp action glyphs.
- Action colors:
  - New / Save: `text-emerald-600`
  - Edit: `text-blue-600`
  - Delete: `text-red-500`
  - Inline Edit Active: `text-amber-500`
  - Neutral / Nav: `text-slate-400` / `text-slate-500`

---

## 7. Checklist for Creating / Modifying Views

When creating or modifying a dashboard view, verify:
- [ ] **Interaction Model:**
  - If **Workout Plans** or **Exercise Master List**: Uses inline table create/edit (`temp-` ID, `add-plan`/`add-exercise` events, CommandBar save/cancel integration).
  - If **Users, Variations, Meals, Gamification, Configuration**: Uses sliding right Side Panel (`w-[600px]`, `translate-x-0`).
- [ ] Flex-based table structure with sticky `h-9` uppercase headers.
- [ ] CommandBar is placed at the top (`h-11`) with New, Edit, Delete, and Refresh buttons.
- [ ] Form fields are enclosed in `bg-white border border-slate-200 rounded-2xl shadow-xs p-8 max-w-xl`.
- [ ] Inputs use `rounded-xl border border-slate-200 bg-slate-50 focus:bg-white`.
- [ ] Background is `#F8FAFC` (`bg-slate-50`).
- [ ] All interactive buttons include `cursor-pointer` and appropriate disabled states.
