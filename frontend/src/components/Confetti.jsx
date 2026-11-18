import { motion } from "motion/react";

const COLORS = ["#ff3ea5", "#1e3b2f", "#f4ead5", "#ff8ac4", "#3a6a56"];

// A one-time burst of dots, for celebrating a successful action
export default function Confetti({ count = 28 }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-visible">
      {Array.from({ length: count }).map((_, i) => {
        const angle = (i / count) * Math.PI * 2;
        const distance = 90 + (i % 5) * 28;
        return (
          <motion.span
            key={i}
            initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
            animate={{
              x: Math.cos(angle) * distance,
              y: Math.sin(angle) * distance + 40,
              scale: [0, 1.2, 0.8],
              opacity: [1, 1, 0],
              rotate: i * 40,
            }}
            transition={{ duration: 1.3, ease: "easeOut" }}
            className="absolute left-1/2 top-1/2 h-2.5 w-2.5"
            style={{ background: COLORS[i % COLORS.length], borderRadius: i % 3 === 0 ? "2px" : "999px" }}
          />
        );
      })}
    </div>
  );
}
