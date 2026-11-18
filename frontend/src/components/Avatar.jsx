import { initials } from "../utils/format";

// Initials avatar. Students = forest, recruiters = pink, TPO = cream
export default function Avatar({ name, role, size = "md" }) {
  const sizes = { sm: "h-9 w-9 text-sm rounded-xl", md: "h-12 w-12 text-lg rounded-2xl", lg: "h-16 w-16 text-2xl rounded-3xl" };
  const colors = {
    STUDENT: "bg-forest-800 text-cream-100",
    RECRUITER: "bg-hotpink-500 text-white",
    TPO: "bg-cream-300 text-forest-800",
  };
  return (
    <span className={`grid shrink-0 place-items-center font-display font-bold ${sizes[size]} ${colors[role] || colors.TPO}`}>
      {initials(name) || "?"}
    </span>
  );
}
