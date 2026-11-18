import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  CircleCheck,
  ExternalLink,
  FileText,
  Hourglass,
  Link2,
  Lock,
  MessageSquareText,
  SearchX,
  Send,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import api, { errorMessage } from "../../api/axios";
import JobMeta from "../../components/JobMeta";
import ApplicationTracker from "../../components/ApplicationTracker";
import Confetti from "../../components/Confetti";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import StatusBadge from "../../components/ui/StatusBadge";
import { Input } from "../../components/ui/Field";
import { Skeleton } from "../../components/ui/Skeleton";
import { daysLeft, deadlineText, formatDate, initials, timeAgo } from "../../utils/format";

const RESUME_KEY = "campusly:lastResumeLink";

// Remember the last resume link on this browser, so the next application is one click
const loadResume = () => {
  try {
    return localStorage.getItem(RESUME_KEY) || "";
  } catch {
    return "";
  }
};
const saveResume = (v) => {
  try {
    localStorage.setItem(RESUME_KEY, v);
  } catch {
    /* storage not available - ignore */
  }
};

const isUrl = (v) => {
  try {
    const u = new URL(v);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
};

export default function JobDetails() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [resumeLink, setResumeLink] = useState(loadResume);
  const [error, setError] = useState("");
  const [applying, setApplying] = useState(false);
  const [justApplied, setJustApplied] = useState(false);

  useEffect(() => {
    api
      .get(`/student/jobs/${id}`)
      .then((res) => setJob(res.data.data))
      .catch((err) => {
        if ([400, 404].includes(err.response?.status)) setNotFound(true);
        else toast.error(errorMessage(err));
      })
      .finally(() => setLoading(false));
  }, [id]);

  const apply = async (e) => {
    e.preventDefault();
    const link = resumeLink.trim();
    if (!link) return setError("Paste your resume link");
    if (!isUrl(link)) return setError("It should start with https://");
    setApplying(true);
    try {
      const res = await api.post(`/student/jobs/${id}/apply`, { resumeLink: link });
      saveResume(link);
      setJob({ ...job, hasApplied: true, canApply: false, application: res.data.data });
      setJustApplied(true);
      toast.success("Application sent!", { description: `Good luck with ${job.companyName}.` });
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <section className="mx-auto max-w-7xl space-y-6 px-5 py-12 sm:px-8">
        <Skeleton className="h-64 rounded-[2rem]" />
        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <Skeleton className="h-80 rounded-3xl" />
          <Skeleton className="h-80 rounded-3xl" />
        </div>
      </section>
    );
  }

  if (notFound || !job) {
    return (
      <section className="mx-auto max-w-3xl px-5 py-20">
        <EmptyState icon={SearchX} title="This drive isn't available" text="It may have closed, or the link is wrong.">
          <Link to="/student/jobs" className="font-semibold text-hotpink-600 hover:underline">Browse open drives</Link>
        </EmptyState>
      </section>
    );
  }

  const left = daysLeft(job.deadline);
  const app = job.application;

  return (
    <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
      <Link to="/student/jobs" className="group mb-6 inline-flex items-center gap-2 text-sm font-semibold text-forest-500 transition hover:text-forest-800">
        <ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-1" /> All drives
      </Link>

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[2.5rem] bg-forest-800 p-8 text-cream-100 shadow-lift sm:p-12"
      >
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-hotpink-500/25 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 bg-dots-light opacity-50" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start">
          <motion.span
            initial={{ rotate: -12, scale: 0.8 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 14 }}
            className="grid h-20 w-20 shrink-0 place-items-center rounded-3xl bg-hotpink-500 font-display text-3xl font-bold text-white shadow-glow"
          >
            {initials(job.companyName)}
          </motion.span>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-hotpink-300">{job.companyName}</p>
            <h1 className="mt-2 text-4xl font-bold leading-[1.05] text-cream-100 sm:text-6xl">{job.role}</h1>
            <div className="mt-6">
              <JobMeta job={job} dark />
            </div>
            <p className="mt-5 text-xs text-cream-300/60">Posted {timeAgo(job.createdAt)}</p>
          </div>
        </div>
      </motion.div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        {/* About */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-6">
          {job.eligibility && (
            <div className="flex items-start gap-4 rounded-3xl border border-cream-300 bg-cream-50 p-6">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-forest-800 text-cream-100">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-forest-400">Who can apply</p>
                <p className="mt-1 text-lg font-semibold text-forest-800">{job.eligibility}</p>
              </div>
            </div>
          )}

          <div className="rounded-3xl border border-cream-300 bg-cream-50 p-7">
            <h2 className="text-2xl font-bold">
              About the <span className="italic text-hotpink-500">role</span>
            </h2>
            <p className="mt-4 whitespace-pre-line leading-relaxed text-forest-600">
              {job.description || "The recruiter hasn't added a description. Check the full JD for details."}
            </p>
            {job.jdLink && (
              <a
                href={job.jdLink}
                target="_blank"
                rel="noreferrer"
                className="group mt-6 flex items-center justify-between rounded-2xl bg-cream-200 px-5 py-4 transition hover:bg-forest-800 hover:text-cream-100"
              >
                <span className="flex items-center gap-3 font-semibold">
                  <FileText className="h-5 w-5" /> Read the full job description
                </span>
                <ExternalLink className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            )}
          </div>
        </motion.div>

        {/* Apply / status panel */}
        <motion.aside
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:sticky lg:top-28 lg:self-start"
        >
          <AnimatePresence mode="wait">
            {job.hasApplied ? (
              <motion.div
                key="applied"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative rounded-[2rem] bg-cream-50 p-7 shadow-lift"
              >
                {justApplied && <Confetti />}
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">
                    You've <span className="italic text-hotpink-500">applied</span>
                  </h2>
                  <StatusBadge status={app?.status || "APPLIED"} />
                </div>
                <p className="mt-1 text-sm text-forest-500">on {formatDate(app?.createdAt)}</p>

                <div className="mt-7">
                  <ApplicationTracker status={app?.status || "APPLIED"} />
                </div>

                {app?.remarks && (
                  <div className="mt-7 rounded-2xl bg-cream-200 p-4">
                    <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-forest-500">
                      <MessageSquareText className="h-3.5 w-3.5 text-hotpink-500" /> Recruiter's note
                    </p>
                    <p className="mt-1.5 font-medium text-forest-800">{app.remarks}</p>
                  </div>
                )}

                {app?.resumeLink && (
                  <a href={app.resumeLink} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-forest-600 hover:text-hotpink-600">
                    <Link2 className="h-4 w-4" /> Resume you sent
                  </a>
                )}

                <Link
                  to="/student/applications"
                  className="group mt-6 flex items-center justify-center gap-2 rounded-full border-2 border-forest-800 py-3 text-sm font-semibold text-forest-800 transition hover:bg-forest-800 hover:text-cream-100"
                >
                  All my applications <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </Link>
              </motion.div>
            ) : job.canApply ? (
              <motion.form key="apply" onSubmit={apply} noValidate exit={{ opacity: 0, scale: 0.95 }} className="rounded-[2rem] bg-cream-50 p-7 shadow-lift">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">
                    Apply <span className="italic text-hotpink-500">now</span>
                  </h2>
                  {job.deadline && (
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${left <= 3 ? "bg-hotpink-100 text-hotpink-700" : "bg-cream-200 text-forest-600"}`}>
                      <Hourglass className="h-3.5 w-3.5" /> {deadlineText(job.deadline)}
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm text-forest-500">
                  Share a link to your resume. Make sure anyone with the link can view it.
                </p>

                <div className="mt-6">
                  <Input
                    id="resumeLink"
                    label="Resume link"
                    icon={Link2}
                    placeholder="https://drive.google.com/file/d/..."
                    value={resumeLink}
                    onChange={(e) => {
                      setResumeLink(e.target.value);
                      setError("");
                    }}
                    error={error}
                    hint={loadResume() ? "We filled in the link you used last time." : "Google Drive, Dropbox, OneDrive..."}
                  />
                </div>

                <Button type="submit" size="lg" loading={applying} className="group mt-6 w-full">
                  {!applying && <Send className="h-4 w-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />}
                  {applying ? "Sending..." : "Send application"}
                </Button>

                <ul className="mt-6 space-y-2 border-t border-dashed border-cream-400 pt-5 text-xs text-forest-500">
                  {["You can apply once per drive", "The recruiter sees your profile and resume", "Track the result in My applications"].map((t) => (
                    <li key={t} className="flex items-center gap-2">
                      <CircleCheck className="h-3.5 w-3.5 text-forest-400" /> {t}
                    </li>
                  ))}
                </ul>
              </motion.form>
            ) : (
              <motion.div key="closed" className="rounded-[2rem] bg-cream-50 p-7 text-center shadow-lift">
                <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-cream-200 text-forest-600">
                  <Lock className="h-6 w-6" />
                </span>
                <h2 className="mt-4 text-2xl font-bold">Applications closed</h2>
                <p className="mt-2 text-sm text-forest-500">This drive isn't taking new applications.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.aside>
      </div>
    </section>
  );
}
