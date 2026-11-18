import { motion } from "motion/react";
import { BadgeCheck, Briefcase, Send } from "lucide-react";
import Logo from "./Logo";
import RotatingBadge from "./RotatingBadge";
import { SITE } from "../config/site";

// Split-screen layout for login and sign-up: brand panel on the left, form on the right
export default function AuthShell({ title, accent, subtitle, children }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      {/* Brand panel */}
      <aside className="relative hidden overflow-hidden bg-forest-800 p-12 text-cream-100 lg:flex lg:flex-col">
        <div className="pointer-events-none absolute -left-24 bottom-0 h-96 w-96 rounded-full bg-hotpink-500/25 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-0 h-full w-full bg-dots-light opacity-60" />

        <div className="relative">
          <Logo light />
        </div>

        <div className="relative my-auto max-w-md">
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-5xl font-bold leading-[1.05] text-cream-100"
          >
            Placement season, <span className="italic text-hotpink-400">minus the chaos.</span>
          </motion.h2>
          <p className="mt-5 text-cream-300/80">
            {SITE.cellName}, {SITE.collegeName}
          </p>

          {/* Floating status cards */}
          <div className="relative mt-14 h-56">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0, y: [0, -8, 0] }}
              transition={{ opacity: { delay: 0.4 }, x: { delay: 0.4 }, y: { duration: 5, repeat: Infinity, ease: "easeInOut" } }}
              className="absolute left-0 top-0 flex items-center gap-3 rounded-2xl bg-cream-100 px-4 py-3 text-forest-800 shadow-lift"
            >
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-forest-800 text-cream-100">
                <Briefcase className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold">New drive approved</p>
                <p className="text-xs text-forest-500">Open for applications</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0, y: [0, 10, 0] }}
              transition={{ opacity: { delay: 0.6 }, x: { delay: 0.6 }, y: { duration: 6, repeat: Infinity, ease: "easeInOut" } }}
              className="absolute right-4 top-20 flex items-center gap-3 rounded-2xl bg-hotpink-500 px-4 py-3 text-white shadow-glow"
            >
              <BadgeCheck className="h-6 w-6" />
              <div>
                <p className="text-sm font-semibold">You're shortlisted!</p>
                <p className="text-xs text-white/80">Round 1 on Monday</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: [0, -6, 0] }}
              transition={{ opacity: { delay: 0.8 }, y: { duration: 4.5, repeat: Infinity, ease: "easeInOut" } }}
              className="absolute bottom-0 left-10 flex items-center gap-3 rounded-2xl border border-cream-100/15 bg-forest-700/80 px-4 py-3 backdrop-blur"
            >
              <Send className="h-5 w-5 text-hotpink-400" />
              <p className="text-sm font-medium">Application sent · resume link attached</p>
            </motion.div>
          </div>
        </div>

        <RotatingBadge text="CAMPUSLY • PLACEMENTS • " className="absolute bottom-10 right-10" />
      </aside>

      {/* Form side */}
      <main className="relative flex flex-col bg-cream-200 bg-dots">
        <div className="p-6 lg:hidden">
          <Logo />
        </div>
        <div className="flex flex-1 items-center justify-center px-5 py-10 sm:px-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-lg"
          >
            <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
              {title} {accent && <span className="italic text-hotpink-500">{accent}</span>}
            </h1>
            {subtitle && <p className="mt-3 text-forest-500">{subtitle}</p>}
            <div className="mt-8">{children}</div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
