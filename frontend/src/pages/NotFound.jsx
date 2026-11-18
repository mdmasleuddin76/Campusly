import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { buttonClass } from "../components/ui/Button";

export default function NotFound() {
  return (
    <section className="mx-auto flex max-w-xl flex-col items-center px-5 py-28 text-center">
      <motion.p
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 14 }}
        className="font-display text-8xl font-bold italic text-hotpink-500"
      >
        404
      </motion.p>
      <h1 className="mt-4 text-4xl font-bold">This page isn't ready yet.</h1>
      <p className="mt-3 text-forest-500">It's either still being built or the link is wrong.</p>
      <Link to="/" className={buttonClass("dark", "lg", "mt-8")}>
        Back to home
      </Link>
    </section>
  );
}
