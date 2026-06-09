/**
 * Auth Route Group Layout
 * Wraps all auth pages (login, signup, password reset, etc.)
 */

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600">Heapify</h1>
          <p className="text-gray-600 mt-2">Master your interviews</p>
        </div>
        {children}
      </div>
    </div>
  );
}
