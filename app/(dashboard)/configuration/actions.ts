'use server';

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function fetchTableDataFromDb(dbName: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  
  const { data, error } = await supabase.from(dbName).select('*').order('id', { ascending: true });
  if (error) {
    console.error(`Error fetching from ${dbName}:`, error);
    return [];
  }
  
  return data || [];
}

export async function fetchSingleRecordFromDb(dbName: string, id: string | number) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase.from(dbName).select('*').eq('id', id).single();
  if (error) {
    console.error(`Error fetching from ${dbName}:`, error);
    return null;
  }
  
  return data;
}

export async function saveRecordToDb(dbName: string, id: string | number | null, submissionData: Record<string, any>) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  if (id) {
    const { error } = await supabase.from(dbName).update(submissionData).eq('id', id);
    if (error) {
      console.error(`Error updating ${dbName}:`, error);
      throw error;
    }
  } else {
    const { error } = await supabase.from(dbName).insert([submissionData]);
    if (error) {
      console.error(`Error inserting into ${dbName}:`, error);
      throw error;
    }
  }

  revalidatePath('/configuration');
  return true;
}

export async function deleteRecordFromDb(dbName: string, id: string | number) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase.from(dbName).delete().eq('id', id);
  if (error) {
    console.error(`Error deleting from ${dbName}:`, error);
    throw error;
  }

  revalidatePath('/configuration');
  return true;
}
