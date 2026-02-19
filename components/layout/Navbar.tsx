"use client";

import { getCurrentUser, signOut } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [email, setEmail] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    getCurrentUser().then(({ user }) => {
      if (user) {
        setEmail(user.email ?? null);
        setAvatarUrl(user.user_metadata.avatar_url || null);
      }
    });
  }, []);

  async function handleSignOut() {
    await signOut();
    router.replace("/login");
  }

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <svg
          className="w-5 h-5 text-gray-800"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
          />
        </svg>
        <span className="font-semibold text-lg text-gray-900">
          Smart Bookmark
        </span>
      </div>

      <div className="flex items-center gap-4">
        {avatarUrl && (
          <img
            src={avatarUrl}
            alt="User Avatar"
            // this is needed to prevent the browser from sending the referrer header, which can cause issues with some image hosting services as referrer headers can be blocked or cause CORS issues and referrer headers contain the page origin
            referrerPolicy="no-referrer"
            className="w-8 h-8 rounded-full object-cover"
          />
        )}

        {email && (
          <span className="text-sm text-gray-600">{email}</span>
        )}
        <button
          onClick={handleSignOut}
          className="text-gray-500 hover:text-gray-900 transition cursor-pointer"
          title="Sign out"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
        </button>
      </div>
    </nav>
  );
}
