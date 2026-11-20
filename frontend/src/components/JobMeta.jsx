import { Briefcase, CalendarDays, CircleAlert, MapPin, Star, Wallet } from "lucide-react";
import { formatDate } from "../utils/format";

export const TYPE_LABEL = { FULL_TIME: "Full-time", INTERNSHIP: "Internship" };

const has = (v) => v !== undefined && v !== null && v !== "";

// "No backlogs" / "Max 1 backlog" / "Max 2 backlogs"
export const backlogText = (n) => (Number(n) === 0 ? "No backlogs" : `Max ${n} backlog${Number(n) === 1 ? "" : "s"}`);

export const deadlinePassed = (job) => job.deadline && new Date(job.deadline) < new Date();

function Chip({ icon: Icon, children, dark }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
        dark ? "bg-forest-700/70 text-cream-100" : "bg-cream-100 text-forest-700"
      }`}
    >
      <Icon className={`h-3.5 w-3.5 ${dark ? "text-hotpink-300" : "text-forest-400"}`} />
      {children}
    </span>
  );
}

// Package · location · type · CGPA / backlog limits · deadline as chips. dark = for forest backgrounds
export default function JobMeta({ job, dark = false }) {
  return (
    <div className="flex flex-wrap gap-2">
      {job.package && <Chip icon={Wallet} dark={dark}>{job.package}</Chip>}
      {job.location && <Chip icon={MapPin} dark={dark}>{job.location}</Chip>}
      {job.jobType && <Chip icon={Briefcase} dark={dark}>{TYPE_LABEL[job.jobType] || job.jobType}</Chip>}
      {has(job.minCgpa) && <Chip icon={Star} dark={dark}>CGPA {job.minCgpa}+</Chip>}
      {has(job.maxBacklogs) && <Chip icon={CircleAlert} dark={dark}>{backlogText(job.maxBacklogs)}</Chip>}
      {job.deadline && (
        <Chip icon={CalendarDays} dark={dark}>
          {deadlinePassed(job) ? "Deadline passed" : `Apply by ${formatDate(job.deadline)}`}
        </Chip>
      )}
    </div>
  );
}
