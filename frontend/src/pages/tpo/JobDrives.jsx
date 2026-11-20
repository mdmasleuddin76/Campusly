import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  BadgeCheck,
  Briefcase,
  CalendarDays,
  Check,
  CircleAlert,
  ExternalLink,
  FileSearch,
  ListChecks,
  MapPin,
  RotateCcw,
  Star,
  Timer,
  Wallet,
  X,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import api, { errorMessage } from "../../api/axios";
import PageHeader from "../../components/PageHeader";
import StatCard from "../../components/StatCard";
import Avatar from "../../components/Avatar";
import Tabs from "../../components/ui/Tabs";
import SearchInput from "../../components/ui/SearchInput";
import StatusBadge from "../../components/ui/StatusBadge";
import EmptyState from "../../components/ui/EmptyState";
import { CardSkeletons } from "../../components/ui/Skeleton";
import { formatDate, initials, timeAgo } from "../../utils/format";
import { backlogText } from "../../components/JobMeta";

const TYPE_LABEL = { FULL_TIME: "Full-time", INTERNSHIP: "Internship" };

export default function JobDrives() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("PENDING");
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(null);

  useEffect(() => {
    api
      .get("/tpo/jobs")
      .then((res) => setJobs(res.data.data))
      .catch((err) => toast.error(errorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const counts = useMemo(() => {
    const c = { ALL: jobs.length, PENDING: 0, APPROVED: 0, REJECTED: 0 };
    jobs.forEach((j) => (c[j.status] += 1));
    return c;
  }, [jobs]);

  const visible = useMemo(() => {
    const q = query.toLowerCase();
    return jobs.filter(
      (j) =>
        (tab === "ALL" || j.status === tab) &&
        (!q || [j.role, j.companyName, j.location, j.recruiterId?.name].filter(Boolean).join(" ").toLowerCase().includes(q))
    );
  }, [jobs, tab, query]);

  const decide = async (job, status) => {
    setBusy(`${job._id}:${status}`);
    try {
      await api.patch(`/tpo/jobs/${job._id}/status`, { status });
      setJobs((prev) => prev.map((j) => (j._id === job._id ? { ...j, status } : j)));
      const verb = status === "APPROVED" ? "approved" : status === "REJECTED" ? "rejected" : "moved to pending";
      toast.success(`${job.role} at ${job.companyName} ${verb}`, {
        description: status === "APPROVED" ? "Students can see and apply to it now." : undefined,
      });
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(null);
    }
  };

  return (
    <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
      <PageHeader
        eyebrow="TPO dashboard"
        title="Job"
        accent="drives."
        subtitle="Recruiters' drives land here first. Only approved drives are shown to students."
      />

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Timer} label="Waiting for review" value={loading ? "…" : counts.PENDING} tone="pink" index={0} />
        <StatCard icon={BadgeCheck} label="Approved & live" value={loading ? "…" : counts.APPROVED} tone="forest" index={1} />
        <StatCard icon={XCircle} label="Rejected" value={loading ? "…" : counts.REJECTED} index={2} />
        <StatCard icon={ListChecks} label="All drives" value={loading ? "…" : counts.ALL} index={3} />
      </div>

      <div className="mt-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <Tabs
          id="drives"
          value={tab}
          onChange={setTab}
          tabs={[
            { key: "PENDING", label: "Pending", count: counts.PENDING },
            { key: "APPROVED", label: "Approved", count: counts.APPROVED },
            { key: "REJECTED", label: "Rejected", count: counts.REJECTED },
            { key: "ALL", label: "All", count: counts.ALL },
          ]}
        />
        <SearchInput value={query} onChange={setQuery} placeholder="Search role, company, location..." className="lg:w-80" />
      </div>

      <div className="mt-8">
        {loading ? (
          <CardSkeletons count={4} />
        ) : visible.length === 0 ? (
          <EmptyState
            icon={query ? FileSearch : Briefcase}
            title={query ? "No matching drives" : tab === "PENDING" ? "Nothing to review" : "No drives here yet"}
            text={
              query
                ? `No drive matches "${query}".`
                : tab === "PENDING"
                  ? "When a recruiter posts a new drive, it will show up here for you to approve."
                  : "Drives will appear here once recruiters start posting."
            }
          />
        ) : (
          <motion.div layout className="grid gap-5 lg:grid-cols-2">
            <AnimatePresence mode="popLayout">
              {visible.map((job, i) => (
                <JobCard key={job._id} job={job} index={i} busy={busy} onDecide={decide} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </section>
  );
}

function Detail({ icon: Icon, children }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-cream-100 px-3 py-1.5 text-xs font-semibold text-forest-700">
      <Icon className="h-3.5 w-3.5 text-forest-400" />
      {children}
    </span>
  );
}

function JobCard({ job, index, busy, onDecide }) {
  const [expanded, setExpanded] = useState(false);
  const recruiter = job.recruiterId || {};
  const isBusy = (s) => busy === `${job._id}:${s}`;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0, transition: { delay: Math.min(index, 8) * 0.05 } }}
      exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.25 } }}
      className="group relative flex flex-col overflow-hidden rounded-3xl border border-cream-300 bg-cream-50 transition-shadow hover:shadow-lift"
    >
      {/* coloured top edge by status */}
      <div
        className={`h-1.5 w-full ${
          job.status === "APPROVED" ? "bg-forest-700" : job.status === "REJECTED" ? "bg-hotpink-600" : "bg-cream-500"
        }`}
      />

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start gap-4">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-forest-800 font-display text-xl font-bold text-cream-100 transition-transform duration-300 group-hover:-rotate-6">
            {initials(job.companyName)}
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-2xl font-bold leading-tight">{job.role}</h3>
            <p className="mt-0.5 text-sm font-medium text-forest-500">{job.companyName}</p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1.5">
            <StatusBadge status={job.status} />
            {job.status === "APPROVED" && <StatusBadge status={job.isOpen ? "OPEN" : "CLOSED"} />}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {job.package && <Detail icon={Wallet}>{job.package}</Detail>}
          {job.location && <Detail icon={MapPin}>{job.location}</Detail>}
          <Detail icon={Briefcase}>{TYPE_LABEL[job.jobType] || job.jobType}</Detail>
          {job.minCgpa != null && <Detail icon={Star}>CGPA {job.minCgpa}+</Detail>}
          {job.maxBacklogs != null && <Detail icon={CircleAlert}>{backlogText(job.maxBacklogs)}</Detail>}
          {job.deadline && <Detail icon={CalendarDays}>Apply by {formatDate(job.deadline)}</Detail>}
        </div>

        {job.eligibility && (
          <p className="mt-4 text-sm">
            <span className="font-semibold text-forest-800">Eligibility: </span>
            <span className="text-forest-600">{job.eligibility}</span>
          </p>
        )}

        {job.description && (
          <div className="mt-3">
            <p className={`text-sm leading-relaxed text-forest-600 ${expanded ? "" : "line-clamp-2"}`}>{job.description}</p>
            {job.description.length > 140 && (
              <button
                onClick={() => setExpanded((e) => !e)}
                className="mt-1 cursor-pointer text-xs font-semibold text-hotpink-600 hover:underline"
              >
                {expanded ? "Show less" : "Read more"}
              </button>
            )}
          </div>
        )}

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-cream-100 px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar name={recruiter.name} role="RECRUITER" size="sm" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{recruiter.name || "Recruiter"}</p>
              <p className="truncate text-xs text-forest-500">
                {recruiter.email} · posted {timeAgo(job.createdAt)}
              </p>
            </div>
          </div>
          {job.jdLink && (
            <a
              href={job.jdLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full bg-cream-50 px-3 py-1.5 text-xs font-semibold text-forest-800 ring-1 ring-cream-400 transition hover:bg-forest-800 hover:text-cream-100"
            >
              View JD <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>

        {/* Actions depend on the current status */}
        <div className="mt-5 flex gap-3">
          {job.status !== "REJECTED" && (
            <button
              onClick={() => onDecide(job, "REJECTED")}
              disabled={!!busy}
              className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-full border-2 border-hotpink-200 py-2.5 text-sm font-semibold text-hotpink-700 transition hover:border-hotpink-500 hover:bg-hotpink-500 hover:text-white disabled:opacity-50"
            >
              <X className="h-4 w-4" />
              {isBusy("REJECTED") ? "Rejecting..." : job.status === "APPROVED" ? "Revoke approval" : "Reject"}
            </button>
          )}
          {job.status !== "APPROVED" && (
            <button
              onClick={() => onDecide(job, "APPROVED")}
              disabled={!!busy}
              className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-full bg-forest-800 py-2.5 text-sm font-semibold text-cream-100 shadow-soft transition hover:-translate-y-0.5 hover:bg-forest-700 disabled:opacity-50"
            >
              <Check className="h-4 w-4" /> {isBusy("APPROVED") ? "Approving..." : "Approve drive"}
            </button>
          )}
          {job.status !== "PENDING" && (
            <button
              onClick={() => onDecide(job, "PENDING")}
              disabled={!!busy}
              title="Move back to pending"
              className="grid h-11 w-11 shrink-0 cursor-pointer place-items-center rounded-full bg-cream-200 text-forest-600 transition hover:-rotate-90 hover:bg-cream-300 disabled:opacity-50"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </motion.article>
  );
}
