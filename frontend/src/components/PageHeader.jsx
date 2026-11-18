import { motion } from "motion/react";

export default function PageHeader({ eyebrow, title, accent, subtitle, children }) {
  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        {eyebrow && (
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-hotpink-600">
            <span className="h-1.5 w-1.5 rounded-full bg-hotpink-500" />
            {eyebrow}
          </p>
        )}
        <h1 className="mt-3 text-4xl font-bold leading-tight sm:text-5xl">
          {title} {accent && <span className="italic text-hotpink-500">{accent}</span>}
        </h1>
        {subtitle && <p className="mt-3 max-w-xl text-forest-500">{subtitle}</p>}
      </motion.div>
      {children && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
          {children}
        </motion.div>
      )}
    </div>
  );
}
