'use server';

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { User, UserMetric, WorkoutPurchase, MealPurchase, WorkoutTracking, WaterTracking } from '@/lib/types/database';

export interface UserKPIs {
  totalUsers: number;
  newUsers30d: number;
  payingUsers: number;
  conversionRate: number;
  activeUsers7d: number;
  avgStreak: number;
}

export interface UserGrowthItem {
  dateStr: string;
  count: number;
}

export interface DistributionItem {
  name: string;
  value: number;
}

export interface TopUser {
  user_id: string;
  user_name: string;
  level: number;
  streak_current: number;
  streak_longest: number;
  fitness_level: string;
  coins: number;
  experience_points: number;
}

export async function getUserAnalytics() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

  // Parallel fetch: Users, UserMetrics, Purchases, and Activity tracking
  const [
    { data: allUsers, error: usersError },
    { data: allMetrics, error: metricsError },
    { data: workoutPurchases },
    { data: mealPurchases },
    { data: recentWorkouts },
    { data: recentWater }
  ] = await Promise.all([
    supabase
      .from('User')
      .select('user_id, user_name, gender, dietary_preference, created_at'),
    supabase
      .from('UserMetric')
      .select('user_id, level, streak_current, streak_longest, coins, fitness_level, fitness_goal, experience_points, rank, badge'),
    supabase
      .from('WorkoutPurchase')
      .select('user_id, status'),
    supabase
      .from('MealPurchase')
      .select('user_id, status'),
    supabase
      .from('WorkoutTracking')
      .select('user_id')
      .gte('assigned_date', sevenDaysAgoStr),
    supabase
      .from('WaterTracking')
      .select('user_id')
      .gte('date', sevenDaysAgoStr)
  ]);

  if (usersError) console.error('Error fetching users:', usersError);
  if (metricsError) console.error('Error fetching user metrics:', metricsError);

  const users = (allUsers as Partial<User>[]) || [];
  const metrics = (allMetrics as Partial<UserMetric>[]) || [];
  const wpList = (workoutPurchases as Partial<WorkoutPurchase>[]) || [];
  const mpList = (mealPurchases as Partial<MealPurchase>[]) || [];

  const payingUserIds = new Set([
    ...wpList.filter(p => p.status === 'success').map(p => p.user_id!),
    ...mpList.filter(p => p.status === 'success').map(p => p.user_id!),
  ]);

  const activeUserIds = new Set([
    ...((recentWorkouts as Partial<WorkoutTracking>[]) || []).map(w => w.user_id!),
    ...((recentWater as Partial<WaterTracking>[]) || []).map(w => w.user_id!),
  ]);

  // --- Calculate KPIs ---
  const totalUsers = users.length;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const newUsers30d = users.filter(u => u.created_at && new Date(u.created_at) >= thirtyDaysAgo).length;

  const payingUsersCount = payingUserIds.size;
  const conversionRate = totalUsers > 0 ? (payingUsersCount / totalUsers) * 100 : 0;
  const activeUsers7d = activeUserIds.size;

  const streaks = metrics.map(m => m.streak_current || 0);
  const avgStreak = streaks.length > 0 ? streaks.reduce((a, b) => a + b, 0) / streaks.length : 0;

  const kpis: UserKPIs = {
    totalUsers,
    newUsers30d,
    payingUsers: payingUsersCount,
    conversionRate: Math.round(conversionRate * 10) / 10,
    activeUsers7d,
    avgStreak: Math.round(avgStreak * 10) / 10,
  };

  // --- User Growth (30 days) ---
  const growthMap = new Map<string, { dateStr: string; count: number }>();
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = `${d.toLocaleString('default', { month: 'short' })} ${d.getDate()}`;
    growthMap.set(d.toISOString().split('T')[0], { dateStr, count: 0 });
  }

  users.forEach(u => {
    if (u.created_at) {
      const key = new Date(u.created_at).toISOString().split('T')[0];
      if (growthMap.has(key)) {
        growthMap.get(key)!.count++;
      }
    }
  });
  const growthData: UserGrowthItem[] = Array.from(growthMap.values());

  // --- Gender Distribution ---
  const genderMap = new Map<string, number>();
  users.forEach(u => {
    const gender = u.gender || 'Not Specified';
    genderMap.set(gender, (genderMap.get(gender) || 0) + 1);
  });
  const genderDistribution: DistributionItem[] = Array.from(genderMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // --- Dietary Preference Distribution ---
  const dietMap = new Map<string, number>();
  users.forEach(u => {
    const diet = u.dietary_preference || 'Not Specified';
    dietMap.set(diet, (dietMap.get(diet) || 0) + 1);
  });
  const dietaryDistribution: DistributionItem[] = Array.from(dietMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // --- Fitness Goal Distribution ---
  const goalMap = new Map<string, number>();
  metrics.forEach(m => {
    const goal = m.fitness_goal || 'Not Set';
    goalMap.set(goal, (goalMap.get(goal) || 0) + 1);
  });
  const fitnessGoalDistribution: DistributionItem[] = Array.from(goalMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // --- Fitness Level Distribution ---
  const levelMap = new Map<string, number>();
  metrics.forEach(m => {
    const level = m.fitness_level || 'Not Set';
    levelMap.set(level, (levelMap.get(level) || 0) + 1);
  });
  const fitnessLevelDistribution: DistributionItem[] = Array.from(levelMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // --- Top Users by Level/XP ---
  const metricsMap = new Map(metrics.map(m => [m.user_id, m]));
  const topUsers: TopUser[] = users
    .map(u => {
      const m = metricsMap.get(u.user_id!);
      return {
        user_id: u.user_id!,
        user_name: u.user_name || 'Unknown User',
        level: m?.level || 0,
        streak_current: m?.streak_current || 0,
        streak_longest: m?.streak_longest || 0,
        fitness_level: m?.fitness_level || 'N/A',
        coins: m?.coins || 0,
        experience_points: m?.experience_points || 0,
      };
    })
    .sort((a, b) => (b.experience_points || 0) - (a.experience_points || 0) || (b.level || 0) - (a.level || 0))
    .slice(0, 15);

  return {
    kpis,
    growthData,
    genderDistribution,
    dietaryDistribution,
    fitnessGoalDistribution,
    fitnessLevelDistribution,
    topUsers,
  };
}
