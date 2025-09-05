"use server";
import { adminRepository } from "@/dal/adminRepository";
import { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/server";

export async function isAdmin(supabase?: SupabaseClient) {
  if (!supabase) {
    supabase = await createClient();
  }

  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError) {
    return { error: authError };
  }

  try {
    const isAdmin = await adminRepository.isAdmin(auth.user.id);
    return { data: isAdmin };
  } catch (err: any) {
    return { error: err };
  }
}

export async function listUsers() {
  return await adminRepository.listUsers();
}

export async function grantAdmin(email: string) {
  return await adminRepository.grantAdmin(email);
}
