import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "motion/react";
import {
  ArrowDownUp,
  ArrowLeft,
  Check,
  ChevronRight,
  CircleSlash,
  Clock,
  Download,
  ExternalLink,
  FileText,
  Inbox,
  Lock,
  MessageSquareText,
  RotateCcw,
  Save,
  UserCheck,
  UserX,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";
import api, { errorMessage } from "../../api/axios";
import StatCard from "../../components/StatCard";
import Avatar from "../../components/Avatar";
import JobMeta from "../../components/JobMeta";
import UserInfo from "../../components/tpo/UserInfo";
import Tabs from "../../components/ui/Tabs";
import SearchInput from "../../components/ui/SearchInput";
import StatusBadge from "../../components/ui/StatusBadge";
import EmptyState from "../../components/ui/EmptyState";
import Drawer from "../../components/ui/Drawer";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import { Skeleton } from "../../components/ui/Skeleton";
import { formatDate, initials, timeAgo } from "../../utils/format";

const REMARK_IDEAS = ["Interview scheduled", "Cleared round 1", "Cleared round 2", "Rejected in round 1", "Rejected in round 2", "Offer made"];

// Builds and downloads a CSV of the applicants
const downloadCsv = (job, apps) => {
  const head = ["Name", "Email", "Phone", "Roll no", "Department", "CGPA", "Graduation year", "Resume link", "Status", "Remarks", "Applied on"];
  const rows = apps.map((a) => {
    const s = a.studentId || {};
    return [s.name, s.email, s.phone, s.student?.rollNo, s.student?.department, s.student?.cgpa, s.student?.graduationYear, a.resumeLink, a.status, a.remarks, formatDate(a.createdAt)];
  });
  const csv = [head, ...rows].map((r) => r.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `${job.role.replace(/\s+/g, "-").toLowerCase()}-applicants.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

export default function JobApplicants() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [tab, setTab] = useState("ALL");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("newest");
  const [selectedId, setSelectedId] = useState(null);
  const [busy, setBusy] = useState(null);
  const [closeOpen, setCloseOpen] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    api
      .get(`/recruiter/jobs/${id}/applications`)
      .then((res) => {
        setJob(res.data.data.job);
        setApps(res.data.data.applications);
      })
      .catch((err) => {
        if (err.response?.status === 404 || err.response?.status === 400) setNotFound(true);
        else toast.error(errorMessage(err));
      })
      .finally(() => setLoading(false));
  }, [id]);

  const counts = useMemo(() => {
    const c = { ALL: apps.length, APPLIED: 0, SHORTLISTED: 0, NOT_SHORTLISTED: 0 };
    apps.forEach((a) => (c[a.status] += 1));
    return c;
  }, [apps]);

  const visible = useMemo(() => {
    const q = query.toLowerCase();
    const list = apps.filter((a) => {
      const s = a.studentId || {};
      const text = [s.name, s.email, s.student?.rollNo, s.student?.department, a.remarks].filter(Boolean).join(" ").toLowerCase();
      return (tab === "ALL" || a.status === tab) && (!q || text.includes(q));
    });
    if (sort === "cgpa") list.sort((a, b) => (b.studentId?.student?.cgpa ?? 0) - (a.studentId?.student?.cgpa ?? 0));
    else if (sort === "name") list.sort((a, b) => (a.studentId?.name || "").localeCompare(b.studentId?.name || ""));
    else list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return list;
  }, [apps, tab, query, sort]);

  const selected = apps.find((a) => a._id === selectedId);

  // Update one application (status and/or remarks)
  const update = async (app, changes, message) => {
    setBusy(`${app._id}:${changes.status || "remarks"}`);
    try {
      const res = await api.patch(`/recruiter/applications/${app._id}`, changes);
      setApps((prev) => prev.map((a) => (a._id === app._id ? { ...a, status: res.data.data.status, remarks: res.data.data.remarks } : a)));
      toast.success(message || "Saved");
      return true;
    } catch (err) {
      toast.error(errorMessage(err));
      return false;
    } finally {
      setBusy(null);
    }
  };

  const closeJob = async () => {
    setClosing(true);
    try {
      await api.patch(`/recruiter/jobs/${job._id}/close`);
      setJob({ ...job, isOpen: false });
      toast.success("Applications closed");
      setCloseOpen(false);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setClosing(false);
    }
  };

  if (loading) {
    return (
      <section className="mx-auto max-w-7xl space-y-6 px-5 py-12 sm:px-8">
        <Skeleton className="h-56 rounded-[2rem]" />
        <div className="grid gap-4 sm:grid-cols-4">
          {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-32 rounded-3xl" />)}
        </div>
        <Skeleton className="h-80 rounded-3xl" />
      </section>
    );
  }

  if (notFound || !job) {
    return (
      <section className="mx-auto max-w-3xl px-5 py-20">
        <EmptyState icon={Inbox} title="Drive not found" text="It may have been removed, or it belongs to another recruiter.">
          <Link to="/recruiter/jobs" className="font-semibold text-hotpink-600 hover:underline">Back to my drives</Link>
        </EmptyState>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
      <Link to="/recruiter/jobs" className="group mb-6 inline-flex items-center gap-2 text-sm font-semibold text-forest-500 transition hover:text-forest-800">
        <ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-1" /> My drives
      </Link>

      {/* Job hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[2rem] bg-forest-800 p-7 text-cream-100 shadow-lift sm:p-10"
      >
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-hotpink-500/25 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 bg-dots-light opacity-50" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-5">
            <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-hotpink-500 font-display text-2xl font-bold text-white shadow-glow">
              {initials(job.companyName)}
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={job.status} />
                {job.status === "APPROVED" && <StatusBadge status={job.isOpen ? "OPEN" : "CLOSED"} />}
              </div>
              <h1 className="mt-3 text-4xl font-bold leading-tight text-cream-100 sm:text-5xl">{job.role}</h1>
              <p className="mt-1 text-cream-300/80">
                {job.companyName} · posted {timeAgo(job.createdAt)}
              </p>
              <div className="mt-5">
                <JobMeta job={job} dark />
              </div>
              {job.eligibility && (
                <p className="mt-4 text-sm">
                  <span className="font-semibold text-hotpink-300">Eligibility: </span>
                  <span className="text-cream-200">{job.eligibility}</span>
                </p>
              )}
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap gap-3">
            {job.jdLink && (
              <a href={job.jdLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-cream-100/25 px-5 py-2.5 text-sm font-semibold transition hover:bg-cream-100 hover:text-forest-800">
                <FileText className="h-4 w-4" /> JD
              </a>
            )}
            {job.status === "APPROVED" && job.isOpen && (
              <button onClick={() => setCloseOpen(true)} className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-cream-100 px-5 py-2.5 text-sm font-semibold text-forest-800 transition hover:bg-hotpink-500 hover:text-white">
                <CircleSlash className="h-4 w-4" /> Close applications
              </button>
            )}
            {!job.isOpen && (
              <span className="inline-flex items-center gap-2 rounded-full bg-forest-700 px-5 py-2.5 text-sm font-semibold text-cream-200">
                <Lock className="h-4 w-4" /> Applications closed
              </span>
            )}
          </div>
        </div>
      </motion.div>

      {job.status !== "APPROVED" ? (
        <div className="mt-8">
          <EmptyState
            icon={Clock}
            title={job.status === "PENDING" ? "Waiting for TPO approval" : "This drive wasn't approved"}
            text={job.status === "PENDING" ? "Students can't see this drive yet. Applicants will appear here once the TPO approves it." : "Students can't see or apply to this drive."}
          />
        </div>
      ) : (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon={Users} label="Applicants" value={counts.ALL} tone="forest" index={0} />
            <StatCard icon={Clock} label="To review" value={counts.APPLIED} tone="pink" index={1} />
            <StatCard icon={UserCheck} label="Shortlisted" value={counts.SHORTLISTED} index={2} />
            <StatCard icon={UserX} label="Not shortlisted" value={counts.NOT_SHORTLISTED} index={3} />
          </div>

          {/* Filters */}
          <div className="mt-8 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <Tabs
              id="applicants"
              value={tab}
              onChange={setTab}
              tabs={[
                { key: "ALL", label: "All", count: counts.ALL },
                { key: "APPLIED", label: "To review", count: counts.APPLIED },
                { key: "SHORTLISTED", label: "Shortlisted", count: counts.SHORTLISTED },
                { key: "NOT_SHORTLISTED", label: "Not shortlisted", count: counts.NOT_SHORTLISTED },
              ]}
            />
            <div className="flex flex-wrap items-center gap-3">
              <SearchInput value={query} onChange={setQuery} placeholder="Name, roll no, remarks..." className="w-full sm:w-64" />
              <label className="relative">
                <ArrowDownUp className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-forest-400" />
                <select value={sort} onChange={(e) => setSort(e.target.value)} className="cursor-pointer appearance-none rounded-2xl border border-cream-300 bg-cream-50 py-3 pl-10 pr-5 text-sm font-semibold text-forest-700 outline-none focus:border-forest-500">
                  <option value="newest">Newest</option>
                  <option value="cgpa">CGPA high → low</option>
                  <option value="name">Name A–Z</option>
                </select>
              </label>
              <button
                onClick={() => downloadCsv(job, visible)}
                disabled={!visible.length}
                className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-cream-300 bg-cream-50 px-4 py-3 text-sm font-semibold text-forest-700 transition hover:bg-forest-800 hover:text-cream-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Download className="h-4 w-4" /> CSV
              </button>
            </div>
          </div>

          <div className="mt-6">
            {apps.length === 0 ? (
              <EmptyState icon={Inbox} title="No applicants yet" text={job.isOpen ? "Students who apply will show up here." : "Nobody applied before the drive closed."} />
            ) : visible.length === 0 ? (
              <EmptyState icon={Users} title="No one here" text="No applicants match this filter." />
            ) : (
              <div className="space-y-3">
                {visible.map((a, i) => (
                  <ApplicantRow key={a._id} app={a} index={i} busy={busy} onOpen={() => setSelectedId(a._id)} onUpdate={update} />
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Applicant drawer */}
      <Drawer open={!!selected} onClose={() => setSelectedId(null)} title="Applicant">
        {selected && <ApplicantDetails key={selected._id} app={selected} busy={busy} onUpdate={update} />}
      </Drawer>

      {/* Close confirm */}
      <Modal open={closeOpen} onClose={() => !closing && setCloseOpen(false)} title="Close applications?" size="sm">
        <p className="text-forest-600">
          No new students will be able to apply. You can still shortlist and add remarks for everyone who already applied.
        </p>
        <div className="mt-7 flex gap-3">
          <Button variant="outline" onClick={() => setCloseOpen(false)} disabled={closing} className="flex-1">Keep open</Button>
          <Button onClick={closeJob} loading={closing} className="flex-1">{!closing && <Lock className="h-4 w-4" />} Close it</Button>
        </div>
      </Modal>
    </section>
  );
}

function ApplicantRow({ app, index, busy, onOpen, onUpdate }) {
  const s = app.studentId || {};
  const name = s.name || "Student";
  const isBusy = (st) => busy === `${app._id}:${st}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index, 12) * 0.03 }}
      className={`group flex flex-col gap-4 rounded-3xl border bg-cream-50 p-4 transition-shadow hover:shadow-lift sm:p-5 lg:flex-row lg:items-center ${
        app.status === "SHORTLISTED" ? "border-forest-300" : app.status === "NOT_SHORTLISTED" ? "border-hotpink-200" : "border-cream-300"
      }`}
    >
      <button onClick={onOpen} className="flex min-w-0 flex-1 cursor-pointer items-center gap-4 text-left">
        <Avatar name={name} role="STUDENT" />
        <div className="min-w-0">
          <p className="truncate font-semibold text-forest-800">{name}</p>
          <p className="truncate text-xs text-forest-500">
            {s.student?.rollNo} · {s.student?.department} · applied {timeAgo(app.createdAt)}
          </p>
          {app.remarks && (
            <p className="mt-1 flex items-center gap-1.5 truncate text-xs italic text-forest-600">
              <MessageSquareText className="h-3.5 w-3.5 shrink-0 text-hotpink-500" /> {app.remarks}
            </p>
          )}
        </div>
      </button>

      <div className="flex flex-wrap items-center gap-3 lg:justify-end">
        <div className="rounded-2xl bg-cream-100 px-3 py-1.5 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-forest-400">CGPA</p>
          <p className="font-display text-lg font-bold leading-none">{s.student?.cgpa ?? "–"}</p>
        </div>
        <a
          href={app.resumeLink}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full bg-hotpink-50 px-3.5 py-2 text-xs font-semibold text-hotpink-700 ring-1 ring-hotpink-200 transition hover:bg-hotpink-500 hover:text-white"
        >
          Resume <ExternalLink className="h-3.5 w-3.5" />
        </a>
        <StatusBadge status={app.status} className="min-w-28 justify-center" />

        {/* Quick actions */}
        <div className="flex gap-1.5">
          <button
            onClick={() => onUpdate(app, { status: "SHORTLISTED" }, `${name} shortlisted`)}
            disabled={!!busy || app.status === "SHORTLISTED"}
            title="Shortlist"
            className="grid h-10 w-10 cursor-pointer place-items-center rounded-full bg-forest-100 text-forest-800 transition hover:bg-forest-800 hover:text-cream-100 disabled:cursor-default disabled:opacity-40 disabled:hover:bg-forest-100 disabled:hover:text-forest-800"
          >
            <Check className={`h-4.5 w-4.5 ${isBusy("SHORTLISTED") ? "animate-pulse" : ""}`} />
          </button>
          <button
            onClick={() => onUpdate(app, { status: "NOT_SHORTLISTED" }, `${name} marked not shortlisted`)}
            disabled={!!busy || app.status === "NOT_SHORTLISTED"}
            title="Not shortlisted"
            className="grid h-10 w-10 cursor-pointer place-items-center rounded-full bg-hotpink-100 text-hotpink-700 transition hover:bg-hotpink-500 hover:text-white disabled:cursor-default disabled:opacity-40 disabled:hover:bg-hotpink-100 disabled:hover:text-hotpink-700"
          >
            <X className={`h-4.5 w-4.5 ${isBusy("NOT_SHORTLISTED") ? "animate-pulse" : ""}`} />
          </button>
          <button onClick={onOpen} title="Details and remarks" className="grid h-10 w-10 cursor-pointer place-items-center rounded-full bg-cream-200 text-forest-600 transition hover:bg-cream-300">
            <ChevronRight className="h-4.5 w-4.5 transition group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function ApplicantDetails({ app, busy, onUpdate }) {
  const s = app.studentId || {};
  const [status, setStatus] = useState(app.status);
  const [remarks, setRemarks] = useState(app.remarks || "");
  const changed = status !== app.status || remarks !== (app.remarks || "");

  const save = () => onUpdate(app, { status, remarks: remarks.trim() }, "Applicant updated");

  return (
    <div>
      <div className="flex items-center gap-4">
        <Avatar name={s.name} role="STUDENT" size="lg" />
        <div className="min-w-0">
          <h3 className="truncate text-2xl font-bold">{s.name}</h3>
          <p className="mt-1 text-xs text-forest-500">Applied {formatDate(app.createdAt)}</p>
        </div>
      </div>

      <a
        href={app.resumeLink}
        target="_blank"
        rel="noreferrer"
        className="mt-6 flex items-center justify-between rounded-2xl bg-hotpink-500 px-5 py-4 text-white shadow-glow transition hover:-translate-y-0.5 hover:bg-hotpink-600"
      >
        <span className="flex items-center gap-3 font-semibold">
          <FileText className="h-5 w-5" /> Open resume
        </span>
        <ExternalLink className="h-4 w-4" />
      </a>

      <div className="mt-6">
        <UserInfo user={{ ...s, role: "STUDENT" }} full />
      </div>

      <div className="mt-8 rounded-3xl bg-cream-200 p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-forest-500">Decision</p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {[
            { s: "SHORTLISTED", label: "Shortlist", icon: Check, active: "bg-forest-800 text-cream-100" },
            { s: "APPLIED", label: "Undecided", icon: RotateCcw, active: "bg-cream-600 text-white" },
            { s: "NOT_SHORTLISTED", label: "Not shortlisted", icon: X, active: "bg-hotpink-500 text-white" },
          ].map((o) => (
            <button
              key={o.s}
              onClick={() => setStatus(o.s)}
              className={`flex cursor-pointer flex-col items-center gap-1 rounded-2xl px-1 py-3 text-xs font-semibold transition ${
                status === o.s ? `${o.active} shadow-soft` : "bg-cream-50 text-forest-600 hover:bg-white"
              }`}
            >
              <o.icon className="h-4 w-4" />
              {o.label}
            </button>
          ))}
        </div>

        <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-forest-500">Remarks</p>
        <p className="mt-1 text-xs text-forest-400">The student sees this next to their status.</p>
        <textarea
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          rows={3}
          maxLength={300}
          placeholder="e.g. Cleared round 1, interview on Monday 10 AM"
          className="mt-3 w-full resize-none rounded-xl border border-cream-300 bg-cream-50 px-4 py-3 text-sm text-forest-800 outline-none transition placeholder:text-forest-300 focus:border-forest-500 focus:bg-white focus:ring-4 focus:ring-forest-100"
        />
        <div className="mt-2 flex flex-wrap gap-1.5">
          {REMARK_IDEAS.map((r) => (
            <button
              key={r}
              onClick={() => setRemarks(r)}
              className="cursor-pointer rounded-full bg-cream-50 px-3 py-1 text-[11px] font-medium text-forest-600 ring-1 ring-cream-300 transition hover:bg-forest-800 hover:text-cream-100"
            >
              {r}
            </button>
          ))}
        </div>

        <Button onClick={save} loading={!!busy} disabled={!changed} className="mt-5 w-full">
          {!busy && <Save className="h-4 w-4" />} {changed ? "Save changes" : "Saved"}
        </Button>
      </div>
    </div>
  );
}
