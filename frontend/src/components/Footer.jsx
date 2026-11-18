import { Link } from "react-router-dom";
import { ArrowUpRight, Mail } from "lucide-react";
import Logo from "./Logo";
import { SITE } from "../config/site";

// Slimmer footer for inner pages (dashboards)
function CompactFooter({ year }) {
  return (
    <footer className="relative overflow-hidden bg-forest-800 text-cream-200">
      <div className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-hotpink-500/20 blur-3xl" />
      <div className="relative mx-auto grid max-w-7xl gap-6 px-5 py-8 sm:px-8 md:grid-cols-[1.2fr_1fr_auto] md:items-center">
        <div>
          <p className="font-display text-2xl font-bold text-cream-100">
            campusly<span className="text-hotpink-400">.</span>
          </p>
          <p className="mt-1 max-w-sm text-sm text-cream-300/70">
            {SITE.cellName}, {SITE.collegeName}. Drives, applications and shortlists in one place.
          </p>
        </div>
        <p className="font-display text-lg italic text-cream-100/90">
          "Every offer starts with <span className="text-hotpink-400">one application.</span>"
        </p>
        <div className="flex flex-col items-start gap-2 text-sm md:items-end">
          <a
            href={`mailto:${SITE.email}`}
            className="inline-flex items-center gap-2 rounded-full border border-cream-200/20 px-4 py-2 transition hover:border-hotpink-400 hover:text-hotpink-300"
          >
            <Mail className="h-4 w-4" /> {SITE.email}
          </a>
          <p className="text-xs text-cream-300/50">© {year} Campusly · Made with <span className="text-hotpink-400">♥</span></p>
        </div>
      </div>
    </footer>
  );
}

export default function Footer({ compact = false }) {
  const year = new Date().getFullYear();
  if (compact) return <CompactFooter year={year} />;

  return (
    <footer className="relative overflow-hidden bg-forest-900 text-cream-200">
      {/* soft pink glow */}
      <div className="pointer-events-none absolute -top-32 right-0 h-80 w-80 rounded-full bg-hotpink-500/20 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-5 pb-10 pt-20 sm:px-8">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <Logo light />
            <p className="mt-5 max-w-sm text-cream-300/80">
              The {SITE.cellName.toLowerCase()} portal of {SITE.collegeName}. Drives, applications and
              shortlists, all in one place.
            </p>
            <a
              href={`mailto:${SITE.email}`}
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-cream-200/20 px-4 py-2 text-sm transition hover:border-hotpink-400 hover:text-hotpink-300"
            >
              <Mail className="h-4 w-4" /> {SITE.email}
            </a>
          </div>

          <div className="md:col-span-3">
            <h4 className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-cream-100">Get started</h4>
            <ul className="mt-5 space-y-3 text-sm">
              {[
                { to: "/signup?role=student", label: "Student sign-up" },
                { to: "/signup?role=recruiter", label: "Recruiter sign-up" },
                { to: "/login", label: "Log in" },
              ].map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="group inline-flex items-center gap-1 text-cream-300/80 transition hover:text-hotpink-300">
                    {l.label}
                    <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition group-hover:opacity-100" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-4">
            <h4 className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-cream-100">One portal for</h4>
            <ul className="mt-5 space-y-3 text-sm text-cream-300/80">
              <li>Students: apply and track every application</li>
              <li>Recruiters: post drives and shortlist</li>
              <li>TPO: approve, announce and oversee</li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-cream-200/10 pt-8 text-xs text-cream-300/60 sm:flex-row sm:items-center">
          <p>© {year} Campusly · {SITE.collegeName}</p>
          <p>
            Made with <span className="text-hotpink-400">♥</span> for placement season
          </p>
        </div>
      </div>

      {/* Big outlined wordmark */}
      <p
        aria-hidden
        className="pointer-events-none select-none text-center font-display text-[22vw] font-bold leading-[0.75] tracking-tighter text-transparent"
        style={{ WebkitTextStroke: "1px rgb(244 234 213 / 0.08)" }}
      >
        campusly
      </p>
    </footer>
  );
}
