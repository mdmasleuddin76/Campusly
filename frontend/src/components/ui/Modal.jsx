import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";

// Centered dialog with a blurred backdrop. Closes on Esc or backdrop click.
export default function Modal({ open, onClose, title, subtitle, children, size = "md" }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const widths = { sm: "max-w-md", md: "max-w-xl", lg: "max-w-4xl" };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center p-0 sm:items-center sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-forest-950/45 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 340, damping: 30 }}
            className={`relative max-h-[92vh] w-full overflow-y-auto rounded-t-[2rem] bg-cream-100 shadow-lift sm:rounded-[2rem] ${widths[size]}`}
          >
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-cream-300 bg-cream-100/95 px-7 py-5 backdrop-blur">
              <div>
                <h2 className="text-2xl font-bold">{title}</h2>
                {subtitle && <p className="mt-1 text-sm text-forest-500">{subtitle}</p>}
              </div>
              <button
                onClick={onClose}
                className="grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-full bg-cream-200 text-forest-700 transition hover:rotate-90 hover:bg-forest-800 hover:text-cream-100"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="px-7 py-6">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
