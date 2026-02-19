import { deleteBookmark } from "@/lib/bookmark";
import { useState } from "react";
import toast from "react-hot-toast";

type Bookmark = {
  id: string;
  title: string | null;
  url: string;
  user_id: string;
  created_at: string | null;
};

function formatDate(dateString: string | null) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

export default function BookmarkList({ bookmarks, setBookmarks, loadBookmarks }: {
  bookmarks: Bookmark[];
  setBookmarks: React.Dispatch<React.SetStateAction<Bookmark[]>>;
  loadBookmarks: () => void;
}) {

  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    setDeletingId(id);
    // Optimistic Update: remove immediately from UI
    setBookmarks(prev => prev.filter(b => b.id !== id));
    toast.success("Bookmark deleted!");

    const { error } = await deleteBookmark(id);
    if (error) {
      // Rollback on failure
      loadBookmarks();
      toast.error("Failed to delete bookmark. Please try again.");
    }
    setDeletingId(null);
    // On success: realtime DELETE event will fire so already handled via WS subscription, no need to do anything here
  }

  return (
    <div>
      {bookmarks.map((b: any) => (
        <div
          key={b.id}
          className="border border-gray-200 bg-white p-4 mb-3 rounded-2xl shadow-sm"
        >
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-gray-900">{b.title}</h3>
            <button
              onClick={() => handleDelete(b.id)}
              disabled={deletingId === b.id}
              className="text-gray-300 hover:text-red-400 transition shrink-0 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              title="Delete"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-1 mt-1">
            <svg
              className="w-3.5 h-3.5 text-gray-400 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
            <a
              href={b.url}
              target="_blank"
              rel="noreferrer"
              className="text-blue-500 text-sm hover:underline truncate"
            >
              {b.url}
            </a>
          </div>

          <p className="text-orange-500 text-sm mt-1">
            {formatDate(b.created_at)}
          </p>
        </div>
      ))}
    </div>
  );
}
