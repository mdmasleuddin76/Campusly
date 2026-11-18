import { motion } from "motion/react";

// Animated pill tabs. tabs: [{ key, label, count?, icon? }]
export default function Tabs({ tabs, value, onChange, id = "tabs" }) {
  return (
    <div className="inline-flex flex-wrap gap-1 rounded-2xl border border-cream-300 bg-cream-100 p-1.5">
      {tabs.map((t) => {
        const active = value === t.key;
        return (
          <button
            key={t.key}
            type="button"
            onClick={() => onChange(t.key)}
            className={`relative flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
              active ? "text-cream-100" : "text-forest-600 hover:text-forest-900"
            }`}
          >
            {active && (
              <motion.span
                layoutId={`${id}-pill`}
                className="absolute inset-0 rounded-xl bg-forest-800 shadow-soft"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            {t.icon && <t.icon className="relative h-4 w-4" />}
            <span className="relative">{t.label}</span>
            {t.count !== undefined && (
              <span
                className={`relative min-w-6 rounded-full px-1.5 py-0.5 text-[11px] font-bold ${
                  active ? "bg-hotpink-500 text-white" : "bg-cream-300 text-forest-700"
                }`}
              >
                {t.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
