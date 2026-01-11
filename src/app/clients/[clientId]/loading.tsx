

export default function Loading() {
  // A simple, centered spinner or loading message
  return (
    <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: '#F7F7F7' }}>
      <div className="flex flex-col items-center text-gray-600">
        {/* Placeholder for a spinner/animation */}
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-deep-navy mb-3" />
        <p>Loading client profile...</p>
      </div>
    </div>
  );
}