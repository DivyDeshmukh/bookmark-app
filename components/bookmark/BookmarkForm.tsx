import { createBookmark } from "@/lib/bookmark";
import { Button } from "../layout/Button";
import Input from "../layout/Input";
import toast from "react-hot-toast";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const bookmarkSchema = z.object({
  title: z
          .string()
          .min(1, "Title is required")
          .max(100, "Title must be under 100 characters"),
  url: z
        .url("Please enter a valid URL (eg: https://example.com)"),
});

type BookmarkForm = z.infer<typeof bookmarkSchema>;

export default function BookmarkForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BookmarkForm>({
    resolver: zodResolver(bookmarkSchema)
  });

  async function onSubmit(data: BookmarkForm) {
    // Optimistic UI update: we could add the new bookmark to the list immediately here for a snappier UX, but since the real-time subscription will add it to the list as well, we can skip that step to avoid complexity of handling duplicates or rollbacks on failure. Instead, we'll just wait for the real-time event to update the UI after successful insertion.

    const { error } = await createBookmark(data.title, data.url);
    if (error) {
      toast.error("Failed to add bookmark. Please try again");
      return;
    }
    reset();
    toast.success("Bookmark added!");
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mb-4 space-y-3 p-4 border border-gray-200 rounded-2xl bg-white shadow-sm"
    >
      <div>
        <Input
          placeholder="Title"
          type="text"
          className={`placeholder:text-red-400 text-black ${errors.title ? "border-red-400 focus:border-red-400" : ""}`}
          {...register("title")}
        />
        {errors.title && (
          <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>
        )}
      </div>

      <div>
        <Input 
          placeholder="https://example.com"
          type="text"
          className={`placeholder:text-blue-400 text-blue-400 ${errors.url ? "border-red-400 focus:border-red-400" : ""}`}
          {...register("url")}
        />
        {errors.url && (
          <p className="text-red-500 text-xs mt-1">{errors.url.message}</p>
        )}
      </div>

      <Button
        className="bg-orange-500 hover:bg-orange-600 transition text-white py-3 rounded-xl w-full flex items-center justify-center gap-2 font-medium cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        type="submit"
        disabled={isSubmitting}
      >
        <span className="text-xl leading-none">+</span>
        <span>{isSubmitting ? "Adding..." : "Add Bookmark"}</span>
      </Button>
    </form>
  );
}
