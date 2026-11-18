import { motion } from "motion/react";
import { Check, Eye, Send, X } from "lucide-react";

// Applied -> Under review -> Shortlisted / Not shortlisted
export default function ApplicationTracker({ status }) {
  const result = status === "SHORTLISTED" ? "good" : status === "NOT_SHORTLISTED" ? "bad" : null;

  const steps = [
    { label: "Applied", icon: Send, state: "done" },
    { label: "Under review", icon: Eye, state: result ? "done" : "current" },
    {
      label: result === "good" ? "Shortlisted" : result === "bad" ? "Not shortlisted" : "Result",
      icon: result === "bad" ? X : Check,
      state: result === "good" ? "good" : result === "bad" ? "bad" : "todo",
    },
  ];

  const circle = {
    done: "bg-forest-800 text-cream-100",
    current: "bg-cream-50 text-forest-800 ring-2 ring-forest-800",
    todo: "bg-cream-200 text-forest-300",
    good: "bg-hotpink-500 text-white shadow-glow",
    bad: "bg-hotpink-800 text-white",
  };

  return (
    <div className="flex items-start">
      {steps.map((s, i) => (
        <div key={s.label} className="flex flex-1 items-start last:flex-none">
          <div className="flex flex-col items-center">
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1 + i * 0.15, type: "spring", stiffness: 260, damping: 16 }}
              className={`relative grid h-9 w-9 place-items-center rounded-full ${circle[s.state]}`}
            >
              {s.state === "current" && <span className="absolute inset-0 animate-ping rounded-full bg-forest-400 opacity-30" />}
              <s.icon className="relative h-4 w-4" />
            </motion.span>
            <span
              className={`mt-2 w-20 text-center text-[11px] font-semibold leading-tight ${
                s.state === "good" ? "text-hotpink-600" : s.state === "bad" ? "text-hotpink-800" : s.state === "todo" ? "text-forest-300" : "text-forest-700"
              }`}
            >
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className="mx-1 mt-4 h-0.5 flex-1 overflow-hidden rounded-full bg-cream-300">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: steps[i + 1].state === "todo" ? "0%" : "100%" }}
                transition={{ delay: 0.25 + i * 0.15, duration: 0.5 }}
                className="h-full bg-forest-800"
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
