import { BookOpen, Building2, CalendarDays, Globe, IdCard, Mail, Phone, Star, UserRound } from "lucide-react";

function Chip({ icon: Icon, label, value, href }) {
  const content = (
    <>
      <Icon className="h-4 w-4 shrink-0 text-forest-400" />
      <span className="min-w-0">
        <span className="block text-[10px] font-semibold uppercase tracking-wider text-forest-400">{label}</span>
        <span className={`block truncate text-sm font-semibold ${href ? "text-hotpink-600 underline-offset-2 group-hover:underline" : "text-forest-800"}`}>
          {value || "—"}
        </span>
      </span>
    </>
  );
  const cls = "group flex items-center gap-2.5 rounded-2xl bg-cream-100 px-3 py-2.5";
  return href && value ? (
    <a href={href} target="_blank" rel="noreferrer" className={`${cls} transition hover:bg-hotpink-50`}>
      {content}
    </a>
  ) : (
    <div className={cls}>{content}</div>
  );
}

// The key details of a student or recruiter as a grid of chips
export default function UserInfo({ user, full = false }) {
  if (user.role === "STUDENT") {
    const s = user.student || {};
    return (
      <div className="grid grid-cols-2 gap-2">
        <Chip icon={IdCard} label="Roll no." value={s.rollNo} />
        <Chip icon={BookOpen} label="Department" value={s.department} />
        <Chip icon={Star} label="CGPA" value={s.cgpa?.toFixed ? s.cgpa.toFixed(2) : s.cgpa} />
        <Chip icon={CalendarDays} label="Graduating" value={s.graduationYear} />
        {full && <Chip icon={Mail} label="Email" value={user.email} href={`mailto:${user.email}`} />}
        {full && <Chip icon={Phone} label="Phone" value={user.phone} />}
      </div>
    );
  }

  const r = user.recruiter || {};
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <Chip icon={Building2} label="Company" value={r.companyName} />
        <Chip icon={UserRound} label="Designation" value={r.designation} />
        <div className="col-span-2">
          <Chip icon={Globe} label="Website" value={r.companyWebsite?.replace(/^https?:\/\//, "")} href={r.companyWebsite} />
        </div>
        {full && <Chip icon={Mail} label="Email" value={user.email} href={`mailto:${user.email}`} />}
        {full && <Chip icon={Phone} label="Phone" value={user.phone} />}
      </div>
      {r.companyDescription && (
        <p className={`rounded-2xl bg-cream-100 px-3 py-2.5 text-sm text-forest-600 ${full ? "" : "line-clamp-2"}`}>
          {r.companyDescription}
        </p>
      )}
    </div>
  );
}
