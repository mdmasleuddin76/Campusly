import { motion } from "motion/react";
import { ExternalLink, Megaphone, Pencil, Trash2 } from "lucide-react";
import { formatDate, timeAgo } from "../utils/format";

const isNew = (d) => Date.now() - new Date(d).getTime() < 3 * 24 * 60 * 60 * 1000; // last 3 days

// One announcement. Pass onEdit/onDelete to show TPO actions (students see it without them).
export default function AnnouncementCard({ item, index = 0, onEdit, onDelete, preview = false }) {
  const edited = item.updatedAt && item.createdAt && new Date(item.updatedAt) - new Date(item.createdAt) > 60 * 1000;
  const MotionTag = preview ? "article" : motion.article;
  const motionProps = preview
    ? {}
    : {
        layout: true,
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0, transition: { delay: Math.min(index, 8) * 0.05 } },
        exit: { opacity: 0, x: -40, transition: { duration: 0.25 } },
      };

  return (
    <MotionTag
      {...motionProps}
      className="group relative overflow-hidden rounded-3xl border border-cream-300 bg-cream-50 p-6 transition-shadow hover:shadow-lift sm:p-7"
    >
      <div className="absolute inset-y-0 left-0 w-1.5 bg-hotpink-500 opacity-0 transition-opacity group-hover:opacity-100" />

      <div className="flex items-start gap-4">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-forest-800 text-cream-100 transition-transform duration-300 group-hover:-rotate-6">
          <Megaphone className="h-5 w-5" />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 text-xs text-forest-500">
            <span className="font-semibold text-forest-700">{formatDate(item.createdAt)}</span>
            <span>· {timeAgo(item.createdAt)}</span>
            {isNew(item.createdAt) && (
              <span className="rounded-full bg-hotpink-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">New</span>
            )}
            {edited && <span className="italic text-forest-400">· edited</span>}
          </div>

          <h3 className="mt-2 font-display text-2xl font-bold leading-snug">{item.title || "Untitled announcement"}</h3>

          {item.description && (
            <p className="mt-2 whitespace-pre-line leading-relaxed text-forest-600">{item.description}</p>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-3">
            {item.link && (
              <a
                href={item.link}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-hotpink-50 px-3.5 py-1.5 text-sm font-semibold text-hotpink-700 ring-1 ring-hotpink-200 transition hover:bg-hotpink-500 hover:text-white"
              >
                Open link <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
            {item.createdBy?.name && <span className="text-xs text-forest-400">Posted by {item.createdBy.name}</span>}
          </div>
        </div>

        {(onEdit || onDelete) && (
          <div className="flex shrink-0 gap-1.5 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
            {onEdit && (
              <button
                onClick={() => onEdit(item)}
                className="grid h-10 w-10 cursor-pointer place-items-center rounded-full bg-cream-200 text-forest-700 transition hover:bg-forest-800 hover:text-cream-100"
                aria-label="Edit"
                title="Edit"
              >
                <Pencil className="h-4 w-4" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(item)}
                className="grid h-10 w-10 cursor-pointer place-items-center rounded-full bg-cream-200 text-hotpink-700 transition hover:bg-hotpink-500 hover:text-white"
                aria-label="Delete"
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </MotionTag>
  );
}
