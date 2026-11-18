import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, BadgeCheck, Briefcase, CircleSlash, Clock, Lock, Plus, Users, XCircle } from "lucide-react";
import { toast } from "sonner";
import api, { errorMessage } from "../../api/axios";
import PageHeader from "../../components/PageHeader";
import StatCard from "../../components/StatCard";
import JobMeta from "../../components/JobMeta";
import Tabs from "../../components/ui/Tabs";
import SearchInput from "../../components/ui/SearchInput";
import StatusBadge from "../../components/ui/StatusBadge";
import EmptyState from "../../components/ui/EmptyState";
import Modal from "../../components/ui/Modal";
import Button, { buttonClass } from "../../components/ui/Button";
import { CardSkeletons } from "../../components/ui/Skeleton";
import { initials, timeAgo } from "../../utils/format";

// Which tab a job belongs to
const bucket = (j) => {
  if (j.status === "PENDING") return "PENDING";
  if (j.status === "REJECTED") return "REJECTED";
  return j.isOpen ? "LIVE" : "CLOSED";
};

export default function MyJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("ALL");
  const [query, setQuery] = useState("");
  const [toClose, setToClose] = useState(null);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    api
      .get("/recruiter/jobs")
      .then((res) => setJobs(res.data.data))
      .catch((err) => toast.error(errorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const counts = useMemo(() => {
    const c = { ALL: jobs.length, LIVE: 0, PENDING: 0, CLOSED: 0, REJECTED: 0, applicants: 0 };
    jobs.forEach((j) => {
      c[bucket(j)] += 1;
      c.applicants += j.applications?.total || 0;
    });
    return c;
  }, [jobs]);

  const visible = useMemo(() => {
    const q = query.toLowerCase();
    return jobs.filter(
      (j) => (tab === "ALL" || bucket(j) === tab) && (!q || `${j.role} ${j.location || ""}`.toLowerCase().includes(q))
    );
  }, [jobs, tab, query]);

  const closeJob = async () => {
    setClosing(true);
    try {
      await api.patch(`/recruiter/jobs/${toClose._id}/close`);
      setJobs((prev) => prev.map((j) => (j._id === toClose._id ? { ...j, isOpen: false } : j)));
      toast.success("Applications closed", { description: `${toClose.role} no longer accepts applications.` });
      setToClose(null);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setClosing(false);
    }
  };

  return (
    <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
      <PageHeader
        eyebrow="Recruiter dashboard"
        title="Your"
        accent="drives."
        subtitle="Every job you've posted, its approval status, and who has applied."
      >
        <Link to="/recruiter/jobs/new" className={buttonClass("primary", "lg", "group")}>
          <Plus className="h-5 w-5 transition group-hover:rotate-90" /> Post a job
        </Link>
      </PageHeader>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={BadgeCheck} label="Live & accepting" value={loading ? "…" : counts.LIVE} tone="forest" index={0} />
        <StatCard icon={Clock} label="Waiting for TPO" value={loading ? "…" : counts.PENDING} index={1} />
        <StatCard icon={Users} label="Total applicants" value={loading ? "…" : counts.applicants} tone="pink" index={2} />
        <StatCard icon={Briefcase} label="Drives posted" value={loading ? "…" : counts.ALL} index={3} />
      </div>

      <div className="mt-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <Tabs
          id="my-jobs"
          value={tab}
          onChange={setTab}
          tabs={[
            { key: "ALL", label: "All", count: counts.ALL },
            { key: "LIVE", label: "Live", count: counts.LIVE },
            { key: "PENDING", label: "Pending", count: counts.PENDING },
            { key: "CLOSED", label: "Closed", count: counts.CLOSED },
            { key: "REJECTED", label: "Rejected", count: counts.REJECTED },
          ]}
        />
        <SearchInput value={query} onChange={setQuery} placeholder="Search role or location..." className="lg:w-72" />
      </div>

      <div className="mt-8">
        {loading ? (
          <CardSkeletons count={4} />
        ) : jobs.length === 0 ? (
          <EmptyState icon={Briefcase} title="No drives yet" text="Post your first job. The TPO reviews it, then students can apply.">
            <Link to="/recruiter/jobs/new" className={buttonClass("primary", "md")}>
              <Plus className="h-4 w-4" /> Post a job
            </Link>
          </EmptyState>
        ) : visible.length === 0 ? (
          <EmptyState icon={Briefcase} title="Nothing here" text="No drives match this filter." />
        ) : (
          <motion.div layout className="grid gap-5 lg:grid-cols-2">
            <AnimatePresence mode="popLayout">
              {visible.map((job, i) => (
                <JobCard key={job._id} job={job} index={i} onClose={setToClose} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      <Modal open={!!toClose} onClose={() => !closing && setToClose(null)} title="Close applications?" size="sm">
        <div className="flex items-start gap-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-hotpink-100 text-hotpink-700">
            <Lock className="h-5 w-5" />
          </span>
          <p className="text-forest-600">
            Students won't be able to apply to <span className="font-semibold text-forest-800">{toClose?.role}</span> any more.
            You can still review and shortlist everyone who already applied.
          </p>
        </div>
        <div className="mt-7 flex gap-3">
          <Button variant="outline" onClick={() => setToClose(null)} disabled={closing} className="flex-1">
            Keep open
          </Button>
          <Button onClick={closeJob} loading={closing} className="flex-1">
            {!closing && <Lock className="h-4 w-4" />} Close it
          </Button>
        </div>
      </Modal>
    </section>
  );
}

function JobCard({ job, index, onClose }) {
  const a = job.applications || { total: 0, shortlisted: 0, notShortlisted: 0 };
  const pending = a.total - a.shortlisted - a.notShortlisted;
  const pct = (n) => (a.total ? (n / a.total) * 100 : 0);
  const b = bucket(job);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0, transition: { delay: Math.min(index, 8) * 0.05 } }}
      exit={{ opacity: 0, scale: 0.92 }}
      className="group flex flex-col rounded-3xl border border-cream-300 bg-cream-50 p-6 transition-shadow hover:shadow-lift"
    >
      <div className="flex items-start gap-4">
        <span
          className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl font-display text-xl font-bold transition-transform duration-300 group-hover:-rotate-6 ${
            b === "LIVE" ? "bg-forest-800 text-cream-100" : "bg-cream-300 text-forest-700"
          }`}
        >
          {initials(job.companyName)}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-2xl font-bold leading-tight">{job.role}</h3>
          <p className="mt-0.5 text-xs text-forest-500">Posted {timeAgo(job.createdAt)}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <StatusBadge status={job.status} />
          {job.status === "APPROVED" && <StatusBadge status={job.isOpen ? "OPEN" : "CLOSED"} />}
        </div>
      </div>

      <div className="mt-5">
        <JobMeta job={job} />
      </div>

      {/* Applicants summary */}
      {job.status === "APPROVED" ? (
        <div className="mt-5 rounded-2xl bg-cream-100 p-4">
          <div className="flex items-baseline justify-between">
            <p className="text-sm font-semibold text-forest-800">
              <span className="font-display text-3xl">{a.total}</span> applicant{a.total === 1 ? "" : "s"}
            </p>
            <p className="text-xs text-forest-500">
              {a.shortlisted} shortlisted · {pending} to review
            </p>
          </div>
          <div className="mt-3 flex h-2.5 overflow-hidden rounded-full bg-cream-300">
            <motion.div initial={{ width: 0 }} animate={{ width: `${pct(a.shortlisted)}%` }} transition={{ duration: 0.8 }} className="bg-forest-700" />
            <motion.div initial={{ width: 0 }} animate={{ width: `${pct(a.notShortlisted)}%` }} transition={{ duration: 0.8, delay: 0.1 }} className="bg-hotpink-500" />
          </div>
          <div className="mt-2 flex gap-4 text-[11px] text-forest-500">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-forest-700" />Shortlisted</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-hotpink-500" />Not shortlisted</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-cream-400" />To review</span>
          </div>
        </div>
      ) : (
        <div
          className={`mt-5 flex items-center gap-3 rounded-2xl p-4 text-sm ${
            job.status === "PENDING" ? "bg-cream-200 text-forest-600" : "bg-hotpink-50 text-hotpink-800"
          }`}
        >
          {job.status === "PENDING" ? <Clock className="h-5 w-5 shrink-0" /> : <XCircle className="h-5 w-5 shrink-0" />}
          {job.status === "PENDING"
            ? "The TPO is reviewing this drive. Students will see it once it's approved."
            : "The TPO didn't approve this drive, so students can't see it. Contact the placement cell for details."}
        </div>
      )}

      <div className="mt-5 flex gap-3">
        {job.status === "APPROVED" && job.isOpen && (
          <button
            onClick={() => onClose(job)}
            className="flex cursor-pointer items-center justify-center gap-2 rounded-full border-2 border-cream-400 px-5 py-2.5 text-sm font-semibold text-forest-700 transition hover:border-hotpink-500 hover:bg-hotpink-500 hover:text-white"
          >
            <CircleSlash className="h-4 w-4" /> Close
          </button>
        )}
        <Link
          to={`/recruiter/jobs/${job._id}`}
          className={buttonClass(job.status === "APPROVED" ? "dark" : "outline", "md", "group flex-1")}
        >
          {job.status === "APPROVED" ? "View applicants" : "View details"}
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
        </Link>
      </div>
    </motion.article>
  );
}
