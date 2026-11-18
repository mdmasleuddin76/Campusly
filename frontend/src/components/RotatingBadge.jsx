import { Sparkles } from "lucide-react";

// Circular spinning text badge (like a sticker)
export default function RotatingBadge({ text = "NOW HIRING • NOW HIRING • ", className = "" }) {
  return (
    <div className={`relative grid h-32 w-32 place-items-center rounded-full bg-hotpink-500 shadow-glow ${className}`}>
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full animate-spin-slow">
        <defs>
          <path id="badge-circle" d="M50,50 m-37,0 a37,37 0 1,1 74,0 a37,37 0 1,1 -74,0" />
        </defs>
        <text fill="white" fontSize="10.5" fontWeight="700" letterSpacing="2.2">
          <textPath href="#badge-circle">{text}</textPath>
        </text>
      </svg>
      <Sparkles className="h-8 w-8 text-white" />
    </div>
  );
}
