const STYLES = {
  PENDING: { cls: "bg-cream-300 text-cream-900", dot: "bg-cream-700", label: "Pending", pulse: true },
  APPROVED: { cls: "bg-forest-100 text-forest-800", dot: "bg-forest-600", label: "Approved" },
  REJECTED: { cls: "bg-hotpink-100 text-hotpink-800", dot: "bg-hotpink-600", label: "Rejected" },
  APPLIED: { cls: "bg-cream-300 text-cream-900", dot: "bg-cream-700", label: "Applied" },
  SHORTLISTED: { cls: "bg-forest-800 text-cream-100", dot: "bg-hotpink-400", label: "Shortlisted" },
  NOT_SHORTLISTED: { cls: "bg-hotpink-100 text-hotpink-800", dot: "bg-hotpink-600", label: "Not shortlisted" },
  OPEN: { cls: "bg-forest-50 text-forest-700 ring-1 ring-forest-200", dot: "bg-forest-500", label: "Open", pulse: true },
  CLOSED: { cls: "bg-cream-200 text-cream-800 ring-1 ring-cream-400", dot: "bg-cream-600", label: "Closed" },
};

export default function StatusBadge({ status, className = "" }) {
  const s = STYLES[status] || STYLES.PENDING;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${s.cls} ${className}`}>
      <span className="relative flex h-1.5 w-1.5">
        {s.pulse && <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 ${s.dot}`} />}
        <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${s.dot}`} />
      </span>
      {s.label}
    </span>
  );
}
