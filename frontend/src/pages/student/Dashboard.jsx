import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowRight, BookOpen, Briefcase, CalendarDays, Clock, IdCard, Megaphone, Send, Star, Trophy } from "lucide-react";
import { toast } from "sonner";
import api, { errorMessage } from "../../api/axios";
import StatCard from "../../components/StatCard";
import StudentJobCard from "../../components/StudentJobCard";
import AnnouncementCard from "../../components/AnnouncementCard";
import StatusBadge from "../../components/ui/StatusBadge";
import EmptyState from "../../components/ui/EmptyState";
import RotatingBadge from "../../components/RotatingBadge";
import { Skeleton } from "../../components/ui/Skeleton";
import { useAuth } from "../../context/AuthContext";
import { initials, timeAgo } from "../../utils/format";

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
};

export default function StudentDashboard() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [apps, setApps] = useState([]);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get("/student/jobs"), api.get("/student/applications"), api.get("/announcements")])
      .then(([j, a, n]) => {
        setJobs(j.data.data);
        setApps(a.data.data);
        setNews(n.data.data);
      })
      .catch((err) => toast.error(errorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const s = user?.student || {};
  const firstName = user?.name?.split(" ")[0];
  const shortlisted = apps.filter((a) => a.status === "SHORTLISTED").length;
  const awaiting = apps.filter((a) => a.status === "APPLIED").length;
  const freshJobs = useMemo(() => jobs.filter((j) => !j.hasApplied).slice(0, 3), [jobs]);

  return (
    <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
      {/* Welcome hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[2.5rem] bg-forest-800 p-8 text-cream-100 shadow-lift sm:p-12"
      >
        <div className="pointer-events-none absolute -bottom-24 -left-16 h-80 w-80 rounded-full bg-hotpink-500/25 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 bg-dots-light opacity-50" />
        <RotatingBadge text="PLACEMENT SEASON • PLACEMENT SEASON • " className="absolute -right-4 -top-4 hidden scale-90 lg:grid" />

        <div className="relative grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-end">
          <div>
            <p className="text-sm font-medium text-cream-300/80">{greeting()},</p>
            <h1 className="mt-2 text-4xl font-bold leading-[1.05] text-cream-100 sm:text-6xl">
              {firstName}, <span className="italic text-hotpink-400">let's get you placed.</span>
            </h1>
            <p className="mt-4 max-w-lg text-cream-300/80">
              {loading
                ? "Loading your season..."
                : jobs.length
                  ? `${jobs.length} drive${jobs.length === 1 ? " is" : "s are"} open right now. ${freshJobs.length ? "Some you haven't applied to yet." : "You've applied to all of them!"}`
                  : "No drives are open right now. We'll show them here as soon as they're approved."}
            </p>
            <Link
              to="/student/jobs"
              className="group mt-7 inline-flex items-center gap-2 rounded-full bg-hotpink-500 px-6 py-3 font-semibold text-white shadow-glow transition hover:-translate-y-0.5 hover:bg-hotpink-600"
            >
              Browse drives <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Profile card */}
          <div className="rounded-3xl border border-cream-100/10 bg-forest-700/60 p-5 backdrop-blur">
            <div className="flex items-center gap-4">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-cream-100 font-display text-xl font-bold text-forest-800">
                {initials(user?.name)}
              </span>
              <div className="min-w-0">
                <p className="truncate font-semibold">{user?.name}</p>
                <p className="truncate text-xs text-cream-300/70">{user?.email}</p>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-2 text-sm">
              {[
                { icon: IdCard, label: "Roll no.", value: s.rollNo },
                { icon: BookOpen, label: "Dept.", value: s.department },
                { icon: Star, label: "CGPA", value: s.cgpa },
                { icon: CalendarDays, label: "Batch", value: s.graduationYear },
              ].map((x) => (
                <div key={x.label} className="rounded-2xl bg-forest-800/70 px-3 py-2.5">
                  <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-cream-300/60">
                    <x.icon className="h-3 w-3" /> {x.label}
                  </p>
                  <p className="mt-0.5 font-semibold text-cream-100">{x.value ?? "–"}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Briefcase} label="Open drives" value={loading ? "…" : jobs.length} to="/student/jobs" index={0} />
        <StatCard icon={Send} label="Applications sent" value={loading ? "…" : apps.length} to="/student/applications" index={1} />
        <StatCard icon={Trophy} label="Shortlisted" value={loading ? "…" : shortlisted} tone="pink" index={2} />
        <StatCard icon={Clock} label="Awaiting result" value={loading ? "…" : awaiting} tone="forest" index={3} />
      </div>

      <div className="mt-14 grid gap-10 lg:grid-cols-[1.5fr_1fr]">
        {/* Fresh drives */}
        <div>
          <SectionTitle title="Fresh" accent="drives" to="/student/jobs" link="See all drives" />
          <div className="mt-6">
            {loading ? (
              <div className="grid gap-5 md:grid-cols-2">
                {[0, 1].map((i) => <Skeleton key={i} className="h-56 rounded-3xl" />)}
              </div>
            ) : freshJobs.length === 0 ? (
              <EmptyState icon={Briefcase} title={jobs.length ? "You're on top of it" : "No open drives yet"} text={jobs.length ? "You've applied to every open drive." : "New drives will show up here once the TPO approves them."} />
            ) : (
              <div className="grid gap-5 md:grid-cols-2">
                {freshJobs.map((j, i) => (
                  <StudentJobCard key={j._id} job={j} index={i} compact />
                ))}
              </div>
            )}
          </div>

          {/* Recent applications */}
          {apps.length > 0 && (
            <div className="mt-12">
              <SectionTitle title="Your recent" accent="applications" to="/student/applications" link="See all" />
              <div className="mt-6 space-y-3">
                {apps.slice(0, 4).map((a, i) => (
                  <motion.div key={a._id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
                    <Link
                      to={a.jobId ? `/student/jobs/${a.jobId._id}` : "/student/applications"}
                      className="group flex items-center gap-4 rounded-2xl border border-cream-300 bg-cream-50 p-4 transition hover:shadow-soft"
                    >
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-cream-200 font-display font-bold text-forest-800">
                        {initials(a.jobId?.companyName)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold">{a.jobId?.role || "Removed drive"}</p>
                        <p className="truncate text-xs text-forest-500">
                          {a.jobId?.companyName} · applied {timeAgo(a.createdAt)}
                        </p>
                      </div>
                      <StatusBadge status={a.status} />
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Announcements */}
        <div>
          <SectionTitle title="From the" accent="TPO" to="/student/announcements" link="All announcements" />
          <div className="mt-6 space-y-4">
            {loading ? (
              [0, 1].map((i) => <Skeleton key={i} className="h-36 rounded-3xl" />)
            ) : news.length === 0 ? (
              <EmptyState icon={Megaphone} title="All quiet" text="Announcements from the placement cell will show up here." />
            ) : (
              news.slice(0, 3).map((n, i) => <AnnouncementCard key={n._id} item={n} index={i} />)
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionTitle({ title, accent, to, link }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <h2 className="text-3xl font-bold">
        {title} <span className="italic text-hotpink-500">{accent}</span>
      </h2>
      <Link to={to} className="group inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-forest-600 hover:text-hotpink-600">
        {link} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
      </Link>
    </div>
  );
}
