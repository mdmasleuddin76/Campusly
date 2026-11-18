import { motion } from "motion/react";

export default function EmptyState({ icon: Icon, title, text, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center rounded-[2rem] border-2 border-dashed border-cream-400 bg-cream-50/60 px-6 py-16 text-center"
    >
      <motion.div
        animate={{ y: [0, -8, 0], rotate: [0, -4, 4, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="grid h-20 w-20 place-items-center rounded-3xl bg-forest-800 text-cream-100 shadow-lift"
      >
        <Icon className="h-9 w-9" />
      </motion.div>
      <h3 className="mt-6 text-2xl font-bold">{title}</h3>
      {text && <p className="mt-2 max-w-sm text-forest-500">{text}</p>}
      {children && <div className="mt-6">{children}</div>}
    </motion.div>
  );
}
