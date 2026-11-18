import { LoaderCircle } from "lucide-react";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-300 " +
  "disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 cursor-pointer select-none";

const variants = {
  primary:
    "bg-hotpink-500 text-white shadow-glow hover:bg-hotpink-600 hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-8px_rgb(255_62_165/0.6)] active:translate-y-0",
  dark: "bg-forest-800 text-cream-100 shadow-soft hover:bg-forest-700 hover:-translate-y-0.5 active:translate-y-0",
  outline:
    "border-2 border-forest-800 text-forest-800 hover:bg-forest-800 hover:text-cream-100 active:scale-[0.98]",
  light: "bg-cream-100 text-forest-800 hover:bg-white hover:-translate-y-0.5 shadow-soft",
  ghost: "text-forest-700 hover:bg-forest-800/5",
};

const sizes = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-sm",
  lg: "px-7 py-3.5 text-base",
};

// Use buttonClass() on a <Link> to make it look like a button
export const buttonClass = (variant = "primary", size = "md", extra = "") =>
  `${base} ${variants[variant]} ${sizes[size]} ${extra}`;

export default function Button({ variant = "primary", size = "md", loading, className = "", children, ...props }) {
  return (
    <button className={buttonClass(variant, size, className)} disabled={loading || props.disabled} {...props}>
      {loading && <LoaderCircle className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}
