/**
 * Bookmarks Page
 */

import { Card, CardBody } from "@/components/ui/Card";
import { EmptyState } from "@/components/common/EmptyState";

export default function BookmarksPage() {
  const bookmarks = [];

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Bookmarks</h1>
        <p className="text-gray-600 mt-2">Save and revisit your favorite problems</p>
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
