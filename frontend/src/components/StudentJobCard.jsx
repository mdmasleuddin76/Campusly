import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowUpRight, CircleCheck, Hourglass } from "lucide-react";
import JobMeta from "./JobMeta";
import { daysLeft, deadlineText, initials, timeAgo } from "../utils/format";

// A job as students see it in lists
export default function StudentJobCard({ job, index = 0, compact = false }) {
  const left = daysLeft(job.deadline);
  const urgent = left !== null && left >= 0 && left <= 3;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0, transition: { delay: Math.min(index, 8) * 0.05 } }}
      exit={{ opacity: 0, scale: 0.94 }}
      whileHover={{ y: -6 }}
      className="h-full"
    >
      <Link
        to={`/student/jobs/${job._id}`}
        className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-cream-300 bg-cream-50 p-6 transition-shadow duration-300 hover:shadow-lift"
      >
        {job.hasApplied && (
          <span className="absolute right-0 top-0 flex items-center gap-1 rounded-bl-2xl bg-forest-800 px-3 py-1.5 text-[11px] font-semibold text-cream-100">
            <CircleCheck className="h-3.5 w-3.5 text-hotpink-400" /> Applied
          </span>
        )}

        <div className="flex items-start gap-4">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-forest-800 font-display text-xl font-bold text-cream-100 transition-all duration-300 group-hover:-rotate-6 group-hover:bg-hotpink-500">
            {initials(job.companyName)}
          </span>
          <div className="min-w-0 flex-1 pr-14">
            <h3 className="font-display text-xl font-bold leading-tight sm:text-2xl">{job.role}</h3>
            <p className="mt-0.5 text-sm font-medium text-forest-500">{job.companyName}</p>
          </div>
        </div>

        <div className="mt-5">
          <JobMeta job={{ ...job, deadline: undefined }} />
        </div>

        {!compact && job.eligibility && (
          <p className="mt-4 line-clamp-1 text-sm text-forest-600">
            <span className="font-semibold text-forest-800">Eligibility: </span>
            {job.eligibility}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between pt-6">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
              urgent ? "bg-hotpink-100 text-hotpink-700" : "bg-cream-200 text-forest-600"
            }`}
          >
            <Hourglass className={`h-3.5 w-3.5 ${urgent ? "animate-pulse" : ""}`} />
            {job.deadline ? deadlineText(job.deadline) : `Posted ${timeAgo(job.createdAt)}`}
          </span>
          <span className="grid h-10 w-10 place-items-center rounded-full bg-cream-200 text-forest-800 transition-all duration-300 group-hover:rotate-45 group-hover:bg-hotpink-500 group-hover:text-white">
            <ArrowUpRight className="h-5 w-5" />
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
