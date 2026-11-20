import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Briefcase, Check, Clock, GraduationCap, PartyPopper, Users, X } from "lucide-react";
import { toast } from "sonner";
import api, { errorMessage } from "../../api/axios";
import PageHeader from "../../components/PageHeader";
import StatCard from "../../components/StatCard";
import Avatar from "../../components/Avatar";
import UserInfo from "../../components/tpo/UserInfo";
import Tabs from "../../components/ui/Tabs";
import SearchInput from "../../components/ui/SearchInput";
import EmptyState from "../../components/ui/EmptyState";
import { CardSkeletons } from "../../components/ui/Skeleton";
import { timeAgo } from "../../utils/format";

const matches = (u, q) => {
  if (!q) return true;
  const text = [u.name, u.email, u.student?.rollNo, u.student?.department, u.recruiter?.companyName]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return text.includes(q.toLowerCase());
};

export default function Approvals() {
  const [users, setUsers] = useState([]);
  const [pendingJobs, setPendingJobs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("STUDENT");
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(null); // "<id>:<status>" while a request runs

  useEffect(() => {
    Promise.all([api.get("/tpo/users", { params: { status: "PENDING" } }), api.get("/tpo/jobs", { params: { status: "PENDING" } })])
      .then(([u, j]) => {
        setUsers(u.data.data);
        setPendingJobs(j.data.count);
      })
      .catch((err) => toast.error(errorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const students = users.filter((u) => u.role === "STUDENT");
  const recruiters = users.filter((u) => u.role === "RECRUITER");
  const visible = useMemo(
    () => users.filter((u) => u.role === tab && matches(u, query)),
    [users, tab, query]
  );

  const setStatus = (id, status) => api.patch(`/tpo/users/${id}/status`, { status });

  const decide = async (user, status) => {
    setBusy(`${user._id}:${status}`);
    try {
      await setStatus(user._id, status);
      setUsers((prev) => prev.filter((u) => u._id !== user._id));
      toast.success(`${user.name} ${status === "APPROVED" ? "approved" : "rejected"}`, {
        description: status === "APPROVED" ? "They can log in now." : "They won't be able to log in.",
        action: {
          label: "Undo",
          onClick: async () => {
            try {
              await setStatus(user._id, "PENDING");
              setUsers((prev) => [user, ...prev]);
              toast("Moved back to pending");
            } catch (err) {
              toast.error(errorMessage(err));
            }
          },
        },
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
        title="Pending"
        accent="approvals."
        subtitle="New students and recruiters wait here until you approve them. Approved accounts can log in straight away."
      />

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        <StatCard icon={GraduationCap} label="Students waiting" value={loading ? "…" : students.length} tone="forest" index={0} />
        <StatCard icon={Briefcase} label="Recruiters waiting" value={loading ? "…" : recruiters.length} tone="pink" index={1} />
        <StatCard icon={Clock} label="Job drives to review" value={pendingJobs ?? "…"} to="/tpo/jobs" index={2} />
      </div>

      <div className="mt-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <Tabs
          id="approvals"
          value={tab}
          onChange={setTab}
          tabs={[
            { key: "STUDENT", label: "Students", icon: GraduationCap, count: students.length },
            { key: "RECRUITER", label: "Recruiters", icon: Briefcase, count: recruiters.length },
          ]}
        />
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder={tab === "STUDENT" ? "Search name, email, roll no..." : "Search name, email, company..."}
          className="lg:w-80"
        />
      </div>

      <div className="mt-8">
        {loading ? (
          <CardSkeletons count={3} />
        ) : visible.length === 0 ? (
          query ? (
            <EmptyState icon={Users} title="No matches" text={`Nobody pending matches "${query}".`} />
          ) : (
            <EmptyState
              icon={PartyPopper}
              title="All caught up!"
              text={`No ${tab === "STUDENT" ? "students" : "recruiters"} are waiting for approval right now.`}
            />
          )
        ) : (
          <motion.div layout className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {visible.map((u, i) => (
                <motion.article
                  key={u._id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: Math.min(i, 8) * 0.05 } }}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.25 } }}
                  className="flex flex-col rounded-3xl border border-cream-300 bg-cream-50 p-6 transition-shadow hover:shadow-lift"
                >
                  <div className="flex items-start gap-3">
                    <Avatar name={u.name} role={u.role} />
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-sans text-lg font-semibold">{u.name}</h3>
                      <p className="truncate text-sm text-forest-500">{u.email}</p>
                    </div>
                    {u.profileUpdatedAt ? (
                      <span
                        title="This student edited their profile and needs re-approval"
                        className="shrink-0 rounded-full bg-hotpink-100 px-2.5 py-1 text-[11px] font-semibold text-hotpink-800"
                      >
                        Profile updated {timeAgo(u.profileUpdatedAt)}
                      </span>
                    ) : (
                      <span className="shrink-0 rounded-full bg-cream-200 px-2.5 py-1 text-[11px] font-medium text-forest-500">
                        {timeAgo(u.createdAt)}
                      </span>
                    )}
                  </div>

                  <div className="mt-5 flex-1">
                    <UserInfo user={u} />
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <button
                      onClick={() => decide(u, "REJECTED")}
                      disabled={!!busy}
                      className="flex cursor-pointer items-center justify-center gap-2 rounded-full border-2 border-hotpink-200 py-2.5 text-sm font-semibold text-hotpink-700 transition hover:border-hotpink-500 hover:bg-hotpink-500 hover:text-white disabled:opacity-50"
                    >
                      <X className="h-4 w-4" /> {busy === `${u._id}:REJECTED` ? "Rejecting..." : "Reject"}
                    </button>
                    <button
                      onClick={() => decide(u, "APPROVED")}
                      disabled={!!busy}
                      className="flex cursor-pointer items-center justify-center gap-2 rounded-full bg-forest-800 py-2.5 text-sm font-semibold text-cream-100 shadow-soft transition hover:-translate-y-0.5 hover:bg-forest-700 disabled:opacity-50"
                    >
                      <Check className="h-4 w-4" /> {busy === `${u._id}:APPROVED` ? "Approving..." : "Approve"}
                    </button>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </section>
  );
}
