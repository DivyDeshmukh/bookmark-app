import { supabase } from "./supabase";

export async function signInWithGoogle() {
    return supabase.auth.signInWithOAuth({
        provider: "google",
    });
}

export async function signOut() {
    return supabase.auth.signOut();
}

export async function getCurrentUser() {
    const { data } = await supabase.auth.getUser();
    return data;
}
