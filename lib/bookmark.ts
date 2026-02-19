import { getCurrentUser } from "./auth";
import { supabase } from "./supabase";

export async function createBookmark(title: string, url: string) {
    const { user } = await getCurrentUser();

    if (!user) {
        throw new Error("User not authenticated");
    }

    return supabase.from("bookmarks").insert({
        title,
        url,
        user_id: user.id,
    });
}

export async function getBookmarks() {
    const { user } = await getCurrentUser();
    if (!user) return { data: [], error: null };

    return supabase
            .from("bookmarks")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });
}

export async function deleteBookmark(id: string) {
    const { user } = await getCurrentUser();

    if (!user) {
        throw new Error("User not authenticated");
    }

    return supabase.from("bookmarks").delete().eq("id", id).eq("user_id", user.id);
}
