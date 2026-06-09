/**
 * Navbar component
 * Top navigation bar with branding and user menu
 */

export function Navbar() {
  return (
    <nav className="border-b bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-blue-600">Heapify</h1>
          </div>
          {/* TODO: Add user menu, notifications, theme toggle */}
        </div>
      </div>
    </nav>
  );
}
