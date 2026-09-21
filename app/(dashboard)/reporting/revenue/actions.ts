'use server';

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { User, WorkoutPlan, MealPlan, WorkoutPurchase, MealPurchase } from '@/lib/types/database';

export interface RevenueKPIs {
  totalRevenue: number;
  workoutRevenue: number;
  mealRevenue: number;
  recentPurchases: number;
  refundRate: number;
  arpu: number;
}

export interface RevenueTrendItem {
  dateStr: string;
  Workout: number;
  Meal: number;
}

export interface PackageBreakdownItem {
  name: string;
  value: number;
}

export interface PaymentStatusItem {
  status: string;
  count: number;
}

export interface RevenueTransaction {
  id: string;
  user_id: string;
  user_name: string | null;
  date: Date;
  type: 'Workout' | 'Meal';
  planName: string;
  packageLabel: string;
  amount: number;
  status: string;
}

const PACKAGE_LABELS: Record<string, string> = {
  'unlock_beginner_continuation': 'Beginner Continuation',
  'unlock_intermediate_continuation': 'Intermediate Continuation',
  'unlock_meal_249': 'Meal Plan ₹249',
};

function getPackageLabel(packageId: string | null): string {
  if (!packageId) return 'Standard';
  return PACKAGE_LABELS[packageId] || packageId;
}

export async function getRevenueAnalytics() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Parallel fetch: Workout Purchases and Meal Purchases
  const [
    { data: workoutPurchases, error: wpError },
    { data: mealPurchases, error: mpError }
  ] = await Promise.all([
    supabase
      .from('WorkoutPurchase')
      .select('id, user_id, workout_plan, package_id, purchase_date, status')
      .order('purchase_date', { ascending: false }),
    supabase
      .from('MealPurchase')
      .select('user_id, meal_plan, package_id, purchase_date, status')
      .order('purchase_date', { ascending: false })
  ]);

  if (wpError) console.error('Error fetching WorkoutPurchases:', wpError);
  if (mpError) console.error('Error fetching MealPurchases:', mpError);

  const wpList = (workoutPurchases as WorkoutPurchase[]) || [];
  const mpList = (mealPurchases as MealPurchase[]) || [];

  const workoutPlanIds = [...new Set(wpList.map(wp => wp.workout_plan).filter(Boolean))];
  const mealPlanIds = [...new Set(mpList.map(mp => mp.meal_plan).filter(Boolean))];

  // Parallel fetch: Workout Plans and Meal Plans metadata
  const [
    { data: workoutPlans },
    { data: mealPlans }
  ] = await Promise.all([
    workoutPlanIds.length > 0
      ? supabase.from('WorkoutPlan').select('id, name, price').in('id', workoutPlanIds)
      : Promise.resolve({ data: [] }),
    mealPlanIds.length > 0
      ? supabase.from('MealPlan').select('id, name, price').in('id', mealPlanIds)
      : Promise.resolve({ data: [] })
  ]);

  const workoutPlanMap = new Map(
    ((workoutPlans as Partial<WorkoutPlan>[]) || []).map(p => [p.id!, { name: p.name || 'Unnamed Plan', price: p.price || 0 }])
  );
  const mealPlanMap = new Map(
    ((mealPlans as Partial<MealPlan>[]) || []).map(p => [p.id!, { name: p.name || 'Unnamed Plan', price: p.price || 0 }])
  );

  // Build unified transactions
  const transactions: RevenueTransaction[] = [
    ...wpList.map(wp => {
      const plan = workoutPlanMap.get(wp.workout_plan) || { name: 'Unknown Plan', price: 0 };
      return {
        id: wp.id,
        user_id: wp.user_id,
        user_name: null as string | null,
        date: new Date(wp.purchase_date),
        type: 'Workout' as const,
        planName: plan.name,
        packageLabel: getPackageLabel(wp.package_id),
        amount: plan.price,
        status: wp.status || 'unknown',
      };
    }),
    ...mpList.map((mp, index) => {
      const plan = mealPlanMap.get(mp.meal_plan) || { name: 'Unknown Plan', price: 0 };
      return {
        id: mp.id || `meal-purchase-${index}-${Date.now()}`,
        user_id: mp.user_id,
        user_name: null as string | null,
        date: new Date(mp.purchase_date),
        type: 'Meal' as const,
        planName: plan.name,
        packageLabel: getPackageLabel(mp.package_id),
        amount: plan.price,
        status: mp.status || 'unknown',
      };
    }),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  // Fetch user names for recent transactions (top 20)
  const recentTransactions = transactions.slice(0, 20);
  const userIds = [...new Set(recentTransactions.map(t => t.user_id).filter(Boolean))];
  if (userIds.length > 0) {
    const { data: users } = await supabase
      .from('User')
      .select('user_id, user_name')
      .in('user_id', userIds);
    if (users) {
      const userMap = new Map(((users as Partial<User>[]) || []).map(u => [u.user_id!, u.user_name]));
      recentTransactions.forEach(t => {
        t.user_name = userMap.get(t.user_id) || null;
      });
    }
  }

  // --- Calculate KPIs ---
  const successfulTransactions = transactions.filter(t => t.status === 'success');
  const totalRevenue = successfulTransactions.reduce((sum, t) => sum + t.amount, 0);
  const workoutRevenue = successfulTransactions.filter(t => t.type === 'Workout').reduce((sum, t) => sum + t.amount, 0);
  const mealRevenue = successfulTransactions.filter(t => t.type === 'Meal').reduce((sum, t) => sum + t.amount, 0);

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentPurchases = transactions.filter(t => t.date >= sevenDaysAgo).length;

  const refundedCount = transactions.filter(t => t.status === 'refunded').length;
  const refundRate = transactions.length > 0 ? (refundedCount / transactions.length) * 100 : 0;

  const uniquePayingUsers = new Set(successfulTransactions.map(t => t.user_id)).size;
  const arpu = uniquePayingUsers > 0 ? totalRevenue / uniquePayingUsers : 0;

  const kpis: RevenueKPIs = {
    totalRevenue,
    workoutRevenue,
    mealRevenue,
    recentPurchases,
    refundRate: Math.round(refundRate * 10) / 10,
    arpu: Math.round(arpu),
  };

  // --- Revenue Trend (30 days) ---
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const trendMap = new Map<string, { dateStr: string; Workout: number; Meal: number }>();
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = `${d.toLocaleString('default', { month: 'short' })} ${d.getDate()}`;
    trendMap.set(d.toISOString().split('T')[0], { dateStr, Workout: 0, Meal: 0 });
  }

  successfulTransactions.forEach(t => {
    if (t.date >= thirtyDaysAgo) {
      const key = t.date.toISOString().split('T')[0];
      if (trendMap.has(key)) {
        const entry = trendMap.get(key)!;
        if (t.type === 'Workout') entry.Workout += t.amount;
        if (t.type === 'Meal') entry.Meal += t.amount;
      }
    }
  });
  const trendData: RevenueTrendItem[] = Array.from(trendMap.values());

  // --- Package Breakdown ---
  const packageMap = new Map<string, number>();
  successfulTransactions.forEach(t => {
    const label = t.packageLabel;
    packageMap.set(label, (packageMap.get(label) || 0) + t.amount);
  });
  const packageBreakdown: PackageBreakdownItem[] = Array.from(packageMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // --- Payment Status Distribution ---
  const statusMap = new Map<string, number>();
  transactions.forEach(t => {
    const s = t.status.charAt(0).toUpperCase() + t.status.slice(1);
    statusMap.set(s, (statusMap.get(s) || 0) + 1);
  });
  const paymentStatus: PaymentStatusItem[] = Array.from(statusMap.entries())
    .map(([status, count]) => ({ status, count }))
    .sort((a, b) => b.count - a.count);

  return {
    kpis,
    trendData,
    packageBreakdown,
    paymentStatus,
    recentTransactions,
  };
}
