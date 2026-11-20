import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowDownUp, Briefcase, GraduationCap, Layers, SearchX } from "lucide-react";
import { toast } from "sonner";
import api, { errorMessage } from "../../api/axios";
import PageHeader from "../../components/PageHeader";
import StudentJobCard from "../../components/StudentJobCard";
import Tabs from "../../components/ui/Tabs";
import SearchInput from "../../components/ui/SearchInput";
import EmptyState from "../../components/ui/EmptyState";
import { CardSkeletons } from "../../components/ui/Skeleton";

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState("ALL");
  const [query, setQuery] = useState("");
  const [hideApplied, setHideApplied] = useState(false);
  const [onlyEligible, setOnlyEligible] = useState(false);
  const [sort, setSort] = useState("newest");

  useEffect(() => {
    api
      .get("/student/jobs")
      .then((res) => setJobs(res.data.data))
      .catch((err) => toast.error(errorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const counts = useMemo(
    () => ({
      ALL: jobs.length,
      FULL_TIME: jobs.filter((j) => j.jobType === "FULL_TIME").length,
      INTERNSHIP: jobs.filter((j) => j.jobType === "INTERNSHIP").length,
    }),
    [jobs]
  );

  const visible = useMemo(() => {
    const q = query.toLowerCase();
    const list = jobs.filter(
      (j) =>
        (type === "ALL" || j.jobType === type) &&
        (!hideApplied || !j.hasApplied) &&
        (!onlyEligible || j.eligible !== false) &&
        (!q || [j.role, j.companyName, j.location, j.eligibility].filter(Boolean).join(" ").toLowerCase().includes(q))
    );
    if (sort === "deadline") {
      list.sort((a, b) => (a.deadline ? new Date(a.deadline) : Infinity) - (b.deadline ? new Date(b.deadline) : Infinity));
    } else {
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    return list;
  }, [jobs, type, query, hideApplied, onlyEligible, sort]);

  const appliedCount = jobs.filter((j) => j.hasApplied).length;
  const eligibleCount = jobs.filter((j) => j.eligible !== false).length;

  return (
    <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
      <PageHeader
        eyebrow="Open drives"
        title="Find your"
        accent="next move."
        subtitle="Every drive here is approved by the TPO and open for applications."
      >
        {!loading && (
          <div className="flex flex-wrap gap-3">
            <div className="rounded-2xl bg-forest-800 px-5 py-3 text-cream-100">
              <p className="font-display text-3xl font-bold">{jobs.length}</p>
              <p className="text-xs text-cream-300/70">open now</p>
            </div>
            <div className="rounded-2xl bg-cream-50 px-5 py-3 ring-1 ring-cream-300">
              <p className="font-display text-3xl font-bold">{eligibleCount}</p>
              <p className="text-xs text-forest-500">you're eligible for</p>
            </div>
            <div className="rounded-2xl bg-hotpink-500 px-5 py-3 text-white shadow-glow">
              <p className="font-display text-3xl font-bold">{appliedCount}</p>
              <p className="text-xs text-white/80">applied</p>
            </div>
          </div>
        )}
      </PageHeader>

      <div className="mt-10 space-y-4 rounded-3xl border border-cream-300 bg-cream-50/70 p-4 backdrop-blur sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <Tabs
            id="student-jobs"
            value={type}
            onChange={setType}
            tabs={[
              { key: "ALL", label: "All", icon: Layers, count: counts.ALL },
              { key: "FULL_TIME", label: "Full-time", icon: Briefcase, count: counts.FULL_TIME },
              { key: "INTERNSHIP", label: "Internships", icon: GraduationCap, count: counts.INTERNSHIP },
            ]}
          />
          <SearchInput value={query} onChange={setQuery} placeholder="Search role, company, location..." className="lg:w-96" />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Toggle on={onlyEligible} onClick={() => setOnlyEligible((v) => !v)}>
            Only drives I'm eligible for
          </Toggle>
          <Toggle on={hideApplied} onClick={() => setHideApplied((h) => !h)}>
            Hide drives I've applied to
          </Toggle>
          <label className="relative ml-auto">
            <ArrowDownUp className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-forest-400" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="cursor-pointer appearance-none rounded-full border border-cream-300 bg-cream-50 py-1.5 pl-8 pr-4 text-xs font-semibold text-forest-700 outline-none focus:border-forest-500"
            >
              <option value="newest">Newest first</option>
              <option value="deadline">Deadline soonest</option>
            </select>
          </label>
        </div>
      </div>

      <div className="mt-8">
        {loading ? (
          <CardSkeletons count={6} />
        ) : jobs.length === 0 ? (
          <EmptyState icon={Briefcase} title="No open drives right now" text="Check back soon. New drives appear here as soon as the TPO approves them." />
        ) : visible.length === 0 ? (
          <EmptyState icon={SearchX} title="Nothing matches" text="Try another search or clear the filters." />
        ) : (
          <motion.div layout className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {visible.map((j, i) => (
                <StudentJobCard key={j._id} job={j} index={i} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </section>
  );
}

function Toggle({ on, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className="flex cursor-pointer items-center gap-2.5 rounded-full bg-cream-200 py-1.5 pl-1.5 pr-4 text-xs font-semibold text-forest-700 transition hover:bg-cream-300"
    >
      <span className={`relative h-5 w-9 rounded-full transition-colors ${on ? "bg-hotpink-500" : "bg-cream-400"}`}>
        <motion.span
          layout
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow ${on ? "right-0.5" : "left-0.5"}`}
        />
      </span>
      {children}
    </button>
  );
}
