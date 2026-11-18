import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "motion/react";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Briefcase,
  CircleCheck,
  ClipboardCheck,
  FileText,
  GraduationCap,
  Link2,
  MapPin,
  Megaphone,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import RotatingBadge from "../components/RotatingBadge";
import { buttonClass } from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";
import { NAV_BY_ROLE, ROLE_LABEL, SITE } from "../config/site";

// Reusable "fade up when scrolled into view" animation
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] } }),
};

const MARQUEE = [
  "One login for everyone",
  "TPO-verified drives",
  "Apply with a resume link",
  "Live shortlist status",
  "Announcements in one place",
  "Zero paperwork",
];

const ROLES = [
  {
    icon: GraduationCap,
    title: "Students",
    tagline: "Find it. Apply. Track it.",
    points: ["Browse every approved drive", "Apply with your resume link", "See shortlist status and remarks"],
  },
  {
    icon: ShieldCheck,
    title: "TPO",
    tagline: "Every account, every drive, checked.",
    points: ["Approve students and recruiters", "Verify drives before they go live", "Post announcements to everyone"],
    featured: true,
  },
  {
    icon: Briefcase,
    title: "Recruiters",
    tagline: "Post once. Shortlist fast.",
    points: ["Post drives with a JD link", "See every applicant in one table", "Shortlist and leave remarks"],
  },
];

const STEPS = [
  { icon: Users, title: "Sign up", text: "Students and recruiters create an account in a minute." },
  { icon: ShieldCheck, title: "TPO approves", text: "Your account is verified by the placement cell." },
  { icon: FileText, title: "Apply", text: "Pick an open drive and drop your resume link." },
  { icon: BadgeCheck, title: "Get shortlisted", text: "Watch your status update, round by round." },
];

export default function Home() {
  const { user } = useAuth();
  const location = useLocation();

  // Scroll to a section when arriving from the header on another page
  useEffect(() => {
    const id = location.state?.scrollTo;
    if (id && id !== "top") {
      setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  }, [location.state]);

  const words = ["Your", "career,", "but", "make", "it"];

  return (
    <div id="top" className="overflow-x-clip">
      {/* ───────────── HERO ───────────── */}
      <section className="relative">
        <div className="pointer-events-none absolute inset-0 bg-dots [mask-image:radial-gradient(ellipse_at_top_left,black_30%,transparent_70%)]" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-5 pb-24 pt-10 sm:px-8 lg:grid-cols-[1.1fr_1fr] lg:pt-16">
          {/* Left: copy */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 rounded-full border border-cream-400 bg-cream-50/70 py-1.5 pl-2 pr-4 text-xs font-semibold uppercase tracking-[0.16em] text-forest-600 backdrop-blur"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-hotpink-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-hotpink-500" />
              </span>
              {SITE.cellName} · {SITE.collegeName}
            </motion.div>

            <h1 className="mt-7 text-[3.2rem] font-bold leading-[0.98] tracking-tight sm:text-7xl lg:text-[5.4rem]">
              {words.map((w, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 40, rotate: 4 }}
                  animate={{ opacity: 1, y: 0, rotate: 0 }}
                  transition={{ duration: 0.7, delay: 0.1 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  className="mr-[0.22em] inline-block"
                >
                  {w}
                  {i === 1 && <br />}
                </motion.span>
              ))}
              <motion.span
                initial={{ opacity: 0, y: 40, rotate: -4 }}
                animate={{ opacity: 1, y: 0, rotate: 0 }}
                transition={{ duration: 0.8, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
                className="relative inline-block italic text-hotpink-500"
              >
                placed.
                <svg className="absolute -bottom-3 left-0 w-full" viewBox="0 0 300 24" fill="none" preserveAspectRatio="none">
                  <motion.path
                    d="M4 16 C 60 4, 120 22, 180 12 S 270 6, 296 14"
                    stroke="currentColor"
                    strokeWidth="5"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.9, delay: 1.1, ease: "easeInOut" }}
                  />
                </svg>
              </motion.span>
            </h1>

            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={6}
              className="mt-8 max-w-lg text-lg leading-relaxed text-forest-600"
            >
              Campusly is where placement drives, applications and shortlists live. No spreadsheets,
              no lost emails, just one portal for students, recruiters and the TPO.
            </motion.p>

            {/* CTA: role cards for guests, dashboard link for logged-in users */}
            {user ? (
              <motion.div variants={fadeUp} initial="hidden" animate="show" custom={7} className="mt-10">
                <p className="text-sm text-forest-500">
                  Signed in as <span className="font-semibold text-forest-800">{user.name}</span> ·{" "}
                  {ROLE_LABEL[user.role]}
                </p>
                <Link to={NAV_BY_ROLE[user.role]?.[0]?.to || "/"} className={buttonClass("primary", "lg", "group mt-4")}>
                  Go to {NAV_BY_ROLE[user.role]?.[0]?.label || "dashboard"}
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </Link>
              </motion.div>
            ) : (
              <>
                <motion.div variants={fadeUp} initial="hidden" animate="show" custom={7} className="mt-10 grid gap-4 sm:grid-cols-2">
                  <RoleCTA
                    to="/signup?role=student"
                    icon={GraduationCap}
                    title="I'm a student"
                    text="Sign up and start applying"
                    dark
                  />
                  <RoleCTA to="/signup?role=recruiter" icon={Briefcase} title="I'm a recruiter" text="Register and post drives" />
                </motion.div>
                <motion.p variants={fadeUp} initial="hidden" animate="show" custom={8} className="mt-6 text-sm text-forest-500">
                  Already have an account?{" "}
                  <Link to="/login" className="font-semibold text-forest-800 underline decoration-hotpink-400 decoration-2 underline-offset-4 hover:text-hotpink-600">
                    Log in
                  </Link>{" "}
                  · TPO uses the same login.
                </motion.p>
              </>
            )}
          </div>

          {/* Right: illustration */}
          <HeroVisual />
        </div>
      </section>

      {/* ───────────── MARQUEE ───────────── */}
      <section className="relative -rotate-1 bg-forest-800 py-5 shadow-lift">
        <div className="flex overflow-hidden">
          <div className="flex shrink-0 animate-marquee items-center gap-10 pr-10">
            {[...MARQUEE, ...MARQUEE].map((item, i) => (
              <span key={i} className="flex items-center gap-10 whitespace-nowrap font-display text-2xl font-semibold text-cream-100 sm:text-3xl">
                {item}
                <Sparkles className="h-6 w-6 text-hotpink-400" />
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────── HOW IT WORKS ───────────── */}
      <section id="how" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-28 sm:px-8">
        <SectionHeading eyebrow="How it works" title="Three roles." accent="One placement season." />

        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {ROLES.map((r, i) => (
            <motion.div
              key={r.title}
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-80px" }}
              custom={i}
              whileHover={{ y: -8 }}
              className={`group relative overflow-hidden rounded-[2rem] p-8 transition-shadow duration-300 hover:shadow-lift ${
                r.featured ? "bg-forest-800 text-cream-100 lg:-translate-y-6" : "border border-cream-300 bg-cream-50"
              }`}
            >
              {r.featured && (
                <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-hotpink-500/30 blur-3xl" />
              )}
              <div
                className={`relative grid h-14 w-14 place-items-center rounded-2xl transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110 ${
                  r.featured ? "bg-hotpink-500 text-white shadow-glow" : "bg-forest-800 text-cream-100"
                }`}
              >
                <r.icon className="h-7 w-7" />
              </div>
              <h3 className={`relative mt-6 text-3xl font-bold ${r.featured ? "text-cream-100" : ""}`}>{r.title}</h3>
              <p className={`relative mt-1 font-display text-lg italic ${r.featured ? "text-hotpink-300" : "text-hotpink-600"}`}>
                {r.tagline}
              </p>
              <ul className="relative mt-6 space-y-3">
                {r.points.map((p) => (
                  <li key={p} className={`flex items-start gap-3 text-sm ${r.featured ? "text-cream-200" : "text-forest-600"}`}>
                    <CircleCheck className={`mt-0.5 h-4.5 w-4.5 shrink-0 ${r.featured ? "text-hotpink-400" : "text-forest-500"}`} />
                    {p}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ───────────── JOURNEY ───────────── */}
      <section id="journey" className="scroll-mt-24 bg-cream-100 py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <SectionHeading eyebrow="The journey" title="From sign-up" accent="to shortlist." />

          <div className="relative mt-16 grid gap-10 md:grid-cols-4 md:gap-6">
            {/* connecting line */}
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
              className="absolute left-[12%] right-[12%] top-8 hidden h-0.5 origin-left bg-[repeating-linear-gradient(90deg,var(--color-forest-300)_0_10px,transparent_10px_18px)] md:block"
            />
            {STEPS.map((s, i) => (
              <motion.div
                key={s.title}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-60px" }}
                custom={i + 1}
                className="relative text-center"
              >
                <div className="relative mx-auto grid h-16 w-16 place-items-center rounded-full bg-cream-50 shadow-soft ring-4 ring-cream-100">
                  <s.icon className="h-7 w-7 text-forest-700" />
                  <span className="absolute -right-1 -top-1 grid h-7 w-7 place-items-center rounded-full bg-hotpink-500 text-xs font-bold text-white shadow-glow">
                    {i + 1}
                  </span>
                </div>
                <h3 className="mt-6 text-2xl font-bold">{s.title}</h3>
                <p className="mx-auto mt-2 max-w-[15rem] text-sm text-forest-500">{s.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────── RECRUITERS ───────────── */}
      <section id="recruiters" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-28 sm:px-8">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="relative overflow-hidden rounded-[2.5rem] bg-forest-800 px-8 py-14 text-cream-100 sm:px-14 lg:py-20"
        >
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-hotpink-500/25 blur-3xl" />
          <div className="pointer-events-none absolute inset-0 bg-dots-light opacity-50" />
          <RotatingBadge text="HIRE FRESH TALENT • HIRE FRESH TALENT • " className="absolute -right-6 -top-6 hidden scale-90 lg:grid" />

          <div className="relative grid items-center gap-12 lg:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-hotpink-300">For recruiters</p>
              <h2 className="mt-4 text-4xl font-bold leading-tight text-cream-100 sm:text-5xl">
                Hiring from <span className="italic text-hotpink-400">{SITE.collegeName}?</span>
              </h2>
              <p className="mt-5 max-w-md text-cream-300/80">
                Register once, post your drive with a JD link, and get a clean list of applicants with
                their resumes. Shortlist in a click.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/signup?role=recruiter" className={buttonClass("primary", "lg", "group")}>
                  Register as recruiter <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </Link>
                <Link to="/login" className={buttonClass("light", "lg")}>
                  Log in
                </Link>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { icon: Megaphone, title: "Post drives", text: "Role, package, location, JD link." },
                { icon: Users, title: "See applicants", text: "Name, CGPA, department, resume." },
                { icon: ClipboardCheck, title: "Shortlist", text: "Mark status and add remarks." },
                { icon: Link2, title: "Links, not files", text: "Resumes and JDs are just links." },
              ].map((f, i) => (
                <motion.div
                  key={f.title}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true }}
                  custom={i + 1}
                  whileHover={{ scale: 1.03 }}
                  className="rounded-2xl border border-cream-100/10 bg-forest-700/60 p-5 backdrop-blur transition-colors hover:border-hotpink-400/50"
                >
                  <f.icon className="h-6 w-6 text-hotpink-400" />
                  <p className="mt-3 font-semibold">{f.title}</p>
                  <p className="mt-1 text-sm text-cream-300/70">{f.text}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* ───────────── FINAL CTA ───────────── */}
      {!user && (
        <section className="mx-auto max-w-4xl px-5 pb-28 text-center sm:px-8">
          <motion.h2
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="text-5xl font-bold leading-tight sm:text-6xl"
          >
            Your offer letter is <span className="italic text-hotpink-500">one sign-up</span> away.
          </motion.h2>
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            custom={1}
            className="mt-10 flex flex-wrap justify-center gap-3"
          >
            <Link to="/signup?role=student" className={buttonClass("primary", "lg", "group")}>
              Sign up as student <ArrowUpRight className="h-4 w-4 transition group-hover:rotate-45" />
            </Link>
            <Link to="/login" className={buttonClass("outline", "lg")}>
              I already have an account
            </Link>
          </motion.div>
        </section>
      )}
    </div>
  );
}

function SectionHeading({ eyebrow, title, accent }) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      className="max-w-2xl"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-hotpink-600">{eyebrow}</p>
      <h2 className="mt-4 text-5xl font-bold leading-[1.05] sm:text-6xl">
        {title} <span className="italic text-hotpink-500">{accent}</span>
      </h2>
    </motion.div>
  );
}

function RoleCTA({ to, icon: Icon, title, text, dark }) {
  return (
    <Link
      to={to}
      className={`group relative flex items-center gap-4 overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift ${
        dark ? "bg-forest-800 text-cream-100" : "border-2 border-forest-800 bg-cream-50 text-forest-800"
      }`}
    >
      <span
        className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl transition-transform duration-300 group-hover:rotate-[-8deg] group-hover:scale-110 ${
          dark ? "bg-hotpink-500 text-white" : "bg-forest-800 text-cream-100"
        }`}
      >
        <Icon className="h-6 w-6" />
      </span>
      <span className="flex-1">
        <span className="block font-display text-xl font-bold">{title}</span>
        <span className={`block text-sm ${dark ? "text-cream-300/80" : "text-forest-500"}`}>{text}</span>
      </span>
      <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
    </Link>
  );
}

function HeroVisual() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto h-[520px] w-full max-w-[460px]"
    >
      {/* Arch */}
      <div className="absolute inset-x-6 bottom-0 top-6 overflow-hidden rounded-t-full bg-forest-800 shadow-lift">
        <div className="absolute inset-0 bg-dots-light opacity-60" />
        <div className="absolute -bottom-20 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-hotpink-500/30 blur-3xl" />
      </div>

      {/* Drive card */}
      <motion.div
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-0 top-28 w-64 rounded-3xl bg-cream-50 p-5 shadow-lift"
      >
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-forest-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-forest-700">
            New drive
          </span>
          <span className="rounded-full bg-hotpink-50 px-3 py-1 text-[11px] font-semibold text-hotpink-700">Full-time</span>
        </div>
        <p className="mt-4 font-display text-2xl font-bold leading-tight">Software Engineer</p>
        <div className="mt-3 flex items-center gap-4 text-xs text-forest-500">
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" /> Bangalore
          </span>
          <span className="font-semibold text-forest-800">12 LPA</span>
        </div>
        <div className="mt-4 flex items-center justify-between rounded-2xl bg-cream-200 px-4 py-2.5">
          <span className="text-xs font-medium text-forest-600">Applications open</span>
          <span className="grid h-7 w-7 place-items-center rounded-full bg-hotpink-500 text-white">
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>
      </motion.div>

      {/* Status card */}
      <motion.div
        animate={{ y: [0, 12, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className="absolute bottom-16 right-0 w-60 rounded-3xl bg-cream-50 p-5 shadow-lift"
      >
        <p className="text-xs font-semibold uppercase tracking-wider text-forest-400">Your application</p>
        <div className="mt-4 space-y-3">
          {[
            { label: "Applied", done: true },
            { label: "TPO approved drive", done: true },
            { label: "Shortlisted", done: true, highlight: true },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1 + i * 0.35 }}
              className="flex items-center gap-3"
            >
              <span
                className={`grid h-6 w-6 place-items-center rounded-full ${
                  s.highlight ? "bg-hotpink-500 text-white shadow-glow" : "bg-forest-800 text-cream-100"
                }`}
              >
                <CircleCheck className="h-3.5 w-3.5" />
              </span>
              <span className={`text-sm ${s.highlight ? "font-bold text-hotpink-600" : "font-medium text-forest-700"}`}>
                {s.label}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Approved chip */}
      <motion.div
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1, rotate: [-3, 3, -3] }}
        transition={{ opacity: { delay: 0.9 }, scale: { delay: 0.9, type: "spring" }, rotate: { duration: 5, repeat: Infinity } }}
        className="absolute bottom-48 left-10 flex items-center gap-2 rounded-full bg-forest-950 px-4 py-2 text-xs font-semibold text-cream-100 shadow-lift"
      >
        <ShieldCheck className="h-4 w-4 text-hotpink-400" /> Verified by TPO
      </motion.div>

      {/* Spinning badge */}
      <RotatingBadge className="absolute -top-2 right-2" />
    </motion.div>
  );
}
