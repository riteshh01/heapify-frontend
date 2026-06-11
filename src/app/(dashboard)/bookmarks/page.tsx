/**
 * Bookmarks Page — 2010s design system
 */

import { EmptyState } from "@/components/common/EmptyState";

export default function BookmarksPage() {
  const bookmarks: any[] = [];

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#1e293b] dark:text-[#f8fafc]">Bookmarks</h1>
        <p className="text-[#64748b] dark:text-[#94a3b8] mt-2 text-sm">Save and revisit your favorite problems</p>
      </div>

      {bookmarks.length === 0 ? (
        <EmptyState
          icon="🔖"
          title="No bookmarks yet"
          description="Start bookmarking problems to save them for later"
          action={{ label: "Start Learning", onClick: () => {} }}
        />
      ) : (
        <div className="space-y-4">
          {/* Bookmarks will be rendered here */}
        </div>
      )}
    </div>
  );
}
