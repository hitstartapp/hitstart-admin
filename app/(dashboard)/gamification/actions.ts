'use server';

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function fetchTableDataFromDb(tableDbName: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  let query = supabase.from(tableDbName).select('*');
  
  if (tableDbName === 'Rank') {
    query = query.order('xp_range_from', { ascending: true });
  } else if (tableDbName === 'LevelMapping') {
    query = query.order('level', { ascending: true });
  } else if (tableDbName === 'Badge') {
    query = query.order('level', { ascending: true });
  } else {
    query = query.order('id', { ascending: true });
  }

  const { data, error } = await query;
  if (error) {
    console.error(`Error fetching from ${tableDbName}:`, error);
    return [];
  }
  return data || [];
}

export async function fetchSingleRecordFromDb(tableDbName: string, recordId: string | number) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from(tableDbName)
    .select('*')
    .eq('id', recordId)
    .single();

  if (error) {
    console.error(`Error fetching single record from ${tableDbName}:`, error);
    return null;
  }
  return data;
}

export async function fetchBadgeOptions(): Promise<{ label: string; value: number }[]> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase.from('Badge').select('id, name').order('id', { ascending: true });
  if (error) {
    console.error('Error fetching badge options:', error);
    return [];
  }
  return data ? data.map(b => ({ label: `${b.id} - ${b.name}`, value: b.id })) : [];
}

export async function deleteRecordFromDb(tableDbName: string, recordId: string | number) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { error } = await supabase.from(tableDbName).delete().eq('id', recordId);
  if (error) {
    console.error(`Error deleting from ${tableDbName}:`, error);
    throw error;
  }
  revalidatePath('/gamification');
  return true;
}

export async function saveRecordToDb(tableDbName: string, data: any, recordId?: string | number) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  if (recordId) {
    const { error } = await supabase
      .from(tableDbName)
      .update(data)
      .eq('id', recordId);
    if (error) {
      console.error(`Error updating ${tableDbName}:`, error);
      throw error;
    }
  } else {
    const { error } = await supabase
      .from(tableDbName)
      .insert(data);
    if (error) {
      console.error(`Error inserting into ${tableDbName}:`, error);
      throw error;
    }
  }
  revalidatePath('/gamification');
  return true;
}
