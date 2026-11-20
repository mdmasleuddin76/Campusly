import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowDownUp, Briefcase, Check, ChevronRight, Clock, GraduationCap, RotateCcw, UserSearch, Users as UsersIcon, X } from "lucide-react";
import { toast } from "sonner";
import api, { errorMessage } from "../../api/axios";
import PageHeader from "../../components/PageHeader";
import StatCard from "../../components/StatCard";
import Avatar from "../../components/Avatar";
import UserInfo from "../../components/tpo/UserInfo";
import Tabs from "../../components/ui/Tabs";
import SearchInput from "../../components/ui/SearchInput";
import StatusBadge from "../../components/ui/StatusBadge";
import EmptyState from "../../components/ui/EmptyState";
import Drawer from "../../components/ui/Drawer";
import { Skeleton } from "../../components/ui/Skeleton";
import { formatDate } from "../../utils/format";
import { DEPARTMENTS, ROLE_LABEL } from "../../config/site";

const PAGE_SIZE = 20;
const STATUS_FILTERS = ["ALL", "APPROVED", "PENDING", "REJECTED"];
const SORTS = { newest: "Newest first", name: "Name A–Z", cgpa: "CGPA high → low" };

const searchText = (u) =>
  [u.name, u.email, u.phone, u.student?.rollNo, u.student?.department, u.recruiter?.companyName, u.recruiter?.designation]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [department, setDepartment] = useState("");
  const [sort, setSort] = useState("newest");
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [selectedId, setSelectedId] = useState(null);
  const [busy, setBusy] = useState(null);

  useEffect(() => {
    api
      .get("/tpo/users")
      .then((res) => setUsers(res.data.data))
      .catch((err) => toast.error(errorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  // reset paging when filters change
  useEffect(() => setLimit(PAGE_SIZE), [role, status, department, query, sort]);

  const counts = useMemo(
    () => ({
      ALL: users.length,
      STUDENT: users.filter((u) => u.role === "STUDENT").length,
      RECRUITER: users.filter((u) => u.role === "RECRUITER").length,
      PENDING: users.filter((u) => u.status === "PENDING").length,
    }),
    [users]
  );

  // All filtering happens here in the browser
  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    const list = users.filter(
      (u) =>
        (role === "ALL" || u.role === role) &&
        (status === "ALL" || u.status === status) &&
        (!department || u.student?.department === department) &&
        (!q || searchText(u).includes(q))
    );
    if (sort === "name") list.sort((a, b) => a.name.localeCompare(b.name));
    else if (sort === "cgpa") list.sort((a, b) => (b.student?.cgpa ?? -1) - (a.student?.cgpa ?? -1));
    else list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return list;
  }, [users, role, status, department, query, sort]);

  const selected = users.find((u) => u._id === selectedId);

  const changeStatus = async (user, newStatus) => {
    setBusy(newStatus);
    try {
      await api.patch(`/tpo/users/${user._id}/status`, { status: newStatus });
      setUsers((prev) => prev.map((u) => (u._id === user._id ? { ...u, status: newStatus } : u)));
      toast.success(`${user.name} is now ${newStatus.toLowerCase()}`);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(null);
    }
  };

  const onRoleChange = (r) => {
    setRole(r);
    if (r !== "STUDENT") {
      setDepartment("");
      if (sort === "cgpa") setSort("newest");
    }
  };

  return (
    <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
      <PageHeader
        eyebrow="TPO dashboard"
        title="Everyone on"
        accent="Campusly."
        subtitle="All students and recruiters in one place. Filter, search, and open anyone to see their full details."
      />

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={UsersIcon} label="Total users" value={loading ? "…" : counts.ALL} tone="forest" index={0} />
        <StatCard icon={GraduationCap} label="Students" value={loading ? "…" : counts.STUDENT} index={1} />
        <StatCard icon={Briefcase} label="Recruiters" value={loading ? "…" : counts.RECRUITER} index={2} />
        <StatCard icon={Clock} label="Pending approval" value={loading ? "…" : counts.PENDING} tone="pink" to="/tpo/approvals" index={3} />
      </div>

      {/* Filters */}
      <div className="mt-10 space-y-4 rounded-3xl border border-cream-300 bg-cream-50/70 p-4 backdrop-blur sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <Tabs
            id="users-role"
            value={role}
            onChange={onRoleChange}
            tabs={[
              { key: "ALL", label: "All", count: counts.ALL },
              { key: "STUDENT", label: "Students", icon: GraduationCap, count: counts.STUDENT },
              { key: "RECRUITER", label: "Recruiters", icon: Briefcase, count: counts.RECRUITER },
            ]}
          />
          <SearchInput value={query} onChange={setQuery} placeholder="Search name, email, roll no, company..." className="lg:w-96" />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs font-semibold uppercase tracking-wider text-forest-400">Status</span>
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`cursor-pointer rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                status === s
                  ? "bg-hotpink-500 text-white shadow-glow"
                  : "bg-cream-200 text-forest-600 hover:bg-cream-300"
              }`}
            >
              {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}

          <div className="ml-auto flex flex-wrap items-center gap-2">
            <AnimatePresence>
              {role === "STUDENT" && (
                <motion.select
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="cursor-pointer rounded-full border border-cream-300 bg-cream-50 px-3.5 py-1.5 text-xs font-semibold text-forest-700 outline-none focus:border-forest-500"
                >
                  <option value="">All departments</option>
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </motion.select>
              )}
            </AnimatePresence>
            <label className="relative">
              <ArrowDownUp className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-forest-400" />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="cursor-pointer appearance-none rounded-full border border-cream-300 bg-cream-50 py-1.5 pl-8 pr-4 text-xs font-semibold text-forest-700 outline-none focus:border-forest-500"
              >
                {Object.entries(SORTS)
                  .filter(([k]) => k !== "cgpa" || role === "STUDENT")
                  .map(([k, label]) => (
                    <option key={k} value={k}>
                      {label}
                    </option>
                  ))}
              </select>
            </label>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="mt-6">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-2xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={UserSearch} title="No one found" text="Try a different filter or search term." />
        ) : (
          <>
            <p className="mb-3 text-sm text-forest-500">
              Showing <span className="font-semibold text-forest-800">{Math.min(limit, filtered.length)}</span> of{" "}
              {filtered.length}
            </p>

            {/* Desktop table */}
            <div className="hidden overflow-hidden rounded-3xl border border-cream-300 bg-cream-50 shadow-soft md:block">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-forest-800 text-xs uppercase tracking-wider text-cream-200">
                    <th className="px-6 py-4 font-semibold">User</th>
                    <th className="px-4 py-4 font-semibold">Role</th>
                    <th className="px-4 py-4 font-semibold">Details</th>
                    <th className="px-4 py-4 font-semibold">Status</th>
                    <th className="px-4 py-4 font-semibold">Joined</th>
                    <th className="w-12 px-4 py-4" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.slice(0, limit).map((u, i) => (
                    <motion.tr
                      key={u._id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(i, 12) * 0.025 }}
                      onClick={() => setSelectedId(u._id)}
                      className="group cursor-pointer border-t border-cream-200 transition-colors hover:bg-hotpink-50/60"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={u.name} role={u.role} size="sm" />
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-forest-800">{u.name}</p>
                            <p className="truncate text-xs text-forest-500">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            u.role === "STUDENT" ? "bg-forest-100 text-forest-800" : "bg-hotpink-100 text-hotpink-800"
                          }`}
                        >
                          {ROLE_LABEL[u.role]}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-forest-600">
                        {u.role === "STUDENT" ? (
                          <>
                            <span className="font-semibold text-forest-800">{u.student?.rollNo}</span> · {u.student?.department} · CGPA{" "}
                            <span className="font-semibold text-forest-800">{u.student?.cgpa}</span> · Backlogs{" "}
                            <span className="font-semibold text-forest-800">{u.student?.backlogs ?? "–"}</span>
                          </>
                        ) : (
                          <>
                            <span className="font-semibold text-forest-800">{u.recruiter?.companyName}</span> · {u.recruiter?.designation}
                          </>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge status={u.status} />
                      </td>
                      <td className="px-4 py-4 text-sm text-forest-500">{formatDate(u.createdAt)}</td>
                      <td className="px-4 py-4">
                        <ChevronRight className="h-5 w-5 text-forest-300 transition group-hover:translate-x-1 group-hover:text-hotpink-500" />
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="space-y-3 md:hidden">
              {filtered.slice(0, limit).map((u) => (
                <button
                  key={u._id}
                  onClick={() => setSelectedId(u._id)}
                  className="flex w-full cursor-pointer items-center gap-3 rounded-2xl border border-cream-300 bg-cream-50 p-4 text-left transition active:scale-[0.99]"
                >
                  <Avatar name={u.name} role={u.role} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{u.name}</p>
                    <p className="truncate text-xs text-forest-500">
                      {u.role === "STUDENT" ? `${u.student?.rollNo} · ${u.student?.department}` : u.recruiter?.companyName}
                    </p>
                  </div>
                  <StatusBadge status={u.status} />
                </button>
              ))}
            </div>

            {limit < filtered.length && (
              <div className="mt-6 text-center">
                <button
                  onClick={() => setLimit((l) => l + PAGE_SIZE)}
                  className="cursor-pointer rounded-full border-2 border-forest-800 px-6 py-2.5 text-sm font-semibold text-forest-800 transition hover:bg-forest-800 hover:text-cream-100"
                >
                  Show more ({filtered.length - limit} left)
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Details drawer */}
      <Drawer open={!!selected} onClose={() => setSelectedId(null)} title={selected ? ROLE_LABEL[selected.role] : ""}>
        {selected && (
          <div>
            <div className="flex items-center gap-4">
              <Avatar name={selected.name} role={selected.role} size="lg" />
              <div className="min-w-0">
                <h3 className="truncate text-2xl font-bold">{selected.name}</h3>
                <div className="mt-1.5 flex items-center gap-2">
                  <StatusBadge status={selected.status} />
                  <span className="text-xs text-forest-500">Joined {formatDate(selected.createdAt)}</span>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <UserInfo user={selected} full />
            </div>

            <div className="mt-8 rounded-3xl bg-cream-200 p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-forest-500">Account status</p>
              <p className="mt-1 text-sm text-forest-600">
                Approved users can log in. Rejected or pending users can't.
              </p>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {[
                  { s: "APPROVED", label: "Approve", icon: Check, active: "bg-forest-800 text-cream-100" },
                  { s: "PENDING", label: "Pending", icon: RotateCcw, active: "bg-cream-600 text-white" },
                  { s: "REJECTED", label: "Reject", icon: X, active: "bg-hotpink-500 text-white" },
                ].map(({ s, label, icon: Icon, active }) => (
                  <button
                    key={s}
                    onClick={() => selected.status !== s && changeStatus(selected, s)}
                    disabled={!!busy}
                    className={`flex cursor-pointer flex-col items-center gap-1 rounded-2xl py-3 text-xs font-semibold transition disabled:opacity-60 ${
                      selected.status === s ? `${active} shadow-soft` : "bg-cream-50 text-forest-600 hover:bg-white"
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${busy === s ? "animate-spin" : ""}`} />
                    {selected.status === s ? (s === "APPROVED" ? "Approved" : s === "REJECTED" ? "Rejected" : "Pending") : label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </section>
  );
}
