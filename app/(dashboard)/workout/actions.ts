'use server';

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { cache } from 'react';
import { WorkoutPlan, Exercise, ExerciseVariation, Workout, Configuration } from '@/lib/types/database';

export const fetchTableData = cache(async (tableName: string) => {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data, error } = await supabase.from(tableName).select('*');
  if (error) {
    console.error(`Error fetching from ${tableName}:`, error);
    return [];
  }
  return data || [];
});

export const fetchPackageEnumValues = cache(async (): Promise<string[]> => {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data, error } = await supabase.rpc('get_package_enum_values');
  if (error) {
    console.error('Error fetching package enum values:', error);
    return [];
  }
  return data?.map((p: any) => p.enum_value) || [];
});

// ==========================================
// Workout Plan Actions
// ==========================================

export async function saveWorkoutPlan(payload: Partial<WorkoutPlan>) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { id, ...dataToSave } = payload;
  const isNew = !id || id.startsWith('temp-');

  let result;
  if (isNew) {
    result = await supabase.from('WorkoutPlan').insert([dataToSave]).select().single();
  } else {
    result = await supabase.from('WorkoutPlan').update(dataToSave).eq('id', id).select().single();
  }

  if (result.error) {
    console.error('Error saving workout plan:', result.error);
    return { success: false, error: result.error.message };
  }

  revalidatePath('/workout');
  return { success: true, data: result.data };
}

export async function deleteWorkoutPlan(id: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase.from('WorkoutPlan').delete().eq('id', id);
  if (error) {
    console.error('Error deleting workout plan:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/workout');
  return { success: true };
}

// ==========================================
// Exercise & Variation Actions
// ==========================================

export async function fetchExercises(): Promise<Exercise[]> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data, error } = await supabase.from('Exercise').select('*').order('name');
  if (error) {
    console.error('Error fetching exercises:', error);
    return [];
  }
  return data || [];
}

export async function saveExercise(payload: Partial<Exercise>) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { id, ...dataToSave } = payload;
  const isNew = !id || id.startsWith('temp-');

  let result;
  if (isNew) {
    result = await supabase.from('Exercise').insert([dataToSave]).select().single();
  } else {
    result = await supabase.from('Exercise').update(dataToSave).eq('id', id).select().single();
  }

  if (result.error) {
    console.error('Error saving exercise:', result.error);
    return { success: false, error: result.error.message };
  }

  revalidatePath('/workout');
  return { success: true, data: result.data };
}

export async function deleteExercise(id: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase.from('Exercise').delete().eq('id', id);
  if (error) {
    console.error('Error deleting exercise:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/workout');
  return { success: true };
}

export async function fetchVariationsForExercise(exerciseId: string): Promise<ExerciseVariation[]> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data, error } = await supabase
    .from('ExerciseVariation')
    .select('*')
    .eq('exercise', exerciseId);
  if (error) {
    console.error('Error fetching variations:', error);
    return [];
  }
  return data || [];
}

export async function fetchSingleVariation(variationId: string): Promise<ExerciseVariation | null> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data, error } = await supabase
    .from('ExerciseVariation')
    .select('*')
    .eq('id', variationId)
    .single();
  if (error) {
    console.error('Error fetching single variation:', error);
    return null;
  }
  return data;
}

export async function deleteVariationById(id: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase.from('ExerciseVariation').delete().eq('id', id);
  if (error) {
    console.error('Error deleting variation:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/workout');
  return { success: true };
}

export async function saveVariation(formData: FormData) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const id = formData.get('id') as string;
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const image_storage = formData.get('image_storage') as string;
  const video_storage = formData.get('video_storage') as string;
  const exercise = formData.get('exercise') as string;
  const actionType = formData.get('actionType') as string; // 'save' | 'saveClose' | 'delete'

  const redirectUrl = `/workout?view=exercises&exerciseId=${exercise}`;

  if (actionType === 'delete') {
    if (id && id !== 'new') {
      const { error } = await supabase.from('ExerciseVariation').delete().eq('id', id);
      if (error) throw error;
    }
    revalidatePath('/workout');
    redirect(redirectUrl);
  }

  const payload = {
    name,
    description,
    image_storage: image_storage || 'placeholder.png',
    video_storage: video_storage || null,
    exercise,
  };

  let activeId = id;
  if (!id || id === 'new') {
    const { data, error } = await supabase.from('ExerciseVariation').insert([payload]).select('id').single();
    if (error) throw error;
    activeId = data.id;
  } else {
    const { error } = await supabase.from('ExerciseVariation').update(payload).eq('id', id);
    if (error) throw error;
  }

  revalidatePath('/workout');

  if (actionType === 'save') {
    redirect(`/workout?view=exercises&exerciseId=${exercise}&variationId=${activeId}&action=edit`);
  } else {
    redirect(`/workout?view=exercises&exerciseId=${exercise}&variationId=${activeId}`);
  }
}

// ==========================================
// Plan Workout Items (Config Panel) Actions
// ==========================================

export async function fetchWorkoutsForPlan(planId: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from('Workout')
    .select('*')
    .eq('workout_plan', planId)
    .order('order_of_exercise', { ascending: true });

  if (error) {
    console.error('Error fetching workouts for plan:', error);
    return [];
  }
  return data || [];
}

export async function fetchAllExerciseVariationsList() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from('ExerciseVariation')
    .select('id, name')
    .order('name');

  if (error) {
    console.error('Error fetching exercise variations:', error);
    return [];
  }
  return data || [];
}

export async function saveWorkoutItem(payload: Partial<Workout>) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { id, ...dataToSave } = payload;
  const isNew = !id;

  let result;
  if (isNew) {
    result = await supabase.from('Workout').insert([dataToSave]).select().single();
  } else {
    result = await supabase.from('Workout').update(dataToSave).eq('id', id).select().single();
  }

  if (result.error) {
    console.error('Error saving workout item:', result.error);
    return { success: false, error: result.error.message };
  }

  revalidatePath('/workout');
  return { success: true, data: result.data };
}

export async function deleteWorkoutItem(id: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase.from('Workout').delete().eq('id', id);
  if (error) {
    console.error('Error deleting workout item:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/workout');
  return { success: true };
}

export async function reorderWorkoutItems(items: { id: string; order_of_exercise: number }[]) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const updatePromises = items.map(item =>
    supabase.from('Workout').update({ order_of_exercise: item.order_of_exercise }).eq('id', item.id)
  );

  const results = await Promise.all(updatePromises);
  const hasError = results.some(r => r.error);

  if (hasError) {
    console.error('Error reordering workout items');
    return { success: false, error: 'Failed to reorder some workout items' };
  }

  revalidatePath('/workout');
  return { success: true };
}

export async function fetchConfiguration(): Promise<Configuration[]> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data, error } = await supabase.from('Configuration').select('*');
  if (error) {
    console.error('Error fetching configuration:', error);
    return [];
  }
  return data || [];
}
