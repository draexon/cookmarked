import { SVGProps } from 'react';

export default function Logo({ className, ...props }: SVGProps<SVGSVGElement> & { className?: string }) {
  return (
    <svg
      width="48"
      height="64"
      viewBox="0 0 48 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Premium tactile bookmark base with drop shadow */}
      <filter id="shadow" x="-5" y="-5" width="58" height="74" filterUnits="userSpaceOnUse">
        <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#9d4300" floodOpacity="0.15" />
      </filter>
      
      <path
        d="M6 2C3.79086 2 2 3.79086 2 6V58C2 60.5652 4.41434 62.115 6.56455 60.7139L24 49.3409L41.4355 60.7139C43.5857 62.115 46 60.5652 46 58V6C46 3.79086 44.2091 2 42 2H6Z"
        fill="url(#bookmark-gradient)"
        filter="url(#shadow)"
      />
      
      {/* Star Sparks inside bookmark */}
      <path
        d="M34 14C34 16.5 32 18.5 29.5 18.5C32 18.5 34 20.5 34 23C34 20.5 36 18.5 38.5 18.5C36 18.5 34 16.5 34 14Z"
        fill="#FFFFFF"
      />
      <path
        d="M23 23C23 24.5 21.8 25.7 20.3 25.7C21.8 25.7 23 26.9 23 28.4C23 26.9 24.2 25.7 25.7 25.7C24.2 25.7 23 24.5 23 23Z"
        fill="#FFFFFF"
        opacity="0.85"
      />

      <defs>
        <linearGradient id="bookmark-gradient" x1="24" y1="2" x2="24" y2="61" gradientUnits="userSpaceOnUse">
          <stop stopColor="#f97316" />
          <stop offset="1" stopColor="#9d4300" />
        </linearGradient>
      </defs>
    </svg>
  );
}
