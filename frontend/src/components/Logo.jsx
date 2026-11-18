import { Link } from "react-router-dom";

export default function Logo({ light = false }) {
  return (
    <Link to="/" className="group inline-flex items-center gap-2.5" aria-label="Campusly home">
      <span
        className={`relative grid h-10 w-10 place-items-center rounded-2xl font-display text-2xl font-bold italic transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105 ${
          light ? "bg-cream-100 text-forest-800" : "bg-forest-800 text-cream-100"
        }`}
      >
        c
        <span
          className={`absolute -right-1 -top-1 h-3.5 w-3.5 rounded-full bg-hotpink-500 ring-[3px] ${
            light ? "ring-forest-800" : "ring-cream-200"
          }`}
        />
      </span>
      <span className={`font-display text-2xl font-bold tracking-tight ${light ? "text-cream-100" : "text-forest-800"}`}>
        campusly
      </span>
    </Link>
  );
}
