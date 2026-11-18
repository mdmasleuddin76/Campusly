import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
  ArrowLeft,
  Briefcase,
  CalendarDays,
  ClipboardList,
  GraduationCap,
  Link2,
  MapPin,
  Rocket,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import api, { errorMessage } from "../../api/axios";
import PageHeader from "../../components/PageHeader";
import JobMeta from "../../components/JobMeta";
import Button from "../../components/ui/Button";
import { Input, Textarea } from "../../components/ui/Field";
import { useAuth } from "../../context/AuthContext";
import { initials } from "../../utils/format";

const EMPTY = {
  role: "",
  package: "",
  location: "",
  jobType: "FULL_TIME",
  deadline: "",
  jdLink: "",
  eligibility: "",
  description: "",
};

const isUrl = (v) => {
  try {
    const u = new URL(v);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
};

const today = () => new Date().toISOString().slice(0, 10);

export default function PostJob() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const companyName = user?.recruiter?.companyName || "Your company";

  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validate = () => {
    const e = {};
    if (!form.role.trim()) e.role = "What's the role called?";
    if (form.deadline && form.deadline < today()) e.deadline = "Pick today or a later date";
    if (form.jdLink && !isUrl(form.jdLink.trim())) e.jdLink = "Must start with http:// or https://";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fix the highlighted fields");
      return;
    }
    setSaving(true);
    try {
      const body = Object.fromEntries(Object.entries(form).map(([k, v]) => [k, typeof v === "string" ? v.trim() : v]));
      // send the deadline as the end of that day
      if (body.deadline) body.deadline = new Date(`${body.deadline}T23:59:59`).toISOString();
      else delete body.deadline;
      await api.post("/recruiter/jobs", body);
      toast.success("Drive submitted!", { description: "The TPO will review it before students can see it." });
      navigate("/recruiter/jobs");
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const preview = { ...form, companyName, deadline: form.deadline ? `${form.deadline}T23:59:59` : "" };

  return (
    <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
      <Link to="/recruiter/jobs" className="group mb-6 inline-flex items-center gap-2 text-sm font-semibold text-forest-500 transition hover:text-forest-800">
        <ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-1" /> My drives
      </Link>

      <PageHeader
        eyebrow="Recruiter dashboard"
        title="Post a"
        accent="new drive."
        subtitle="Fill in the details. The TPO approves it, then it goes live for every student."
      />

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.25fr_1fr]">
        <form onSubmit={onSubmit} noValidate className="space-y-8 rounded-[2rem] bg-cream-50 p-7 shadow-lift sm:p-9">
          {/* The role */}
          <fieldset className="space-y-5">
            <Legend n="1" title="The role" />
            <Input id="role" name="role" label="Job title" icon={Briefcase} placeholder="Software Development Engineer" value={form.role} onChange={onChange} error={errors.role} />

            <div>
              <p className="mb-1.5 text-sm font-medium text-forest-700">Job type</p>
              <div className="relative grid grid-cols-2 rounded-2xl border border-cream-300 bg-cream-100 p-1.5">
                {[
                  { key: "FULL_TIME", label: "Full-time", icon: Briefcase },
                  { key: "INTERNSHIP", label: "Internship", icon: GraduationCap },
                ].map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setForm({ ...form, jobType: t.key })}
                    className={`relative flex cursor-pointer items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-colors ${
                      form.jobType === t.key ? "text-cream-100" : "text-forest-600 hover:text-forest-900"
                    }`}
                  >
                    {form.jobType === t.key && (
                      <motion.span layoutId="jobtype-pill" className="absolute inset-0 rounded-xl bg-forest-800" transition={{ type: "spring", stiffness: 400, damping: 32 }} />
                    )}
                    <t.icon className="relative h-4 w-4" />
                    <span className="relative">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Input id="package" name="package" label={form.jobType === "INTERNSHIP" ? "Stipend" : "Package"} icon={Wallet} placeholder={form.jobType === "INTERNSHIP" ? "₹40,000 / month" : "12 LPA"} value={form.package} onChange={onChange} />
              <Input id="location" name="location" label="Location" icon={MapPin} placeholder="Bangalore / Remote" value={form.location} onChange={onChange} />
            </div>
          </fieldset>

          {/* Who and when */}
          <fieldset className="space-y-5 border-t border-dashed border-cream-400 pt-8">
            <Legend n="2" title="Who can apply, and by when" />
            <Input id="eligibility" name="eligibility" label="Eligibility" icon={ShieldCheck} placeholder="CGPA 7+, CSE / IT / ECE, no active backlogs" value={form.eligibility} onChange={onChange} />
            <Input id="deadline" name="deadline" type="date" min={today()} label="Application deadline" icon={CalendarDays} value={form.deadline} onChange={onChange} error={errors.deadline} hint="Leave empty to keep it open until you close it." />
          </fieldset>

          {/* Details */}
          <fieldset className="space-y-5 border-t border-dashed border-cream-400 pt-8">
            <Legend n="3" title="Details" />
            <Input id="jdLink" name="jdLink" label="Job description link" icon={Link2} placeholder="https://drive.google.com/..." value={form.jdLink} onChange={onChange} error={errors.jdLink} hint="A link to the full JD (Google Drive, Notion, careers page). No file upload needed." />
            <Textarea id="description" name="description" label="Short description" rows={5} placeholder="What the team does, what the hire will work on, the selection rounds..." value={form.description} onChange={onChange} />
          </fieldset>

          <div className="flex flex-col gap-3 border-t border-cream-300 pt-6 sm:flex-row">
            <Link to="/recruiter/jobs" className="flex-1 rounded-full border-2 border-forest-800 py-3 text-center text-sm font-semibold text-forest-800 transition hover:bg-forest-800 hover:text-cream-100">
              Cancel
            </Link>
            <Button type="submit" size="lg" loading={saving} className="group flex-[2]">
              {!saving && <Rocket className="h-4 w-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />}
              {saving ? "Submitting..." : "Submit for approval"}
            </Button>
          </div>
        </form>

        {/* Live preview */}
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <p className="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-hotpink-600">
            <Sparkles className="h-3.5 w-3.5" /> How students will see it
          </p>
          <motion.div layout className="overflow-hidden rounded-[2rem] bg-forest-800 p-7 text-cream-100 shadow-lift">
            <div className="flex items-start gap-4">
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-hotpink-500 font-display text-xl font-bold text-white shadow-glow">
                {initials(companyName)}
              </span>
              <div className="min-w-0">
                <p className="font-display text-2xl font-bold leading-tight text-cream-100">{form.role || "Job title"}</p>
                <p className="text-sm text-cream-300/80">{companyName}</p>
              </div>
            </div>
            <div className="mt-5">
              <JobMeta job={preview} dark />
            </div>
            {form.eligibility && (
              <p className="mt-5 text-sm">
                <span className="font-semibold text-hotpink-300">Eligibility: </span>
                <span className="text-cream-200">{form.eligibility}</span>
              </p>
            )}
            <p className="mt-4 line-clamp-4 whitespace-pre-line text-sm leading-relaxed text-cream-300/80">
              {form.description || "Your description will show here."}
            </p>
            <div className="mt-6 flex gap-3">
              <span className="flex-1 rounded-full bg-hotpink-500 py-2.5 text-center text-sm font-semibold text-white">Apply now</span>
              {form.jdLink && <span className="rounded-full border border-cream-100/30 px-4 py-2.5 text-sm font-semibold">View JD</span>}
            </div>
          </motion.div>

          <div className="mt-5 flex items-start gap-3 rounded-2xl border border-cream-300 bg-cream-50 p-4 text-sm text-forest-600">
            <ClipboardList className="mt-0.5 h-5 w-5 shrink-0 text-forest-500" />
            After you submit, the drive shows as <span className="font-semibold text-forest-800">Pending</span> until the TPO approves it.
          </div>
        </aside>
      </div>
    </section>
  );
}

function Legend({ n, title }) {
  return (
    <legend className="mb-1 flex items-center gap-3">
      <span className="grid h-8 w-8 place-items-center rounded-full bg-hotpink-500 text-sm font-bold text-white shadow-glow">{n}</span>
      <span className="font-display text-xl font-bold">{title}</span>
    </legend>
  );
}
