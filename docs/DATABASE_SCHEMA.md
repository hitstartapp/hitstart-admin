# Database Schema Reference

The dashboard interacts with the following Supabase PostgreSQL tables:

## 1. Users & Tracking
| Table | Key Fields | Description |
|---|---|---|
| `User` | `user_id` (PK, UUID), `user_name`, `email`, `phone`, `gender`, `birth_date`, `dietary_preference`, `has_health_concerns`, `health_concern_details`, `created_at` | Core user accounts |
| `UserMetric` | `user_id` (FK), `level`, `streak_current`, `streak_longest`, `coins`, `fitness_level`, `fitness_goal`, `experience_points`, `rank`, `badge` | User gamification metrics and progress |
| `AccountDeletionRequest` | `id` (PK, UUID), `user_id` (FK), `requested_at`, `status` ('pending' \| 'rejected' \| 'approved'), `processed_at`, `reason` | User GDPR/account deletion queue |
| `WorkoutTracking` | `id`, `user_id`, `assigned_date`, ... | Daily workout completion log |
| `WaterTracking` | `id`, `user_id`, `date`, ... | Daily water consumption tracking |

## 2. Workouts & Exercises
| Table | Key Fields | Description |
|---|---|---|
| `WorkoutPlan` | `id` (PK, UUID), `name`, `level`, `week`, `day`, `payment_required` (bool), `price`, `package_id`, `gender`, `fitness_level`, `workout_type`, `note` | Master workout plans |
| `Workout` | `id` (PK, UUID), `workout_plan` (FK), `exercise` (FK to ExerciseVariation), `order_of_exercise`, `workout_type`, `number_of_set`, `number_of_reps`, `duration`, `note` | Exercises mapped to a plan |
| `Exercise` | `id` (PK, UUID), `name`, `category`, `description` | Parent exercise categories |
| `ExerciseVariation` | `id` (PK, UUID), `exercise` (FK to Exercise), `name`, `description`, `image_storage`, `video_storage` | Concrete exercise variations with media |
| `WorkoutPurchase` | `id` (PK, UUID), `user_id` (FK), `workout_plan` (FK), `package_id`, `purchase_date`, `status` ('success' \| 'refunded' \| 'failed') | Workout plan purchase ledger |

## 3. Meals & Nutrition
| Table | Key Fields | Description |
|---|---|---|
| `MealPlan` | `id` (PK, UUID), `name`, `dietary_preference`, `fitness_goal`, `gender`, `weight_range_from`, `weight_range_to`, `is_paid` (bool), `price`, `package_id`, `note` | Master dietary meal plans |
| `Meal` | `id` (PK, UUID), `meal_plan` (FK), `name`, `display_type` ('header' \| 'item'), `meal_order` | Sections/meal categories within a plan |
| `MealItem` | `id` (PK, UUID), `meal` (FK), `name`, `note` | Specific meal items within a section |
| `MealItemFoodMap` | `meal_item` (FK), `food` (FK) | Join table between meal items and food records |
| `Food` | `id` (PK, int/UUID), `name` | Master food and ingredient library |
| `MealPurchase` | `id` (PK, UUID), `user_id` (FK), `meal_plan` (FK), `package_id`, `purchase_date`, `status` | Meal plan purchase ledger |

## 4. Gamification
| Table | Key Fields | Description |
|---|---|---|
| `LevelMapping` | `id` (PK, int), `level`, `fitness_level`, `map` (JSON), `map_string`, `description` | Fitness level schedule mapping rules |
| `LevelStructure` | `id` (PK, int), `level`, `week`, `day`, `next_stage`, `fitness_level`, `coins_per_day`, `xp_per_day`, `weekly_bonus_coins`, `weekly_bonus_xp`, `level_bonus_coins`, `badge` | Game level progression rewards |
| `Rank` | `id` (PK, int), `name`, `xp_range_from`, `xp_range_to` | XP brackets for user rank tiers |
| `Badge` | `id` (PK, int), `name`, `level`, `fitness_level`, `image_storage` | Milestone badge achievements |

## 5. System Configuration
| Table | Key Fields | Description |
|---|---|---|
| `Configuration` | `id` (PK), `configuration` (key), `value` (value) | Dynamic storage base URLs (`image_storage_base_url`, `video_storage_base_url`), global config |
| `Message` | `id` (PK), `message_type` ('Motivation' \| 'Push'), `message` | Motivational quotes and notification messages |
