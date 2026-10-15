import React from 'react';

// A small wedding-gown icon (fitted top, flared skirt) in the same line style as the lucide icons.
export function GownIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M8.5 2 9 8.5 10.3 12 5 22h14l-5.3-10L15 8.5 15.5 2" />
      <path d="M8.5 2c1 3 2.2 4.2 3.5 4.2S14.5 5 15.5 2" />
      <path d="M10.3 12h3.4" />
    </svg>
  );
}
