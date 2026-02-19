## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

# Smart Bookmark

A personal bookmark manager with real-time sync across browser tabs, built with Next.js and Supabase.

## Features

- Google OAuth sign-in — no email/password
- Add and delete bookmarks (title + URL)
- Bookmarks are private to each user
- Real-time list updates across tabs without page refresh

## Tech Stack

- **Next.js 16** — App Router, client components
- **Supabase** — PostgreSQL database, Google OAuth, Realtime WebSocket
- **Tailwind CSS v4** — Styling
- **react-hook-form + Zod v4** — Form validation with inline error messages
- **react-hot-toast** — Toast notifications

## Architecture Decisions

### Supabase Realtime over polling

* The app subscribes to Supabase's postgres_changes WebSocket channel instead of polling on an interval. This gives instant updates across tabs with no wasted network requests. INSERT, UPDATE, and DELETE events all update state directly without a full refetch.

### User-scoped Realtime subscription

* I filtered Realtime events using user_id=eq.${userId} so each user only receives their own updates. Along with RLS (Row Level Security) policies at the database level, this ensures proper data privacy.

### Optimistic UI for delete only

* Delete applies an optimistic update immediately — the item is removed from state before the API call completes — with a full rollback via refetch if the call fails. Insert intentionally skips optimistic UI because the Realtime INSERT event would add the same item a second time, causing a duplicate. The WS round-trip is fast enough that the slight delay on insert is acceptable.

### Two-layer security

* I filtered bookmarks by user_id on the client side and also enforced RLS policies using auth.uid() at the database level. This ensures data isolation even if client checks fail.

### Form validation

* I used React Hook Form with Zod schema validation to ensure bookmark fields are validated properly before submission.

## Problems & How I Solved Them

### Google OAuth + Supabase integration

* Setting up Google OAuth required configuring the consent screen in Google Cloud Console, adding the correct Supabase callback URL as an authorized redirect URI, and ensuring the auth session was read correctly on the client. The fix was precisely aligning the redirect URI in both Google Cloud and Supabase's Auth settings, and using supabase.auth.getUser() rather than getSession() to reliably retrieve the authenticated user.

### RLS + linking auth users to bookmarks

* Supabase's auth.users table lives outside the public schema, so linking it to the bookmarks table required storing auth.uid() in a user_id column. RLS policies were then written to compare user_id against auth.uid() for SELECT, INSERT, and DELETE, ensuring each user can only access their own rows. Getting the schema and auth alignment right took iteration between the table structure and the policy expressions.

### Realtime + optimistic delete handling

* Realtime INSERT processing that adds a new bookmark The app removes a bookmark optimistically on delete and also has a Realtime WebSocket handler that reacts to DELETE events from Supabase. Both paths call setBookmarks(prev => prev.filter(...)). This was identified as redundant but intentionally left in place — filtering out an already-absent item is a no-op, so the WS event simply acts as a silent server-side confirmation with no side effects.

### Loading spinner stuck on errors

* Initially when I created loadBookmarks it had no error branch and also other components were missing essential UI error handling. If getBookmarks() failed due to a network or auth issue, isLoading stayed true and the spinner never resolved. Fixed by checking res.error and setting a separate fetchError state, which renders an error message to the user instead of an infinite spinner.
