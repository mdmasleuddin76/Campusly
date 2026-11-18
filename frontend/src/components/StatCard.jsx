import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

// Small stat tile. tone: "cream" | "forest" | "pink"
export default function StatCard({ icon: Icon, label, value, tone = "cream", to, index = 0 }) {
  const tones = {
    cream: "bg-cream-50 border border-cream-300 text-forest-800",
    forest: "bg-forest-800 text-cream-100",
    pink: "bg-hotpink-500 text-white shadow-glow",
  };
  const iconTones = {
    cream: "bg-forest-800 text-cream-100",
    forest: "bg-hotpink-500 text-white",
    pink: "bg-white/20 text-white",
  };

  const body = (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.1 + index * 0.07 }}
      whileHover={{ y: -4 }}
      className={`group relative overflow-hidden rounded-3xl p-5 transition-shadow hover:shadow-lift ${tones[tone]}`}
    >
      <div className="flex items-start justify-between">
        <span className={`grid h-11 w-11 place-items-center rounded-2xl ${iconTones[tone]}`}>
          <Icon className="h-5 w-5" />
        </span>
        {to && <ArrowUpRight className="h-5 w-5 opacity-50 transition group-hover:rotate-45 group-hover:opacity-100" />}
      </div>
      <p className="mt-5 font-display text-4xl font-bold">{value ?? "–"}</p>
      <p className={`mt-1 text-sm ${tone === "cream" ? "text-forest-500" : "opacity-80"}`}>{label}</p>
    </motion.div>
  );

  return to ? <Link to={to}>{body}</Link> : body;
}
