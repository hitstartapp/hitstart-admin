'use server';

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { MealPlan, Food, Meal, MealItem, MealItemFoodMap } from '@/lib/types/database';

export async function fetchTableData(tableName: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  
  const { data, error } = await supabase.from(tableName).select('*').order('name', { ascending: true });
  if (error) {
    console.error(`Error fetching from ${tableName}:`, error);
    return [];
  }
  return data || [];
}

export async function fetchFoodOptions(): Promise<{ label: string; value: string | number }[]> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  
  const { data, error } = await supabase.from('Food').select('id, name').order('name', { ascending: true });
  if (error) {
    console.error('Error fetching food options:', error);
    return [];
  }
  return data ? data.map(f => ({ label: f.name, value: f.id })) : [];
}

export async function fetchSingleRecord(tableName: string, primaryKeyField: string, recordId: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from(tableName)
    .select('*')
    .eq(primaryKeyField, recordId)
    .single();

  if (error) {
    console.error(`Error fetching record from ${tableName}:`, error);
    return null;
  }
  return data;
}

export async function saveRecord(tableName: string, primaryKeyField: string, submissionData: any, recordId?: string | null) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  let result;
  if (recordId) {
    result = await supabase.from(tableName).update(submissionData).eq(primaryKeyField, recordId).select().single();
  } else {
    result = await supabase.from(tableName).insert([submissionData]).select().single();
  }

  if (result.error) {
    console.error(`Error saving to ${tableName}:`, result.error);
    return { success: false, error: result.error.message };
  }

  revalidatePath('/meal');
  return { success: true, data: result.data };
}

export async function deleteRecord(tableName: string, primaryKeyField: string, recordId: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  
  const { error } = await supabase.from(tableName).delete().eq(primaryKeyField, recordId);
  if (error) {
    console.error(`Error deleting from ${tableName}:`, error);
    return { success: false, error: error.message };
  }

  revalidatePath('/meal');
  return { success: true };
}

// ==========================================
// Meal Configuration Panel Actions
// ==========================================

export async function fetchPlanMealsWithItems(planId: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // 1. Fetch meals for this plan
  const { data: mealsData, error: mealsError } = await supabase
    .from('Meal')
    .select('*')
    .eq('meal_plan', planId)
    .order('meal_order', { ascending: true });

  if (mealsError) {
    console.error('Error fetching meals for plan:', mealsError);
    return [];
  }

  const mealsList = mealsData || [];
  if (mealsList.length === 0) return [];

  // 2. Fetch MealItemFood mappings for all meal items in these meals
  const mealIds = mealsList.map(m => m.id);
  const { data: mealItems } = await supabase
    .from('MealItem')
    .select('id, meal')
    .in('meal', mealIds);

  const mealItemIds = (mealItems || []).map(mi => mi.id);

  let foodMaps: any[] = [];
  if (mealItemIds.length > 0) {
    const { data: maps } = await supabase
      .from('MealItemFood')
      .select('*')
      .in('meal_item', mealItemIds);
    foodMaps = maps || [];
  }

  // 3. Map food items back to meals
  const mealItemToMealMap = new Map((mealItems || []).map(mi => [mi.id, mi.meal]));
  const mealToFoodsMap: Record<string, { meal_item: string; food: number | string }[]> = {};

  foodMaps.forEach(fm => {
    const mealId = mealItemToMealMap.get(fm.meal_item);
    if (mealId) {
      if (!mealToFoodsMap[mealId]) mealToFoodsMap[mealId] = [];
      mealToFoodsMap[mealId].push(fm);
    }
  });

  return mealsList.map(m => ({
    ...m,
    MealItemFood: mealToFoodsMap[m.id] || []
  }));
}

export async function saveMealSection(payload: { id?: string; meal_plan: string; name: string; display_type: string; meal_order: number }) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { id, ...dataToSave } = payload;
  let result;
  if (id) {
    result = await supabase.from('Meal').update(dataToSave).eq('id', id).select().single();
  } else {
    result = await supabase.from('Meal').insert([dataToSave]).select().single();
  }

  if (result.error) {
    console.error('Error saving meal section:', result.error);
    return { success: false, error: result.error.message };
  }

  revalidatePath('/meal');
  return { success: true, data: result.data };
}

export async function deleteMealSection(id: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase.from('Meal').delete().eq('id', id);
  if (error) {
    console.error('Error deleting meal section:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/meal');
  return { success: true };
}

export async function reorderMealSections(items: { id: string; meal_order: number }[]) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const updatePromises = items.map(item =>
    supabase.from('Meal').update({ meal_order: item.meal_order }).eq('id', item.id)
  );

  const results = await Promise.all(updatePromises);
  const hasError = results.some(r => r.error);

  if (hasError) {
    console.error('Error reordering meal sections');
    return { success: false, error: 'Failed to reorder some meal sections' };
  }

  revalidatePath('/meal');
  return { success: true };
}

export async function fetchMealItemsForMeal(mealId: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: itemsData, error: itemsError } = await supabase
    .from('MealItem')
    .select('*')
    .eq('meal', mealId)
    .order('name', { ascending: true });

  if (itemsError) {
    console.error('Error fetching meal items:', itemsError);
    return [];
  }

  const items = itemsData || [];
  if (items.length === 0) return [];

  const itemIds = items.map(i => i.id);
  const { data: maps } = await supabase
    .from('MealItemFood')
    .select('*')
    .in('meal_item', itemIds);

  const foodMaps = maps || [];

  return items.map(i => ({
    ...i,
    MealItemFood: foodMaps.filter(fm => fm.meal_item === i.id)
  }));
}

export async function saveMealItemWithOptions(payload: { id?: string; meal: string; name: string; note?: string | null; foodIds: (string | number)[] }) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { id, meal, name, note, foodIds } = payload;

  let activeId = id;
  if (!id) {
    const { data: newItem, error: createError } = await supabase
      .from('MealItem')
      .insert([{ meal, name, note: note || null }])
      .select('id')
      .single();

    if (createError) {
      console.error('Error creating meal item:', createError);
      return { success: false, error: createError.message };
    }
    activeId = newItem.id;
  } else {
    const { error: updateError } = await supabase
      .from('MealItem')
      .update({ name, note: note || null })
      .eq('id', id);

    if (updateError) {
      console.error('Error updating meal item:', updateError);
      return { success: false, error: updateError.message };
    }
  }

  // Sync food mappings
  if (activeId) {
    await supabase.from('MealItemFood').delete().eq('meal_item', activeId);
    if (foodIds.length > 0) {
      const inserts = foodIds.map(fId => ({ meal_item: activeId, food: fId }));
      const { error: mapError } = await supabase.from('MealItemFood').insert(inserts);
      if (mapError) console.error('Error inserting meal food mappings:', mapError);
    }
  }

  revalidatePath('/meal');
  return { success: true, id: activeId };
}

export async function deleteMealItem(id: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Delete mapped foods first then the meal item
  await supabase.from('MealItemFood').delete().eq('meal_item', id);
  const { error } = await supabase.from('MealItem').delete().eq('id', id);

  if (error) {
    console.error('Error deleting meal item:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/meal');
  return { success: true };
}
