'use server';

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { User, AccountDeletionRequest } from '@/lib/types/database';

export async function fetchUsersList(): Promise<User[]> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase.from('User').select('*').order('created_at', { ascending: false });
  if (error) {
    console.error('Error fetching users:', error);
    return [];
  }
  return data || [];
}

export async function fetchSingleUser(userId: string): Promise<User | null> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase.from('User').select('*').eq('user_id', userId).single();
  if (error) {
    console.error('Error fetching user:', error);
    return null;
  }
  return data;
}

export async function deleteUser(id: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase.from('User').delete().eq('user_id', id);
  if (error) {
    console.error('Error deleting user:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/users');
  return { success: true };
}

export async function saveUser(formData: FormData) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  
  const id = formData.get('user_id') as string;
  const action = formData.get('action') as string;

  if (action === 'delete' && id) {
    await supabase.from('User').delete().eq('user_id', id);
    revalidatePath('/users');
    redirect('/users');
  }
  
  const payload = {
    user_name: formData.get('user_name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    gender: formData.get('gender') || null,
    birth_date: formData.get('birth_date') || null,
    dietary_preference: formData.get('dietary_preference') || null,
    has_health_concerns: formData.get('has_health_concerns') === 'true',
    health_concern_details: formData.get('health_concern_details'),
  };

  let newId = id;

  if (id) {
    await supabase.from('User').update(payload).eq('user_id', id);
  } else {
    const { data } = await supabase.from('User').insert([payload]).select().single();
    if (data) {
      newId = data.user_id;
    }
  }

  revalidatePath('/users');

  if (action === 'save_and_close') {
    if (newId) {
      redirect(`/users?userId=${newId}`);
    } else {
      redirect('/users');
    }
  } else if (action === 'save') {
    if (!id && newId) {
      redirect(`/users?action=edit&userId=${newId}`);
    }
  } else {
    if (newId) {
      redirect(`/users?userId=${newId}`);
    } else {
      redirect('/users');
    }
  }
}

export async function getAccountDeletionRequests(): Promise<AccountDeletionRequest[]> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  
  const { data: requests, error: requestsError } = await supabase
    .from('AccountDeletionRequest')
    .select('*')
    .order('requested_at', { ascending: false });
  
  if (requestsError) {
    console.error('Error fetching account deletion requests:', requestsError);
    return [];
  }
  
  if (!requests || requests.length === 0) {
    return [];
  }

  // Fetch users corresponding to these requests
  const userIds = requests.map(req => req.user_id).filter(Boolean);
  
  if (userIds.length > 0) {
    const { data: users, error: usersError } = await supabase
      .from('User')
      .select('user_id, user_name, email')
      .in('user_id', userIds);
      
    if (!usersError && users) {
      const userMap = new Map(users.map(u => [u.user_id, u]));
      
      for (const req of requests) {
        req.user = userMap.get(req.user_id) || null;
        (req as any).User = req.user;
      }
    }
  }

  return requests;
}

export async function rejectAccountDeletionRequest(id: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  
  const { error } = await supabase
    .from('AccountDeletionRequest')
    .update({ 
      status: 'rejected',
      processed_at: new Date().toISOString()
    })
    .eq('id', id);

  if (error) {
    console.error('Error rejecting account deletion request:', error);
  }
  
  revalidatePath('/users');
  redirect('/users?tab=deletion-requests');
}

export async function approveAccountDeletionRequest(id: string, userId: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  
  const { error } = await supabase
    .from('User')
    .delete()
    .eq('user_id', userId);

  if (error) {
    console.error('Error deleting user:', error);
  } else {
    await supabase.from('AccountDeletionRequest').delete().eq('id', id);
  }
  
  revalidatePath('/users');
  redirect('/users?tab=deletion-requests');
}
