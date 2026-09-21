/**
 * Hitstart Admin Dashboard Database Types
 * Strongly typed definitions for Supabase PostgreSQL tables and relational models.
 */

// ==========================================
// 1. Users & Tracking Models
// ==========================================

export interface User {
  user_id: string; // UUID PK
  user_name: string | null;
  email: string | null;
  phone: string | null;
  gender: 'Male' | 'Female' | 'Other' | null;
  birth_date: string | null;
  dietary_preference: 'Vegetarian' | 'Eggetarian' | 'Non-Vegetarian' | null;
  has_health_concerns: boolean | null;
  health_concern_details: string | null;
  created_at: string;
}

export interface UserMetric {
  id?: string;
  user_id: string;
  level: number | null;
  streak_current: number | null;
  streak_longest: number | null;
  coins: number | null;
  fitness_level: 'Beginner' | 'Intermediate' | 'Advanced' | null;
  fitness_goal: 'Weight Loss' | 'Muscle Gain' | 'Maintenance' | null;
  experience_points: number | null;
  rank: string | null;
  badge: string | null;
  updated_at?: string;
}

export interface AccountDeletionRequest {
  id: string;
  user_id: string;
  requested_at: string;
  status: 'pending' | 'rejected' | 'approved';
  processed_at: string | null;
  reason: string | null;
  // Joined relation:
  user?: Partial<User> | null;
}

export interface WorkoutTracking {
  id: string;
  user_id: string;
  assigned_date: string;
  completed_at?: string | null;
  created_at?: string;
}

export interface WaterTracking {
  id: string;
  user_id: string;
  date: string;
  glasses?: number | null;
  amount_ml?: number | null;
  created_at?: string;
}

// ==========================================
// 2. Workouts & Exercises Models
// ==========================================

export interface WorkoutPlan {
  id: string; // UUID PK
  name: string;
  level: number | null;
  week: number | null;
  day: number | null;
  payment_required: boolean;
  price: number | null;
  package_id: string | null;
  gender: string | null;
  fitness_level: string | null;
  workout_type: string | null;
  note: string | null;
  created_at?: string;
}

export interface Exercise {
  id: string; // UUID PK
  name: string;
  category: string | null;
  description: string | null;
  created_at?: string;
  // Joined relation:
  ExerciseVariation?: ExerciseVariation[];
}

export interface ExerciseVariation {
  id: string; // UUID PK
  exercise: string; // FK to Exercise.id
  name: string;
  description: string | null;
  image_storage: string | null;
  video_storage: string | null;
  created_at?: string;
}

export interface Workout {
  id: string; // UUID PK
  workout_plan: string; // FK to WorkoutPlan.id
  exercise: string; // FK to ExerciseVariation.id
  order_of_exercise: number;
  workout_type: string | null;
  number_of_set: number | null;
  number_of_reps: number | null;
  duration: string | null;
  note: string | null;
  created_at?: string;
  // Joined relation:
  ExerciseVariation?: Partial<ExerciseVariation> | null;
}

export interface WorkoutPurchase {
  id: string;
  user_id: string;
  workout_plan: string;
  package_id: string | null;
  purchase_date: string;
  status: 'success' | 'refunded' | 'failed';
  // Joined relations:
  WorkoutPlan?: Partial<WorkoutPlan> | null;
  User?: Partial<User> | null;
}

// ==========================================
// 3. Meals & Nutrition Models
// ==========================================

export interface MealPlan {
  id: string; // UUID PK
  name: string;
  dietary_preference: string | null;
  fitness_goal: string | null;
  gender: string | null;
  weight_range_from: number | null;
  weight_range_to: number | null;
  is_paid: boolean;
  price: number | null;
  package_id: string | null;
  note: string | null;
  created_at?: string;
}

export interface Meal {
  id: string; // UUID PK
  meal_plan: string; // FK to MealPlan.id
  name: string;
  display_type: 'header' | 'body';
  meal_order: number;
  created_at?: string;
  // Joined relations:
  MealItem?: MealItemWithFoods[];
  MealItemFood?: { meal_item: string; food: number | string }[];
}

export interface MealItem {
  id: string; // UUID PK
  meal: string; // FK to Meal.id
  name: string;
  note: string | null;
  created_at?: string;
}

export interface MealItemFood {
  id?: string;
  meal_item: string; // FK to MealItem.id
  food: number | string; // FK to Food.id
}
export type MealItemFoodMap = MealItemFood;

export interface Food {
  id: number | string; // PK
  name: string;
  created_at?: string;
}

export interface MealItemWithFoods extends MealItem {
  MealItemFood?: {
    food: number | string;
    Food?: Food | null;
  }[];
  MealItemFoodMap?: {
    food: number | string;
    Food?: Food | null;
  }[];
}

export interface MealPurchase {
  id: string;
  user_id: string;
  meal_plan: string;
  package_id: string | null;
  purchase_date: string;
  status: 'success' | 'refunded' | 'failed';
  // Joined relations:
  MealPlan?: Partial<MealPlan> | null;
  User?: Partial<User> | null;
}

// ==========================================
// 4. Gamification Models
// ==========================================

export interface LevelMapping {
  id: number;
  level: number;
  fitness_level: string;
  map: any;
  map_string: string | null;
  description: string | null;
}

export interface LevelStructure {
  id: number;
  level: number;
  week: number;
  day: number;
  next_stage: number | null;
  fitness_level: string;
  coins_per_day: number | null;
  xp_per_day: number | null;
  weekly_bonus_coins: number | null;
  weekly_bonus_xp: number | null;
  level_bonus_coins: number | null;
  badge: number | null;
}

export interface Rank {
  id: number;
  name: string;
  xp_range_from: number;
  xp_range_to: number;
}

export interface Badge {
  id: number;
  name: string;
  level: number | null;
  fitness_level: string | null;
  image_storage: string | null;
}

// ==========================================
// 5. System Configuration Models
// ==========================================

export interface Configuration {
  id: number;
  configuration: string;
  value: string;
}

export interface Message {
  id: number;
  message_type: 'Motivation' | 'Push';
  message: string;
}
