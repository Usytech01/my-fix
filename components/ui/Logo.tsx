export function Logo({ size = 40 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      className="rounded-xl shadow-lg shadow-forest/30"
      aria-hidden
    >
      <rect x="0" y="0" width="120" height="120" rx="28" fill="#1A6B3A" />
      <polygon
        points="60,14 102,44 102,96 18,96 18,44"
        fill="none"
        stroke="#ffffff"
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <polygon points="60,14 102,44 60,44" fill="#D4A017" />
      <rect x="46" y="66" width="28" height="30" rx="3" fill="#ffffff" />
      <rect x="52" y="72" width="8" height="10" rx="2" fill="#1A6B3A" />
      <rect x="64" y="72" width="8" height="10" rx="2" fill="#1A6B3A" />
      <g transform="translate(88, 76)">
        <rect
          x="0"
          y="0"
          width="34"
          height="8"
          rx="4"
          fill="#D4A017"
          transform="rotate(-45)"
        />
      </g>
    </svg>
  );
}
