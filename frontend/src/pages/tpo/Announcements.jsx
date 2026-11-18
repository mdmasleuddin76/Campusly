import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CalendarClock, Link2, Megaphone, Plus, Send, Sparkles, Trash2, Type } from "lucide-react";
import { toast } from "sonner";
import api, { errorMessage } from "../../api/axios";
import PageHeader from "../../components/PageHeader";
import StatCard from "../../components/StatCard";
import AnnouncementCard from "../../components/AnnouncementCard";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import SearchInput from "../../components/ui/SearchInput";
import EmptyState from "../../components/ui/EmptyState";
import { Input, Textarea } from "../../components/ui/Field";
import { Skeleton } from "../../components/ui/Skeleton";
import { useAuth } from "../../context/AuthContext";

const EMPTY = { title: "", description: "", link: "" };
const TITLE_MAX = 120;
const DESC_MAX = 1000;
const WEEK = 7 * 24 * 60 * 60 * 1000;

const isUrl = (v) => {
  try {
    const u = new URL(v);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
};

export default function Announcements() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  // form modal
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null); // announcement being edited, or null for new
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // delete confirm
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    api
      .get("/announcements")
      .then((res) => setItems(res.data.data))
      .catch((err) => toast.error(errorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const visible = useMemo(() => {
    const q = query.toLowerCase();
    return items.filter((a) => !q || `${a.title} ${a.description || ""}`.toLowerCase().includes(q));
  }, [items, query]);

  const thisWeek = items.filter((a) => Date.now() - new Date(a.createdAt).getTime() < WEEK).length;
  const withLinks = items.filter((a) => a.link).length;

  const openNew = () => {
    setEditing(null);
    setForm(EMPTY);
    setErrors({});
    setFormOpen(true);
  };

  const openEdit = (a) => {
    setEditing(a);
    setForm({ title: a.title || "", description: a.description || "", link: a.link || "" });
    setErrors({});
    setFormOpen(true);
  };

  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = "Give it a title";
    else if (form.title.length > TITLE_MAX) e.title = `Keep it under ${TITLE_MAX} characters`;
    if (form.description.length > DESC_MAX) e.description = `Keep it under ${DESC_MAX} characters`;
    if (form.link && !isUrl(form.link.trim())) e.link = "Must start with http:// or https://";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const body = { title: form.title.trim(), description: form.description.trim(), link: form.link.trim() };
    setSaving(true);
    try {
      if (editing) {
        const res = await api.put(`/announcements/${editing._id}`, body);
        setItems((prev) => prev.map((a) => (a._id === editing._id ? { ...a, ...res.data.data, createdBy: a.createdBy } : a)));
        toast.success("Announcement updated");
      } else {
        const res = await api.post("/announcements", body);
        setItems((prev) => [{ ...res.data.data, createdBy: { name: user.name } }, ...prev]);
        toast.success("Announcement posted", { description: "Every student can see it now." });
      }
      setFormOpen(false);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/announcements/${toDelete._id}`);
      setItems((prev) => prev.filter((a) => a._id !== toDelete._id));
      toast.success("Announcement deleted");
      setToDelete(null);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  // What the card will look like, shown live while typing
  const previewItem = {
    ...form,
    createdAt: editing?.createdAt || new Date().toISOString(),
    updatedAt: editing ? new Date().toISOString() : undefined,
    createdBy: { name: editing?.createdBy?.name || user?.name },
  };

  return (
    <section className="mx-auto max-w-5xl px-5 py-12 sm:px-8">
      <PageHeader
        eyebrow="TPO dashboard"
        title="Announce"
        accent="it loud."
        subtitle="Post updates for every student: drive dates, deadlines, results, anything. Newest shows first."
      >
        <Button size="lg" onClick={openNew} className="group">
          <Plus className="h-5 w-5 transition group-hover:rotate-90" /> New announcement
        </Button>
      </PageHeader>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        <StatCard icon={Megaphone} label="Total announcements" value={loading ? "…" : items.length} tone="forest" index={0} />
        <StatCard icon={CalendarClock} label="Posted this week" value={loading ? "…" : thisWeek} tone="pink" index={1} />
        <StatCard icon={Link2} label="With a link" value={loading ? "…" : withLinks} index={2} />
      </div>

      {items.length > 0 && (
        <SearchInput value={query} onChange={setQuery} placeholder="Search announcements..." className="mt-10 sm:max-w-sm" />
      )}

      <div className="mt-6">
        {loading ? (
          <div className="space-y-4">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-36 rounded-3xl" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState icon={Megaphone} title="Nothing announced yet" text="Your first announcement will show up on every student's home page.">
            <Button onClick={openNew}>
              <Plus className="h-4 w-4" /> Write the first one
            </Button>
          </EmptyState>
        ) : visible.length === 0 ? (
          <EmptyState icon={Megaphone} title="No matches" text={`Nothing matches "${query}".`} />
        ) : (
          <motion.div layout className="space-y-4">
            <AnimatePresence mode="popLayout">
              {visible.map((a, i) => (
                <AnnouncementCard key={a._id} item={a} index={i} onEdit={openEdit} onDelete={setToDelete} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Create / edit */}
      <Modal
        open={formOpen}
        onClose={() => !saving && setFormOpen(false)}
        title={editing ? "Edit announcement" : "New announcement"}
        subtitle={editing ? "Changes show up for students straight away." : "Students will see this on their home page."}
        size="lg"
      >
        <div className="grid gap-8 lg:grid-cols-2">
          <form onSubmit={onSubmit} noValidate className="space-y-5">
            <div>
              <Input
                id="title"
                name="title"
                label="Title"
                icon={Type}
                placeholder="Infosys drive on 24 Nov: register by Friday"
                value={form.title}
                onChange={onChange}
                error={errors.title}
                autoFocus
              />
              <p className={`mt-1 text-right text-[11px] ${form.title.length > TITLE_MAX ? "text-hotpink-600" : "text-forest-400"}`}>
                {form.title.length}/{TITLE_MAX}
              </p>
            </div>
            <div>
              <Textarea
                id="description"
                name="description"
                label="Details (optional)"
                placeholder="Venue, timings, who's eligible, what to bring..."
                rows={6}
                value={form.description}
                onChange={onChange}
                error={errors.description}
              />
              <p className={`mt-1 text-right text-[11px] ${form.description.length > DESC_MAX ? "text-hotpink-600" : "text-forest-400"}`}>
                {form.description.length}/{DESC_MAX}
              </p>
            </div>
            <Input
              id="link"
              name="link"
              label="Link (optional)"
              icon={Link2}
              placeholder="https://forms.gle/..."
              value={form.link}
              onChange={onChange}
              error={errors.link}
              hint="A form, a PDF on Drive, a results sheet..."
            />

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)} disabled={saving} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" loading={saving} className="flex-1">
                {!saving && <Send className="h-4 w-4" />}
                {editing ? (saving ? "Saving..." : "Save changes") : saving ? "Posting..." : "Post it"}
              </Button>
            </div>
          </form>

          {/* Live preview */}
          <div className="hidden lg:block">
            <p className="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-hotpink-600">
              <Sparkles className="h-3.5 w-3.5" /> Live preview
            </p>
            <div className="rounded-3xl bg-cream-200 bg-dots p-4">
              <AnnouncementCard item={previewItem} preview />
            </div>
            <p className="mt-3 text-xs text-forest-400">This is how students will see it.</p>
          </div>
        </div>
      </Modal>

      {/* Delete confirm */}
      <Modal open={!!toDelete} onClose={() => !deleting && setToDelete(null)} title="Delete announcement?" size="sm">
        <div className="flex items-start gap-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-hotpink-100 text-hotpink-700">
            <Trash2 className="h-5 w-5" />
          </span>
          <p className="text-forest-600">
            <span className="font-semibold text-forest-800">"{toDelete?.title}"</span> will be removed for everyone. This can't be undone.
          </p>
        </div>
        <div className="mt-7 flex gap-3">
          <Button variant="outline" onClick={() => setToDelete(null)} disabled={deleting} className="flex-1">
            Keep it
          </Button>
          <button
            onClick={confirmDelete}
            disabled={deleting}
            className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-full bg-hotpink-600 py-3 text-sm font-semibold text-white shadow-glow transition hover:bg-hotpink-700 disabled:opacity-60"
          >
            <Trash2 className="h-4 w-4" /> {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </Modal>
    </section>
  );
}
