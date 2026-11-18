import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, ArrowUpRight, Clock, Link2, MessageSquareText, Send, Trophy, XCircle } from "lucide-react";
import { toast } from "sonner";
import api, { errorMessage } from "../../api/axios";
import PageHeader from "../../components/PageHeader";
import StatCard from "../../components/StatCard";
import JobMeta from "../../components/JobMeta";
import ApplicationTracker from "../../components/ApplicationTracker";
import Tabs from "../../components/ui/Tabs";
import SearchInput from "../../components/ui/SearchInput";
import EmptyState from "../../components/ui/EmptyState";
import StatusBadge from "../../components/ui/StatusBadge";
import { buttonClass } from "../../components/ui/Button";
import { Skeleton } from "../../components/ui/Skeleton";
import { formatDate, initials } from "../../utils/format";

export default function MyApplications() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("ALL");
  const [query, setQuery] = useState("");

  useEffect(() => {
    api
      .get("/student/applications")
      .then((res) => setApps(res.data.data))
      .catch((err) => toast.error(errorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const counts = useMemo(() => {
    const c = { ALL: apps.length, APPLIED: 0, SHORTLISTED: 0, NOT_SHORTLISTED: 0 };
    apps.forEach((a) => (c[a.status] += 1));
    return c;
  }, [apps]);

  const visible = useMemo(() => {
    const q = query.toLowerCase();
    return apps.filter(
      (a) =>
        (tab === "ALL" || a.status === tab) &&
        (!q || [a.jobId?.role, a.jobId?.companyName, a.remarks].filter(Boolean).join(" ").toLowerCase().includes(q))
    );
  }, [apps, tab, query]);

  return (
    <section className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
      <PageHeader
        eyebrow="My applications"
        title="Where you"
        accent="stand."
        subtitle="Every drive you've applied to, with the recruiter's decision and notes as soon as they're in."
      />

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Send} label="Applied" value={loading ? "…" : counts.ALL} tone="forest" index={0} />
        <StatCard icon={Clock} label="Under review" value={loading ? "…" : counts.APPLIED} index={1} />
        <StatCard icon={Trophy} label="Shortlisted" value={loading ? "…" : counts.SHORTLISTED} tone="pink" index={2} />
        <StatCard icon={XCircle} label="Not shortlisted" value={loading ? "…" : counts.NOT_SHORTLISTED} index={3} />
      </div>

      {apps.length > 0 && (
        <div className="mt-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <Tabs
            id="my-apps"
            value={tab}
            onChange={setTab}
            tabs={[
              { key: "ALL", label: "All", count: counts.ALL },
              { key: "APPLIED", label: "Under review", count: counts.APPLIED },
              { key: "SHORTLISTED", label: "Shortlisted", count: counts.SHORTLISTED },
              { key: "NOT_SHORTLISTED", label: "Not shortlisted", count: counts.NOT_SHORTLISTED },
            ]}
          />
          <SearchInput value={query} onChange={setQuery} placeholder="Search role, company, notes..." className="lg:w-80" />
        </div>
      )}

      <div className="mt-8">
        {loading ? (
          <div className="space-y-4">
            {[0, 1, 2].map((i) => <Skeleton key={i} className="h-48 rounded-3xl" />)}
          </div>
        ) : apps.length === 0 ? (
          <EmptyState icon={Send} title="No applications yet" text="Find a drive you like and apply with your resume link. It takes a minute.">
            <Link to="/student/jobs" className={buttonClass("primary", "md", "group")}>
              Browse drives <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </Link>
          </EmptyState>
        ) : visible.length === 0 ? (
          <EmptyState icon={Send} title="Nothing here" text="No applications match this filter." />
        ) : (
          <motion.div layout className="space-y-4">
            <AnimatePresence mode="popLayout">
              {visible.map((a, i) => (
                <ApplicationCard key={a._id} app={a} index={i} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </section>
  );
}

function ApplicationCard({ app, index }) {
  const job = app.jobId;
  const accent =
    app.status === "SHORTLISTED" ? "border-l-hotpink-500" : app.status === "NOT_SHORTLISTED" ? "border-l-hotpink-800/40" : "border-l-forest-700";

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0, transition: { delay: Math.min(index, 8) * 0.05 } }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`group grid gap-6 rounded-3xl border border-l-[6px] border-cream-300 bg-cream-50 p-6 transition-shadow hover:shadow-lift md:grid-cols-[1.3fr_1fr] md:items-center ${accent}`}
    >
      <div>
        <div className="flex items-start gap-4">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-forest-800 font-display text-xl font-bold text-cream-100 transition-transform duration-300 group-hover:-rotate-6">
            {initials(job?.companyName)}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-display text-2xl font-bold leading-tight">{job?.role || "Drive removed"}</h3>
              {app.status === "SHORTLISTED" && (
                <motion.span
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 12, delay: 0.2 }}
                  className="rounded-full bg-hotpink-500 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white shadow-glow"
                >
                  Congrats!
                </motion.span>
              )}
            </div>
            <p className="text-sm font-medium text-forest-500">
              {job?.companyName} · applied {formatDate(app.createdAt)}
            </p>
          </div>
        </div>

        {job && (
          <div className="mt-4">
            <JobMeta job={{ ...job, deadline: undefined }} />
          </div>
        )}

        {app.remarks && (
          <div className="mt-4 flex items-start gap-2.5 rounded-2xl bg-cream-200 px-4 py-3">
            <MessageSquareText className="mt-0.5 h-4 w-4 shrink-0 text-hotpink-500" />
            <p className="text-sm">
              <span className="font-semibold text-forest-800">Recruiter: </span>
              <span className="text-forest-700">{app.remarks}</span>
            </p>
          </div>
        )}
      </div>

      <div className="rounded-2xl bg-cream-100 p-5">
        <div className="mb-5 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-forest-400">Progress</p>
          <StatusBadge status={app.status} />
        </div>
        <ApplicationTracker status={app.status} />
        <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-cream-300 pt-4">
          <a href={app.resumeLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs font-semibold text-forest-600 hover:text-hotpink-600">
            <Link2 className="h-3.5 w-3.5" /> Resume sent
          </a>
          {job && (
            <Link to={`/student/jobs/${job._id}`} className="group/link inline-flex items-center gap-1 text-xs font-semibold text-forest-800 hover:text-hotpink-600">
              View drive <ArrowUpRight className="h-3.5 w-3.5 transition group-hover/link:rotate-45" />
            </Link>
          )}
        </div>
      </div>
    </motion.article>
  );
}
