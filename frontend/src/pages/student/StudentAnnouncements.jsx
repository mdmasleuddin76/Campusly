import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Megaphone } from "lucide-react";
import { toast } from "sonner";
import api, { errorMessage } from "../../api/axios";
import PageHeader from "../../components/PageHeader";
import AnnouncementCard from "../../components/AnnouncementCard";
import SearchInput from "../../components/ui/SearchInput";
import EmptyState from "../../components/ui/EmptyState";
import { Skeleton } from "../../components/ui/Skeleton";

export default function StudentAnnouncements() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

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

  return (
    <section className="mx-auto max-w-4xl px-5 py-12 sm:px-8">
      <PageHeader
        eyebrow="Announcements"
        title="Straight from"
        accent="the TPO."
        subtitle="Drive dates, deadlines, results and everything else the placement cell wants you to know."
      />

      {items.length > 0 && (
        <SearchInput value={query} onChange={setQuery} placeholder="Search announcements..." className="mt-10 sm:max-w-sm" />
      )}

      <div className="mt-6">
        {loading ? (
          <div className="space-y-4">
            {[0, 1, 2].map((i) => <Skeleton key={i} className="h-36 rounded-3xl" />)}
          </div>
        ) : items.length === 0 ? (
          <EmptyState icon={Megaphone} title="All quiet for now" text="When the placement cell posts something, it'll show up here." />
        ) : visible.length === 0 ? (
          <EmptyState icon={Megaphone} title="No matches" text={`Nothing matches "${query}".`} />
        ) : (
          <motion.div layout className="space-y-4">
            <AnimatePresence mode="popLayout">
              {visible.map((a, i) => (
                <AnnouncementCard key={a._id} item={a} index={i} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </section>
  );
}
