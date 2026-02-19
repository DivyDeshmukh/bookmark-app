'use client';

import BookmarkForm from "@/components/bookmark/BookmarkForm";
import BookmarkList from "@/components/bookmark/BookmarkList";
import { getCurrentUser } from "@/lib/auth";
import { getBookmarks } from "@/lib/bookmark";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

type Bookmark = {
    id: string;
    title: string | null;
    url: string;
    user_id: string;
    created_at: string | null;
};

export default function Dashboard() {
    const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
    const [userId, setUserId] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [fetchError, setFetchError] = useState(false);

    function loadBookmarks() {
        getBookmarks().then(res => {
            if (res.error) {
                setFetchError(true);
                setIsLoading(false);
                return;
            }

            setBookmarks(res.data ?? []);
            setIsLoading(false);
        });
    }

    useEffect(() => {
        getCurrentUser().then(({ user }) => {
            setUserId(user?.id || "");
        });
    }, []);

    useEffect(() => {
        if (!userId) return;

        loadBookmarks();

        // Filtered by user_id so only this user's rows trigger events
        const channel = supabase
            .channel("bookmarks-realtime")
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "bookmarks",
                    filter: `user_id=eq.${userId}`,   //  User B will never receive User A's WS events. The userId filter ensures each user's subscription is scoped to only their own rows.
                },
                (payload) => {
                    if (payload.eventType === "INSERT") {
                        setBookmarks(prev => {
                            // payload.new is the new bookmark row
                            return [...prev, payload.new as Bookmark];
                        });
                    }
                    // For DELETE, payload.old contains the deleted row's data
                    if (payload.eventType === "DELETE") {
                        setBookmarks(prev => prev.filter(b => b.id !== payload.old.id));
                    }
                    if (payload.eventType === "UPDATE") {
                        setBookmarks(prev => prev.map(b =>
                            b.id === payload.new.id ? payload.new as Bookmark : b
                        ));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId]);

    return (
        <div className="max-w-xl mx-auto py-10">
            <h1 className="text-[#E9560C] text-center mb-4 font-extrabold text-[25px]">
                Please add bookmarks here
            </h1>
            <BookmarkForm />
            {
                bookmarks.length > 0 ? (
                    <BookmarkList bookmarks={bookmarks} setBookmarks={setBookmarks} loadBookmarks={loadBookmarks} />
                ) : fetchError ? (
                    <p className="text-center text-red-400 mt-10">
                        Failed to load bookmarks. Please refresh the page.
                    </p>
                ) : isLoading ? (
                    <p className="text-center text-gray-500 mt-10">Loading bookmarks...</p>
                ) : (
                    <p className="text-center text-gray-500 mt-10">No bookmarks yet. Start by adding one above!</p>
                )
            }
        </div>
    );
}
