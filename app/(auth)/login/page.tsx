"use client";

import GoogleLoginButton from "@/components/auth/GoogleLoginButton";
import { getCurrentUser } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const router = useRouter();

  // If user is already logged in, redirect to home page
  useEffect(() => {
    getCurrentUser().then(({ user }) => {
      if (user) router.replace("/");
    });
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center">
      <div className="flex flex-col items-center gap-4">
        {/* App icon */}
        <div className="w-16 h-16 bg-gray-700 rounded-2xl flex items-center justify-center shadow-md">
          <svg
            className="w-8 h-8 text-white"
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
        </div>

        <h1 className="text-2xl font-bold text-gray-900">Smart Bookmark</h1>

        <p className="text-sm">
          <span className="text-blue-500">Save</span>
          <span className="text-gray-700"> and </span>
          <span className="text-orange-500">organize</span>
          <span className="text-green-500"> your </span>
          <span className="text-red-500">bookmarks</span>
        </p>

        <GoogleLoginButton />
      </div>
    </div>
  );
}
