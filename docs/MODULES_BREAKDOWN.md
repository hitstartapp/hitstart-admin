# Detailed Module Breakdown

## 1. Reporting & Analytics (`/reporting`)
- **Revenue Dashboard (`/reporting/revenue`):**
  - Aggregates `WorkoutPurchase` and `MealPurchase` records.
  - Dynamically calculates: Total Revenue, Workout Revenue, Meal Revenue, Recent 7d Purchases, Refund Rate (%), ARPU (Average Revenue Per User).
  - Visualizations: 30-Day Revenue Trend Area/Bar Chart, Package Breakdown Pie Chart, Payment Status Chart, Recent Transactions Table.
- **User Analytics (`/reporting/users`):**
  - Aggregates `User`, `UserMetric`, `WorkoutTracking`, and `WaterTracking`.
  - Calculates: Total Users, 30d New User Acquisition, Paying Users, Conversion Rate (%), 7d Active Users, Average Streak.
  - Visualizations: 30-Day Growth Line Chart, Gender & Dietary Preference distributions, Fitness Goals/Levels charts, Top Users Leaderboard sorted by XP/Level.

## 2. User Management (`/users`)
- **Users Table:** Displays user profiles, contact info, dietary preferences, and health concerns.
- **Side Panel Form:** Edit/Create users with fields: Name, Email, Phone, Gender, Birth Date, Dietary Preference, Health Concerns (boolean + textarea).
- **Account Deletion Requests (`/users?tab=deletion-requests`):**
  - View user requests for GDPR account deletion.
  - Actions: Approve (deletes `User` record and cascades/removes request) or Reject (marks request status as 'rejected').

## 3. Workouts & Exercises (`/workout`)
- **Plans View (`?view=plans`):**
  - Table of all `WorkoutPlan` entries with **inline create & inline edit** functionality.
  - Double-click or CommandBar Edit activates inline editing. CommandBar New prepends a temporary row.
  - Filter by Gender and Fitness Level.
  - "Configure Workouts" action opens `WorkoutConfigPanel`, allowing full drag-and-drop reordering of exercises within a plan, specifying sets, reps, duration, and exercise variation links.
- **Exercises View (`?view=exercises`):**
  - Left panel: `InteractiveExerciseList` displaying parent `Exercise` records with **inline create & inline edit** support.
  - Right panel: `ExerciseVariation` list for the selected exercise with `ImagePreview` and `VideoPreview` media viewers.
  - "New Variation" / "Edit Variation" triggers the sliding side panel `VariationForm`.

## 4. Meal Management (`/meal`)
- **Sidebar Selector:** Toggle between `MealPlan` and `Food`.
- **Side Panel Form (`MealSidePanel`):** Create/edit root meal plans or food items.
- **Hierarchical Meal Config Panel (`MealConfigPanel`):**
  - Level 1: Manage `Meal` sections (e.g. Breakfast, Lunch, Dinner, Snacks) with drag-and-drop order.
  - Level 2: Manage nested `MealItem` entries inside each meal section.
  - Multi-select Food linking via `MealItemFoodMap`.

## 5. Gamification (`/gamification`)
- Multi-table CRUD dashboard for `LevelMapping`, `LevelStructure`, `Rank`, and `Badge`.
- Dynamic schema rendering via `TABLES` definition in `models.ts`.
- Automatically loads relational options (e.g. Badges list for Level Structure).

## 6. Configuration (`/configuration`)
- Global key-value pair editor for `Configuration` (e.g. image/video storage URLs) and `Message` (push notification templates and motivation quotes).
