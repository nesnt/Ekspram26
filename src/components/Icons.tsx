import React from "react";

// Custom SVG Icons for Scout theme (Tunas Kelapa) & other decorative elements
export const TunasKelapaIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => {
  return (
    <svg
      viewBox="0 0 100 120"
      fill="currentColor"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Abstract sleek representation of the Coconut Shoot (Tunas Kelapa) - the Indonesian Scout Emblem */}
      {/* Two symmetric leaves splitting outwards and a strong stem/root base */}
      <path
        d="M50 110 C50 110 32 95 32 75 C32 60 48 55 50 25 C52 55 68 60 68 75 C68 95 50 110 50 110 Z"
        fillRule="evenodd"
        clipRule="evenodd"
      />
      <path
        d="M50 95 C62 85 74 72 74 52 C74 32 50 10 50 10 C50 10 26 32 26 52 C26 72 38 85 50 95 Z"
        opacity="0.25"
      />
      {/* Root/Seed Coconuts at base */}
      <circle cx="50" cy="85" r="14" />
      <circle cx="38" cy="95" r="9" />
      <circle cx="62" cy="95" r="9" />
    </svg>
  );
};

export const TendaIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M19 21h1a2 2 0 0 0 1.73-1 2 2 0 0 0-.02-2l-7.73-13a2.46 2.46 0 0 0-3.96 0L2.29 18a2 2 0 0 0-.02 2A2 2 0 0 0 4 21h1" />
      <path d="M12 21V10" />
      <path d="m14 21-2-4-2 4" />
    </svg>
  );
};

export const BintangTigaIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => {
  return (
    <div className={`flex items-center gap-0.5 ${className}`}>
      <span className="text-pramuka-gold">★</span>
      <span className="text-pramuka-gold text-sm">★</span>
      <span className="text-pramuka-gold">★</span>
    </div>
  );
};
