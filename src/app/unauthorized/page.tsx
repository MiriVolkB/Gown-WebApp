// app/unauthorized/page.tsx
export default function Unauthorized() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold text-red-600">Access Denied</h1>
      <p className="text-gray-600 mt-2">
        Sorry, only the Owner can access the finances section.
      </p>
      <a href="/" className="mt-4 text-blue-500 underline">Return to Dashboard</a>
    </div>
  )
}